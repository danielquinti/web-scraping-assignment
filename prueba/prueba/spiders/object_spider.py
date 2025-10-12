import scrapy
from prueba.items import PokeObject
from bs4 import BeautifulSoup
import re

class ObjectSpider(scrapy.Spider):
    name = "objects"

    start_urls = ["https://www.wikidex.net/wiki/Objeto_equipable"]

    def parse(self, response):
        soup = BeautifulSoup(response.text, "lxml")
        table = soup.find('table', class_='sortable tablaobjeto')
        if not table:
            raise SystemExit("Table not found")
        for cell in table.find_all("tr")[1:]:
            item = extract_row_from_tr(cell)
            yield item

def first_img_alt_or_a_title(cell):
    # Prefer img alt, then anchor title, then link text
    img = cell.find("img")
    if img and img.has_attr("alt") and img["alt"].strip():
        return img["alt"].strip()
    a = cell.find("a")
    if a and a.has_attr("title") and a["title"].strip():
        return a["title"].strip()
    if a:
        return a.get_text(" ", strip=True)
    # fallback to text
    return cell

def extract_name(name_column):
    name = ""
    if name_column:
        a = name_column.find("a")
        if a:
            name = a.get("title")
    return name

def extract_name_english(name_column):
    name = ""
    if name_column:
        a = name_column.find("i")
        if a:
            name = a.get_text(" ", strip=True)
    return name
def extract_type(type_column):
    type_cell = type_column
    types = []
    if type_cell:
        match = type_cell.find_all("a")[0]
        # prefer anchor title
        if match.has_attr("title") and match["title"].strip():
            types.append(match["title"].strip())

def extract_image_url(column):
    src = column.find("span").find("a").find("img").get("src")
    return src

def extract_row_from_tr(cell):
    item = PokeObject()
    # skip header rows (th cells)
    header = cell.find("th", class_="celdaobjeto")
    if cell.find("span").find("a"):
        item["image_url"] = extract_image_url(header)
    item["name"] = extract_name(header)
    columns = cell.find_all("td")
    if len(columns) >2:
        item["name_english"] = extract_name_english(columns[0])
        item["generation"] = int(first_img_alt_or_a_title(columns[1]))
        item["description"] = columns[2].get_text(" ",strip = True)
    return item
