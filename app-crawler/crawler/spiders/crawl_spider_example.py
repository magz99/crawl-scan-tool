import scrapy
from scrapy.spiders import CrawlSpider, Rule
from scrapy.linkextractors import LinkExtractor


class MySpider(CrawlSpider):
    name = 'myspider'  # todo: this needs to come from the command line
    # file_name = 'golang_urls.txt'
    # allowed_domains = ['golang.org']
    # start_urls = [
    #     'https://golang.org/',
    # ]

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

        with open(filename, 'a') as f:
            f.write(url + '\n')

        # get all the links on the page
        # for href in response.css('a::attr(href)'):
        #     href_text = href.get()
            # if self.url_base in href_text or href_text.startswith('/'):
            # yield response.follow(href, self.parse)
