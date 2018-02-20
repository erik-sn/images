from rest_framework import serializers

from api import models


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def create(self, validated_data: dict) -> models.User:
        """
        create a user using the username & password from the
        validated_data
        Parameters
        ----------
        validated_data - dict
            data that has been validated by the serializer from
            from the user request

        Returns
        -------
        User
            the created user instance
        """
        user = super(UserSerializer, self).create(validated_data)
        user.set_password(validated_data['password'])
        user.save()
        return user

    class Meta:
        model = models.User
        fields = ('id', 'first', 'last', 'city', 'password')


class UserEditSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.User
        fields = ('id', 'first', 'last', 'city')


class ImageSerializer(serializers.ModelSerializer):
    file_path = serializers.ReadOnlyField()

    class Meta:
        model = models.Image
        fields = ('id', 'file_path', 'img_url', 'included')


class SearchSerializer(serializers.ModelSerializer):
    success_count = serializers.ReadOnlyField()
    failure_count = serializers.ReadOnlyField()
    images = ImageSerializer(many=True, read_only=True)

    class Meta:
        model = models.Search
        fields = ('id', 'name', 'url', 'success_count', 'failure_count', 'images')


class SearchMergeSerializer(serializers.ModelSerializer):

    class Meta:
        model = models.SearchMerge
        fields = ('directories', 'name')
