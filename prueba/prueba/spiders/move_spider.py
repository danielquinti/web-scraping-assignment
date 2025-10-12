import scrapy
from prueba.items import PokeCompleteMove
from bs4 import BeautifulSoup
import re

class MoveSpider(scrapy.Spider):
    name = "moves"

    start_urls = ["https://www.wikidex.net/wiki/Lista_de_movimientos"]

    def parse(self, response):
        soup = BeautifulSoup(response.text, "lxml")
        table = soup.find('table', class_='tabpokemon sortable tablemanager')
        if not table:
            raise SystemExit("Table not found")
        isduplicated= False
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
                isduplicated =tds[0].find_all("sup")
                columns = [td for td in tds] + [None] * max(0, 9 - len(tds))
                item = extract_row_from_tr(columns,isduplicated)
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
            name = a.get_text(" ", strip=True)
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

def extract_row_from_tr(columns, force_move_class):
    item = PokeCompleteMove()
    item["number"] =  parse_int(columns[0])
    item["name"] = extract_name(columns[1])
    item["name_english"] = extract_name_english(columns[1])
    item["generation"] = int(first_img_alt_or_a_title(columns[2]))
    item["description"] = columns[3].get_text(" ",strip = True)
    item["movement_type"] = first_img_alt_or_a_title(columns[4]) if columns[4] else ""
    item["movement_class"] = "Ambas" if force_move_class else first_img_alt_or_a_title(columns[5])
    item["movement_damage"] = parse_int(columns[6])
    item["movement_precission"] = parse_int(columns[7])
    item["movement_power_points"] = parse_int(columns[8])
    return item
