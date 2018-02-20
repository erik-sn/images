from django.urls import reverse
from django.db import models as models
from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.postgres.fields import ArrayField

class Base(models.Model):
    name = models.CharField(max_length=255)
    # slug = extension_fields.AutoSlugField(populate_from='name', blank=True)
    created = models.DateTimeField(auto_now_add=True, editable=False)
    modified = models.DateTimeField(auto_now=True, editable=True)

    class Meta:
        abstract = True
        ordering = ('-created',)

    def __unicode__(self) -> str:
        return u'%s' % self.slug

    def get_absolute_url(self) -> str:
        return reverse('api_group_detail', args=(self.slug,))

    def get_update_url(self) -> str:
        return reverse('api_group_update', args=(self.slug,))


class User(AbstractBaseUser):
    first = models.CharField(max_length=30)
    last = models.CharField(max_length=30, blank=True)


class Image(Base):
    hash = models.CharField(max_length=32)
    file_path = models.TextField()
    img_url = models.TextField()
    included = models.NullBooleanField(default=None)


class Search(Base):
    url = models.TextField()
    img_directory = models.TextField(null=True)
    success_count = models.IntegerField(null=True)
    failure_count = models.IntegerField(null=True)
    images = models.ManyToManyField('Image', blank=True)


class SearchMerge(Base):
    directories = ArrayField(models.CharField(max_length=100))
    name = models.CharField(max_length=100)