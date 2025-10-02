# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

import scrapy


class PruebaItem(scrapy.Item):
    text = scrapy.Field()
    author = scrapy.Field()
    tags = scrapy.Field()

class PokeItem(scrapy.Item):
    number = scrapy.Field()
    name = scrapy.Field()
    gen = scrapy.Field()
    category = scrapy.Field()
    types = scrapy.Field()
