import scrapy
from prueba.items import PokeObject
from bs4 import BeautifulSoup
import prueba.spiders.bs4_extensions
from bs4.element import Tag
class ObjectSpider(scrapy.Spider):
    name = "objects"

    start_urls = ["https://www.wikidex.net/wiki/Objeto_equipable"]

    def parse(self, response):
        soup = BeautifulSoup(response.text, "lxml")
        table = soup.find('table', class_='sortable tablaobjeto')
        if not table:
            raise SystemExit("Table not found")
        for cell in table.find_all("tr")[1:]:
            yield cell.poke_object

def _object(self: Tag) -> PokeObject:
    item = PokeObject()
    # skip header rows (th cells)
    header = self.find("th", class_="celdaobjeto")
    if self.find("span").find("a"):
        item["image_url"] = header.image_url
    item["name"] = header.link_title
    columns = self.find_all("td")
    if len(columns) >2:
        item["name_english"] = columns[0].italics_text
        item["generation"] = int(columns[1].alternative_text)
        item["description"] = columns[2].get_text(" ",strip = True)
    return item

Tag.poke_object = property(_object)