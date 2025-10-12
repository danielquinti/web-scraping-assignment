import scrapy
from prueba.items import Ability
from bs4 import BeautifulSoup
import re

class AbilitySpider(scrapy.Spider):
    name = "abilities"

    start_urls = ["https://www.wikidex.net/wiki/Lista_de_habilidades"]

    def parse(self, response):
        soup = BeautifulSoup(response.text, "lxml")
        table = soup.find('table', class_='tabpokemon sortable tablemanager')
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

def parse_int(column):
    if not column:
        return None
    # make a tiny copy so we don't change the original tree
    col_copy = BeautifulSoup(str(column), "html.parser")
    for sup in col_copy.find_all("sup"):
        sup.decompose()

    txt = col_copy.get_text("", strip=True)
    # find integer-like token (allow optional leading - and commas like 1,234)
    m = re.search(r"-?\d[\d,]*", txt)
    if not m:
        return None
    num = m.group().replace(",", "")
    try:
        return int(num)
    except ValueError:
        return None

def a_titles(column):
    # Prefer img alt, then anchor title, then link text
    links = column.find_all("a")
    results = []
    for a in links:
        if a and a.has_attr("title") and a["title"].strip():
            results.append(a["title"].strip())
    return results

def extract_row_from_tr(cell):
    item = Ability()
    columns = cell.find_all("td")
    if parse_int(columns[0]):
        item["number"] = parse_int(columns[0])        

    item["name"] = extract_name(columns[1])
    item["name_english"] = extract_name_english(columns[1])
    item["generation"] = int(first_img_alt_or_a_title(columns[2]))
    item["description"] = columns[3].get_text(" ",strip = True)
    item["single_holders"] = a_titles(columns[4])
    item["double_holders"] = a_titles(columns[5])
    item["hidden_holders"] = a_titles(columns[6])
    return item
