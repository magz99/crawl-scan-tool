import scrapy
from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor

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
        self.file_name = self.filename
        self.start_urls = [self.url]
        MySpider.allowed_domain = self.get_domain(self.url)

        MySpider.rules = (
            Rule(LinkExtractor(allow_domains=MySpider.allowed_domain),
                 follow=True, callback='parse_item'),
        )

        super()._compile_rules()

    def parse_item(self, response):
        url = response.url
        filename = self.file_name
        if(MySpider.allowed_domain in url):
            with open(filename, 'a') as f:
                f.write(url + '\n')
