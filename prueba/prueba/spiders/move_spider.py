import scrapy
from prueba.items import PokeCompleteMove
from bs4 import BeautifulSoup
import prueba.spiders.bs4_extensions
from bs4.element import Tag
from typing import Optional

isduplicated = False
class MoveSpider(scrapy.Spider):
    name = "moves"

    start_urls = ["https://www.wikidex.net/wiki/Lista_de_movimientos"]

    def parse(self, response):
        isduplicated = False
        soup = BeautifulSoup(response.text, "lxml")
        table = soup.find('table', class_='tabpokemon sortable tablemanager')
        if not table:
            raise SystemExit("Table not found")
        for cell in table.find_all("tr"):
            
            # skip header rows (th cells)
            if cell.find("th"):
                continue
            # some rows might be empty or separators
            if not cell.find_all("td"):
                continue
            tds = cell.find_all("td")
            if isduplicated:
                isduplicated = False
                continue
            else:
                isduplicated = tds[0].find_all("sup")
                item = extract_row_from_tr(tds,isduplicated)
                yield item    

def extract_row_from_tr(columns, force_move_class):
    item = PokeCompleteMove()
    item["number"] =  columns[0].int_ignoring_sup
    item["name"] = columns[1].link_spanish_title
    item["name_english"] = columns[1].italics_text
    item["generation"] = int(columns[2].alternative_text)
    item["description"] = columns[3].get_text(" ",strip = True)
    item["movement_type"] = columns[4].alternative_text.replace("Tipo ", "") if columns[4] else ""
    item["movement_class"] = "Ambas" if force_move_class else columns[5].alternative_text.replace("Clase ", "") if columns[5] else ""
    if len(columns) >= 9:
        item["movement_damage"] = columns[6].int_ignoring_sup
        item["movement_precission"] = columns[7].int_ignoring_sup
        item["movement_power_points"] = columns[8].int_ignoring_sup
    else:
        item["movement_damage"] = None
        item["movement_precission"] = None
        item["movement_power_points"] = None
    return item
