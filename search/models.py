import os
from urllib.parse import urlparse, parse_qs

from django.conf import settings


class Argument:

    def __init__(self, search_url, pickle=True, pickle_dir=settings.PICKLE_DIR, image_dir=settings.IMAGE_DIR):
        self.search_url = search_url
        self.pickle = pickle
        self.pickle_dir = pickle_dir
        self.image_dir = image_dir

        if not os.path.isdir(pickle_dir):
            os.makedirs(pickle_dir)

        parsed = urlparse(search_url)
        self.search_term = parse_qs(parsed.query)['q'][0].replace(' ', '_')

        file_name = f'{self.search_term}-source.pickle'
        self.pickle_path = os.path.join(pickle_dir, file_name)
