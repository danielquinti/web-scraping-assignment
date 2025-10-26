import scrapy
from prueba.items import Ability
from bs4 import BeautifulSoup
from bs4.element import Tag
import prueba.spiders.bs4_extensions

class AbilitySpider(scrapy.Spider):
    name = "abilities"

    start_urls = ["https://www.wikidex.net/wiki/Lista_de_habilidades"]

    def parse(self, response):
        soup = BeautifulSoup(response.text, "lxml")
        table = soup.find('table', class_='tabpokemon sortable tablemanager')
        if not table:
            raise SystemExit("Table not found")
        for cell in table.find_all("tr")[1:]:
            yield cell.ability

def _ability(self: Tag) -> Ability:
    item = Ability()
    columns = self.find_all("td")
    if columns[0].int_ignoring_sup:
        item["number"] = columns[0].int_ignoring_sup
    else:
        item["number"] = 0  

    item["name"] = columns[1].link_title
    item["name_english"] = columns[1].italics_text
    item["generation"] = int(columns[2].alternative_text)
    item["description"] = columns[3].get_text(" ",strip = True)
    item["single_holders"] = columns[4].link_titles
    item["double_holders"] = columns[5].link_titles
    item["hidden_holders"] = columns[6].link_titles
    return item

Tag.ability = property(_ability)
