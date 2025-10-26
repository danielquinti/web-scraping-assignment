import scrapy
from crawler_scrapper.items import PokeItem
from bs4 import BeautifulSoup
import crawler_scrapper.spiders.bs4_extensions

class PokeSpider(scrapy.Spider):
    name = "pokemon"

    start_urls = ["https://www.wikidex.net/wiki/Bulbasaur"]

    def parse(self, response):
        card = response.css('div.cuadro_pokemon div.ctipo')
        item = PokeItem()
        item['number'] = card.css('span#numeronacional::text').get()
        item['name'] = card.css('div#nombrepokemon.titulo::text').get()
        item['image_url'] = card.css('div.vnav_datos div.imagen img::attr(src)').get()
        
        gen_text = card.css('tr[title="Generación en la que apareció por primera vez"] td a::text').get().lower().strip()
        gen_map = {
            'primera': 1,
            'segunda': 2,
            'tercera': 3,
            'cuarta': 4,
            'quinta': 5,
            'sexta': 6,
            'séptima': 7,
            'septima': 7,
            'octava': 8,
            'novena': 9
        }
        item['gen'] = gen_map.get(gen_text, 0)
        
        item['category'] = card.css('tr[title="Categoría"] td::text').get().strip()
        item['types'] = [x.replace("Tipo ", "").capitalize() for x in card.css('tr[title="Tipos a los que pertenece"] td span a::attr(title)').getall()]
        
        item['abilities'] = card.css('tr[title="Habilidades que puede conocer"] td a::attr(title)').getall()
        item['hidden_abilities'] = card.css('tr[title="Habilidad oculta"] td a::attr(title)').get()
        item['egg_groups'] = [x.strip() for x in card.css('tr[title="Grupos de Pokémon con los que puede reproducirse"] td::text').getall()]
        
        stats_table = response.css('a[title="Lista de Pokémon con sus características base"]').xpath('ancestor::tbody')
        item['ps'] = int(stats_table.xpath('.//tr[2]/td/text()').get().strip())
        item['atk'] = int(stats_table.xpath('.//tr[3]/td/text()').get().strip())
        item['df'] = int(stats_table.xpath('.//tr[4]/td/text()').get().strip())
        item['atk_sp'] = int(stats_table.xpath('.//tr[5]/td/text()').get().strip())
        item['df_sp'] = int(stats_table.xpath('.//tr[6]/td/text()').get().strip())
        item['vel'] = int(stats_table.xpath('.//tr[7]/td/text()').get().strip())

        soup = BeautifulSoup(response.text, "lxml")
        table = soup.find('table', class_='movnivel').find_all("tr")
        item['moves'] = [
            {
                'name': row.find_all("td")[-3].link_title,
                'type': row.find_all("td")[-2].link_title.replace('Tipo', '').strip(),
                'class': row.find_all("td")[-1].link_title.replace('Clase', '').replace('de', '').strip()
            }
            for row in table[1:]  # skip header
            if row.find_all("td")[-3].link_title
        ]
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
