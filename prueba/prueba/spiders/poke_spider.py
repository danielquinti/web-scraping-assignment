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
        item['image_url'] = card.css('div.vnav_datos div.imagen img::attr(src)').get()
        item['gen'] = card.css('tr[title="Generación en la que apareció por primera vez"] td a::text').get()
        item['category'] = card.css('tr[title="Categoría"] td::text').get().strip()
        item['types'] = [x.replace("Tipo ", "").capitalize() for x in card.css('tr[title="Tipos a los que pertenece"] td span a::attr(title)').getall()]
        
        item['abilities'] = card.css('tr[title="Habilidades que puede conocer"] td a::attr(title)').getall()
        item['hidden_abilities'] = card.css('tr[title="Habilidad oculta"] td a::attr(title)').get()
        item['egg_groups'] = [x.strip() for x in card.css('tr[title="Grupos de Pokémon con los que puede reproducirse"] td::text').getall()]
        
        stats_table = response.css('a[title="Lista de Pokémon con sus características base"]').xpath('ancestor::tbody')
        item['ps'] = stats_table.xpath('.//tr[2]/td/text()').get().strip()
        item['atk'] = stats_table.xpath('.//tr[3]/td/text()').get().strip()
        item['df'] = stats_table.xpath('.//tr[4]/td/text()').get().strip()
        item['atk_sp'] = stats_table.xpath('.//tr[5]/td/text()').get().strip()
        item['df_sp'] = stats_table.xpath('.//tr[6]/td/text()').get().strip()
        item['vel'] = stats_table.xpath('.//tr[7]/td/text()').get().strip()

        item['moves'] = [cell.strip() for row in response.css('table.movnivel tr') if (cell := row.css('td:nth-child(2) a::attr(title)').get())]
        
        weak_table = response.css('a[title="Súper débil"]').xpath('ancestor::tbody')
        item['super_weak'] = [x.replace("Tipo ", "").capitalize() for x in weak_table.xpath('.//tr[2]/td[3]/span/a/@title').getall()]
        item['weak'] = [x.replace("Tipo ", "").capitalize() for x in weak_table.xpath('.//tr[3]/td[3]/span/a/@title').getall()]
        item['normal_damage'] = [x.replace("Tipo ", "").capitalize() for x in weak_table.xpath('.//tr[4]/td[3]/span/a/@title').getall()]
        item['resistant'] = [x.replace("Tipo ", "").capitalize() for x in weak_table.xpath('.//tr[5]/td[3]/span/a/@title').getall()]
        item['super_resistant'] = [x.replace("Tipo ", "").capitalize() for x in weak_table.xpath('.//tr[6]/td[3]/span/a/@title').getall()]
        item['inmunity'] = [x.replace("Tipo ", "").capitalize() for x in weak_table.xpath('.//tr[7]/td[3]/span/a/@title').getall()]

        yield item

        next_page = response.css("div.sec.sec-nacional a:nth-child(4)::attr(href)").getall()[-1]
        if next_page is not None:
            next_page = response.urljoin(next_page)
            yield scrapy.Request(next_page, callback=self.parse)
