import scrapy
from prueba.items import PokeItem

class PokeSpider(scrapy.Spider):
    name = "poke"

    start_urls = ["https://www.wikidex.net/wiki/Bulbasaur"]

    def parse(self, response):
        card = response.css('div.cuadro_pokemon div.ctipo')
        item = PokeItem()
        item['number'] = card.css('span#numeronacional::text').get()
        item['name'] = card.css('div#nombrepokemon.titulo::text').get()
        item['gen'] = card.css('div.vnav_datos table.datos.resalto tbody tr:nth-child(2) td a::text').get()
        item['category'] = card.css('div.vnav_datos table.datos.resalto tbody tr:nth-child(3) td::text').get()
        item['types'] = card.css('div.vnav_datos table.datos.resalto tbody tr:nth-child(4) td span a::attr(title)').getall()

        yield item

        next_page = response.css("div.sec.sec-nacional a:nth-child(4)::attr(href)").getall()[-1]
        if next_page is not None:
            next_page = response.urljoin(next_page)
            yield scrapy.Request(next_page, callback=self.parse)
