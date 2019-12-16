import scrapy
from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor


class axeSpider(scrapy.Spider):
    name = 'axespider'

    def get_domain(self):
        domain_string = self.start_url.replace(
            'https://', '').replace('http://', '').replace('www.', '')
        return domain_string

    def __init__(self, name=None, **kwargs):
        super().__init__(name=name, **kwargs)

        # Set up the starting url(s)
        self.start_url = self.url
        self.start_urls = [self.start_url]

        self.file_name = self.filename

        self.allowed_domain = self.get_domain()

        self.allowed_domains = [self.allowed_domain]

    def parse(self, response):
        all_links = LinkExtractor(
            allow_domains=self.allowed_domain, unique=True).extract_links(response)
        if len(all_links) > 0:
            for link in all_links:
                yield scrapy.Request(link.url, callback=self.parse_item)

    def parse_item(self, response):
        url = response.url
        filename = self.file_name

        with open(filename, 'a') as f:
            f.write(url + '\n')
