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
scrapy crawl moves
scrapy crawl abilities
scrapy crawl objects
```
### Indexing

```bash
cd prueba/elastic
docker compose up -d
python3 create_and_populate_index.py --content indices/pokemon/index_data.json --index pokemon --mapping-file  indices/pokemon/index_mappings.json --settings indices/pokemon/index_config.json --id-field number --recreate
python3 create_and_populate_index.py --content indices/abilities/index_data.json --index abilities --mapping-file  indices/abilities/index_mappings.json --settings indices/abilities/index_config.json --id-field number --recreate
python3 create_and_populate_index.py --content indices/moves/index_data.json --index moves --mapping-file  indices/moves/index_mappings.json --settings indices/moves/index_config.json --id-field number --recreate
python3 create_and_populate_index.py --content indices/objects/index_data.json --index objects --mapping-file  indices/objects/index_mappings.json --settings indices/objects/index_config.json --recreate
```

### Index monitoring
https://chromewebstore.google.com/detail/multi-elasticsearch-heads/cpmmilfkofbeimbmgiclohpodggeheim

## Frontend web

### Requirements

- Node 20.

### Run

```
cd frontend-web
npm install (only first time to download libraries)
npm run dev
```
