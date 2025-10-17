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
docker pull docker.elastic.co/elasticsearch/elasticsearch:9.1.5 (only first time to dowload elasticsearch)
docker compose up -d
python3 create_and_populate_index.py --content indices/pokemon/index_data.json --name pokemon --mapping_file  indices/pokemon/index_mappings.json --settings indices/pokemon/index_config.json
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
