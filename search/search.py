import time
import pickle
import argparse
import os
from urllib.parse import urlparse, parse_qs
import hashlib
import base64
import asyncio
from concurrent.futures._base import TimeoutError, CancelledError
from mimetypes import guess_all_extensions

import magic
import async_timeout
from aiohttp import ClientSession, client_exceptions
from selenium import webdriver, common
from selenium.webdriver.common.keys import Keys
from bs4 import BeautifulSoup
from fake_useragent import FakeUserAgent

ua = FakeUserAgent()

UNWANTED_FILE_EXTENSIONS = ['shtml', 'html', 'jpe']


def generate_page_source(search_url):
    print(search_url)
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')
    options.add_argument('--disable-gpu')
    options.add_argument('--no-sandbox')

    driver = webdriver.Chrome(executable_path='/usr/local/bin/chromedriver', chrome_options=options)

    driver.get(search_url)

    element = driver.find_element_by_tag_name("body")

    for i in range(30):
        element.send_keys(Keys.PAGE_DOWN)
        time.sleep(0.2)

    try:
        driver.find_element_by_id("smb").click()

        for i in range(50):
            element.send_keys(Keys.PAGE_DOWN)
            time.sleep(0.2)
    except common.exceptions.WebDriverException:
        print('"More images" button not found, no more images to find')

    source = driver.page_source
    driver.close()

    return source


def pickle_source(source, pickle_path):
    with open(pickle_path, 'wb') as output_file:
        pickle.dump(source, output_file)


def load_source_from_pickle(pickle_path):
    if os.path.exists(pickle_path):
        with open(pickle_path, 'rb') as input_file:
            return pickle.load(input_file)
    return None


def load_or_create_source(args):
    # load
    if args.pickle:
        existing_source = load_source_from_pickle(args.pickle_path)
        if existing_source:
            return existing_source

    # create
    source = generate_page_source(args.search_url)
    if args.pickle:
        pickle_source(source, args.pickle_path)
    return source


def parse_img_url_from_href(img_href):
    parsed = urlparse(img_href)
    try:
        return parse_qs(parsed.query)['imgurl'][0]
    except KeyError as e:
        print('Could not find img url for href: ', img_href)
        return None

async def download_image(img_url, session):
    headers = {'User-Agent': ua.random}
    try:
        async with async_timeout.timeout(10):
            async with session.get(img_url, headers=headers) as response:
                return await response.read(), img_url
    except client_exceptions.InvalidURL:
        print('Failed to download image - Invalid URL: ', img_url)
    except client_exceptions.ServerDisconnectedError:
        print('Failed to download image - server disconnect: ', img_url)
    except (client_exceptions.ClientConnectorSSLError, client_exceptions.ClientConnectorCertificateError):
        print('Failed to download image - SSL error: ', img_url)
    except TimeoutError:
        print('Failed to download image - Timeout: ', img_url)
    except CancelledError:
        print('Failed to download image - Cancelled: ', img_url)
    return None, img_url


async def download_images(img_urls):
    tasks = []
    async with ClientSession() as session:
        for img_url in img_urls:
            task = asyncio.ensure_future(download_image(img_url, session))
            tasks.append(task)
        responses = await asyncio.gather(*tasks)
        return responses


def consolidate_image_sources(sources):
    img_urls = []
    for img_src, href in sources:
        img_url = parse_img_url_from_href(href)
        if img_url:
            img_urls.append(img_url)
    return img_urls


def parse_extension_from_mime_type(img_url, mime_type):
    try:
        return guess_all_extensions(mime_type)[-1].replace('.', '')
    except IndexError:
        path = urlparse(img_url).path
        last_param = path.split('/')[-1]
        if '.' in last_param:
            return last_param.split('.')[-1]
        else:
            return


def save_downloaded_image(img_directory, img_content, img_url):
    mime_type = magic.from_buffer(img_content, mime=True)
    if not mime_type:
        print('Exluding file - Could not determine mime-type: ', img_url)
        return False

    file_extension = parse_extension_from_mime_type(img_url, mime_type)
    if not file_extension:
        print('Excluding file - could not determine extension from mime-type: ', img_url, 'mime-type: ', mime_type)
        return False

    if file_extension in UNWANTED_FILE_EXTENSIONS:
        print('Exluding file - unwanted extension: ', img_url, ' Extension: ', file_extension)
        return False

    md5_hash = hashlib.md5(img_content).hexdigest()
    file_name = f'{md5_hash}.{file_extension}'
    image_file_path = os.path.join(img_directory, file_name)

    with open(image_file_path, 'wb') as file_handler:
        file_handler.write(img_content)
    return image_file_path


def download_google_images(args):
    source = load_or_create_source(args)
    soup = BeautifulSoup(str(source), 'html.parser')

    img_directory = os.path.join(args.image_dir, args.search_term)
    if not os.path.isdir(img_directory):
        os.makedirs(img_directory)

    a_tags = soup.find_all('a', class_="rg_l")
    sources = [(tag.find('img').get('src'), tag.get('href')) for tag in a_tags]

    img_urls = consolidate_image_sources(sources)

    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    future = asyncio.ensure_future(download_images(img_urls))
    responses = loop.run_until_complete(future)

    successful_image_saves = []
    failed_image_saves = []
    for img_content, img_url in responses:
        if not img_content:
            failed_image_saves.append(img_url)
            continue

        image_file_path = save_downloaded_image(img_directory, img_content, img_url)
        if image_file_path:
            try:
                successful_image_saves.append((image_file_path, img_url))
            except Exception as e:
                failed_image_saves.append(img_url)
                print(e)
                print('Image download failed - Unknown error: ', img_url)
        else:
            failed_image_saves.append(img_url)

    print()
    print('------------------------------------------------------')
    print('Summary:')
    print('Successful image downloads: ', len(successful_image_saves))
    print('Failed image saves: ', len(failed_image_saves))
    print('------------------------------------------------------')

    return img_directory, successful_image_saves, failed_image_saves


def str2bool(v):
    if v.lower() in ('yes', 'true', 't', 'y', '1'):
        return True
    elif v.lower() in ('no', 'false', 'f', 'n', '0'):
        return False
    else:
        raise argparse.ArgumentTypeError('Boolean value expected.')


def inject_pickle_path(args):
    if not os.path.isdir(args.pickle_dir):
        os.makedirs(args.pickle_dir)

    file_name = f'{args.search_term}-source.pickle'
    args.pickle_path = os.path.join(args.pickle_dir, file_name)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument("search_url", help="the google image url to parse")
    parser.add_argument("--pickle", type=str2bool, nargs='?',
                        const=True, default=True,
                        help="Activate nice mode.")
    parser.add_argument("--pickle_dir", default='./pickles', help="directory to store pickle objects in")
    parser.add_argument("--image_dir", default='./download_images', help="directory to store images in")

    args = parser.parse_args()
    inject_pickle_path(args)

    download_google_images(args)