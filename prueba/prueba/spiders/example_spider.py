import scrapy
from prueba.items import PruebaItem


class ExampleSpider(scrapy.Spider):
    name = "example"

    start_urls = ["http://quotes.toscrape.com/"]
    

    def parse(self, response):
        for quote in response.css('div.quote'):
            item = PruebaItem()
            item['text'] = quote.css('span.text::text').get()
            item['author'] = quote.css('span small::text').get()
            item['tags'] = quote.css('div.tags a.tag::text').getall()

            yield item
            
        next_page = response.css('li.next a::attr(href)').get()
        if next_page is not None:
            next_page = response.urljoin(next_page)
            yield scrapy.Request(next_page, callback=self.parse)