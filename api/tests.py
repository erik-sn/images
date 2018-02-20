from unittest import TestCase, mock
from rest_framework.test import APIClient
from django.contrib.auth.models import User


class TestPulseEndpoint(TestCase):

    @classmethod
    def setUpClass(cls):
        cls.user = User.objects.create(username='test1')

    @classmethod
    def tearDownClass(cls):
        User.objects.all().delete()

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_can_reach_if_authenticated(self):
        response = self.client.get('/api/v1/pulse/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, True)

    def test_can_reach_if_unauthenticated(self):
        self.client.force_authenticate(user=None)

        response = self.client.get('/api/v1/pulse/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, True)


class TestUserEndpoint(TestCase):

    @classmethod
    def setUpClass(cls):
        cls.user = User.objects.create(username='test2')

    @classmethod
    def tearDownClass(cls):
        User.objects.all().delete()

    def setUp(self):
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    @mock.patch('api.views.UserView.get_jwt_token')
    def test_can_reach_if_authenticated(self, mock_jwt):
        self.client.force_authenticate(user=self.user)
        token = 'test_token'
        mock_jwt.return_value = token

        data = {'username': 'test5', 'password': 'test_pass'}
        response = self.client.post('/api/v1/users/', data)
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data, {'username': data['username'], 'token': token})

    def test_read_views_disabled(self):
        response = self.client.get('/api/v1/users/')
        self.assertEqual(response.status_code, 405)

        response = self.client.get('/api/v1/users/{}/'.format(self.user.id))
        self.assertEqual(response.status_code, 404)

