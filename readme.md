# Pokémon Web Scrapping

Lorem ipsum

## Installation

Install 
```bash
pip install foobar
```
Requirements: docker, scrapy, elastic

## Usage

### Crawling 
From the root directory, run

```bash
cd prueba
scrapy crawl pokemon
```
### Indexing

```bash
cd prueba/elastic
docker compose up -d
python3 create_and_populate_index.py --content indices/pokemon_index_data.json --name pokemon --settings indices/pokemon_index_config.json
```

### Index monitoring
https://chromewebstore.google.com/detail/multi-elasticsearch-heads/cpmmilfkofbeimbmgiclohpodggeheim
