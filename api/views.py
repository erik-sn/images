import json
import requests
import os
import shutil

from django.conf import settings
from django.urls import reverse
from django.shortcuts import get_object_or_404
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework_jwt.views import obtain_jwt_token
from rest_framework import status
from rest_framework.decorators import detail_route, list_route

from api.models import User, Search, Image
from api.serializers import UserSerializer, UserEditSerializer, SearchSerializer, SearchMergeSerializer, ImageSerializer
from search.models import Argument
from search.search import download_google_images

WRITE_VERBS = ['POST', 'PUT']


@api_view(['GET'])
@permission_classes((AllowAny, ))
def pulse(request: Request) -> Response:
    """
    Public view for a client to check that the API is active
    """
    return Response(True)


class UserView(viewsets.ModelViewSet):
    """
    View to create users
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_serializer_class(self): 
        serializer_class = self.serializer_class
        if self.request.method == 'PUT': 
            serializer_class = UserEditSerializer 
        return serializer_class
    
    def create(self, request: Request, *args, **kwargs) -> Response:
        """
        create a new user and give them a jwt token
        """
        response = super(UserView, self).create(request, *args, **kwargs)
        if response.status_code == 201:
            response.data['token'] = self.get_jwt_token(request)
        return response

    @staticmethod
    def get_jwt_token(request: Request) -> str:
        """
        generate a JWT token from the local server endpoint based on the
        request's name and password fields
        """
        url = 'http://localhost:{}{}'.format(request.META.get('SERVER_PORT', 80), reverse(obtain_jwt_token))
        auth_data = {
            'first': request.data.get('first', None),
            'last': request.data.get('last', None),
            'city': request.data.get('city', None),
            'password': request.data.get('password', None),
        }
        headers = {'Accept': 'application/json', 'Content-Type': 'application/json'}
        response = requests.post(url, data=json.dumps(auth_data), headers=headers)
        if response.status_code == 200:
            return response.json().get('token', None)
        else:
            print(response.content)
        return ''


class SearchView(viewsets.ModelViewSet):
    """
    View to create users
    """
    queryset = Search.objects.all()
    serializer_class = SearchSerializer

    def build_images(self, successful_image_saves):
        created_image_objects = []
        for image_file_path, img_url in successful_image_saves:
            last_param = image_file_path.split('/')[-1]
            hash_string = last_param.split('.')[0]
            image = Image.objects.create(hash=hash_string, file_path=image_file_path, img_url=img_url)
            created_image_objects.append(image)
        return created_image_objects

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        args = Argument(serializer.validated_data['url'])
        img_directory, successful_image_saves, failed_image_saves = download_google_images(args)

        search = serializer.save()
        search.img_directory = img_directory
        search.success_count = len(successful_image_saves)
        search.failure_count = len(failed_image_saves)
        search.images.set(self.build_images(successful_image_saves))
        search.save()

        updated_serializer = self.get_serializer(search)
        return Response(updated_serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        search_id = kwargs.get('pk', None)
        search = get_object_or_404(Search, pk=search_id)

        for image in search.images.all():
            image.delete()
        search.delete()

        shutil.rmtree(search.img_directory)

        return Response(status=status.HTTP_204_NO_CONTENT)


class ImageView(viewsets.ViewSet):
    """
    View to create users
    """
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    old_path = None
    new_path = None
    new_directory = None
    merged_directory = None

    @staticmethod
    def get_img_directory(image):
        file_path_components = image.file_path.split('/')
        img_file = file_path_components.pop(-1)
        img_directory = '/'.join(file_path_components)
        return img_directory, img_file

    def move_file(self):
        if not os.path.exists(self.new_directory):
            os.mkdir(self.new_directory)
        shutil.move(self.old_path, self.new_path)

    def include_image(self, image):
        img_directory, img_file = self.get_img_directory(image)
        self.old_path = os.path.join(img_directory, img_file)
        self.new_directory = os.path.join(img_directory.replace('/exclude', ''), 'include')
        self.new_path = os.path.join(self.new_directory, img_file)

        self.move_file()

        image.file_path = self.new_path
        image.included = True
        image.save()
        return image

    def exclude_image(self, image):
        img_directory, img_file = self.get_img_directory(image)
        self.old_path = os.path.join(img_directory, img_file)
        self.new_directory = os.path.join(img_directory.replace('/include', ''), 'exclude')
        self.new_path = os.path.join(self.new_directory, img_file)

        self.move_file()

        image.file_path = self.new_path
        image.included = False
        image.save()
        return image

    @detail_route(methods=['put'])
    def toggle_includes(self, request, pk=None):
        value = request.GET.get('value', None)
        image = self.queryset.get(id=pk)

        if value:
            bool_value = value.lower() == 'true'
            print(bool_value)
            if bool_value and not image.included:
                image = self.include_image(image)
            elif not bool_value and (image.included is True or image.included is None):
                image = self.exclude_image(image)
        else:
            if not image.included:
                image = self.include_image(image)
            elif image.included:
                image = self.exclude_image(image)

        serializer = self.serializer_class(image)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @list_route(methods=['get'])
    def find_duplicates(self, request):
        directories = request.GET.get('directories', None)
        if not directories:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        images = []
        duplicates = []
        for directory in directories.split(','):
            image_directory = os.path.join(settings.IMAGE_DIR, directory, 'include')
            for image in os.listdir(image_directory):
                if image in images:
                    duplicates.append(image)
                else:
                    images.append(image)

        return Response(duplicates, status=status.HTTP_200_OK)

    def _move_images(self, directory, sub_folder):
        image_directory = os.path.join(settings.IMAGE_DIR, directory, sub_folder)

    @list_route(methods=['post'])
    def merge_search_categories(self, request):
        serializer = SearchMergeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        merge = serializer.save()

        self.merged_directory = os.path.join(settings.IMAGE_DIR, merge.name)
        if not os.path.exists(self.merged_directory):
            os.mkdir(self.merged_directory)
        # else:
        #     return Response(
        #         {'error': f'image directory with name {self.merged_directory} already exists'},
        #         status=status.HTTP_400_BAD_REQUEST)

        for directory in merge.directories:
            image_directory = os.path.join(settings.IMAGE_DIR, directory)
            if not os.path.exists(image_directory):
                return Response(
                    {'error': f'image directory with name {directory} does not exist'},
                    status=status.HTTP_400_BAD_REQUEST)

        merged_include_directory = os.path.join(self.merged_directory, 'include')
        merged_exclude_directory = os.path.join(self.merged_directory, 'exclude')
        if not os.path.exists(merged_include_directory):
            os.mkdir(merged_include_directory)
        if not os.path.exists(merged_exclude_directory):
            os.mkdir(merged_exclude_directory)

        for directory in merge.directories:
            include_directory = os.path.join(settings.IMAGE_DIR, directory, 'include')
            exclude_directory = os.path.join(settings.IMAGE_DIR, directory, 'exclude')

            for image in os.listdir(include_directory):
                img_path = os.path.join(include_directory, image)
                new_img_path = os.path.join(merged_include_directory, image)
                shutil.move(img_path,new_img_path)

            for image in os.listdir(exclude_directory):
                img_path = os.path.join(exclude_directory, image)
                new_img_path = os.path.join(merged_exclude_directory, image)
                shutil.move(img_path, new_img_path)

        return Response(serializer.data, status=status.HTTP_200_OK)


