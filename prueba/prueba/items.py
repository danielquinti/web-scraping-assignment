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
    image_url = scrapy.Field()
    name = scrapy.Field()
    gen = scrapy.Field()
    category = scrapy.Field()
    types = scrapy.Field()
    abilities = scrapy.Field()
    hidden_abilities = scrapy.Field()
    egg_groups = scrapy.Field()
    
    ps = scrapy.Field()
    atk = scrapy.Field()
    df = scrapy.Field()
    atk_sp = scrapy.Field()
    df_sp = scrapy.Field()
    vel = scrapy.Field()
    
    super_weak = scrapy.Field()
    weak = scrapy.Field()
    normal_damage = scrapy.Field()
    resistant = scrapy.Field()
    super_resistant = scrapy.Field()
    inmunity = scrapy.Field()

    moves = scrapy.Field()