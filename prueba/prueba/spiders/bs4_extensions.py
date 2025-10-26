# bs4_extensions.py
from bs4 import BeautifulSoup
from bs4.element import Tag
import re
from typing import List, Optional

_INT_RE = re.compile(r"-?\d[\d,]*")

def _alternative_text(self: Tag) -> Optional[str]:
    """
    Prefer img alt, then anchor title, then anchor text, then element text.
    """
    if not self:
        return None
    img = self.find("img")
    if img and img.has_attr("alt") and img["alt"].strip():
        return img["alt"].strip()
    a = self.find("a")
    if a:
        if a.has_attr("title") and a["title"].strip():
            return a["title"].strip()
        txt = a.get_text(" ", strip=True)
        if txt:
            return txt
    txt = self.get_text(" ", strip=True)
    return txt if txt else None

def _image_url(self: Tag) -> Optional[str]:
    """Return nested <span><a><img src="..."> src or None if not found."""
    if not self:
        return None
    span = self.find("span")
    if not span:
        return None
    a = span.find("a")
    if not a:
        return None
    img = a.find("img")
    if not img:
        return None
    return img.get("src")

def _int_ignoring_sup(self: Tag) -> Optional[int]:
    """Return first integer-like token from the element's text ignoring any <sup> content."""
    if not self:
        return None
    # tiny copy to avoid mutating original tree
    col_copy = BeautifulSoup(str(self), "html.parser")
    for sup in col_copy.find_all("sup"):
        sup.decompose()
    txt = col_copy.get_text("", strip=True)
    m = _INT_RE.search(txt)
    if not m:
        return None
    num = m.group().replace(",", "")
    try:
        return int(num)
    except ValueError:
        return None

def _italics_text(self: Tag) -> Optional[str]:
    """Text of the first <i>"""
    i = self.find("i")
    return i.get_text(" ", strip=True) if i else None

def _link_title(self: Tag) -> Optional[str]:
    """Text of the first <a>"""
    if self:
        link = self.find("a")
        if link:
            return link.get("title")
    return None

def _link_spanish_title(self: Tag) -> Optional[str]:
    """Text of the first <a> with span regional-lang-switch for Spanish title"""
    if self:
        link = self.find("a")
        spanish_title = link.get("title")
        if link:
            span = link.find("span", class_="regional-lang-switch")
            if span:
                print("awawa")
                spanish_title = span.find("span", lang="es-ES").text
        return spanish_title        
    return None



def _link_titles(self: Tag) -> List[str]:
    """Return list of non-empty 'title' attributes from all anchors in the element."""
    if not self:
        return []
    results: List[str] = []
    for a in self.find_all("a"):
        if a and a.has_attr("title") and a["title"].strip():
            results.append(a["title"].strip())
    return results

Tag.alternative_text = property(_alternative_text)
Tag.image_url = property(_image_url)
Tag.int_ignoring_sup = property(_int_ignoring_sup)
Tag.italics_text = property(_italics_text)
Tag.link_spanish_title = property(_link_spanish_title)
Tag.link_title = property(_link_title)
Tag.link_titles = property(_link_titles)
