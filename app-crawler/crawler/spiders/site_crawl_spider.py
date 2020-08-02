from datetime import datetime
import sys
import os
import scrapy
from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor
from helpers import post_crawl


# How to run
# scrapy crawl myspider -a filename=file-to-save-urls.txt -a url=base-url-to-crawl


class MySpider(CrawlSpider):
    name = 'myspider'

    def get_domain(self, url):
        domain_string = url.replace(
            'https://', '').replace('http://', '').replace('www.', '')
        return domain_string

    def __init__(self, *a, **kw):
        super().__init__(*a, **kw)
        self.time_stamp = datetime.utcnow().isoformat().replace(':', '-')
        self.folder_name = self.filename
        self.file_name = self.filename
        self.base_path = '../../crawls/'
        self.folder_path = self.base_path + self.folder_name
        self.start_urls = [self.url]

        # Check and create folder where the crawl file will be written
        if not os.path.exists(self.folder_path):
            os.makedirs(self.folder_path)

        MySpider.allowed_domain = self.get_domain(self.url)
        MySpider.rules = (
            Rule(LinkExtractor(allow_domains=MySpider.allowed_domain),
                 follow=True, callback='parse_item'),
        )

        super()._compile_rules()

    def parse_item(self, response):
        url = response.url
        filename = ''.join([self.file_name,'_',self.time_stamp,'.txt'])
        if(MySpider.allowed_domain in url):
            with open(self.folder_path + '/' + filename, 'a') as f:
                f.write(url + '\n')

    # After crawling completes
    def closed(self, reason):
        post_crawl.on_after_complete()

