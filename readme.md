## Installation

### Linux / macOS
From the root directory, run:
```bash
python3 -m venv venv && \
source venv/bin/activate && \
python -m pip install --upgrade pip && \
pip install -r requirements.txt
```
### Windows (CMD)
From the root directory, run:
```bash
python -m venv venv && ^
venv\Scripts\activate.bat && ^
python -m pip install --upgrade pip && ^
pip install -r requirements.txt
```

## Usage

### Crawling 
From the root directory, run

```bash
cd crawler_scrapper && scrapy crawl moves && scrapy crawl abilities && scrapy crawl objects && cd ..
```
These spiders run really quickly.
The Pokémon spider can also be run 
```bash
cd crawler_scrapper && scrapy crawl pokemon && cd ..
```
However, it takes about 20 minutes.

### Indexing

#### Linux / macOS

```bash
cd elastic && \
docker compose up -d && \
sleep 20 &&\
python3 create_and_populate_index.py --content indices/pokemon/index_data.json --index pokemon --mapping-file  indices/pokemon/index_mappings.json --settings indices/pokemon/index_config.json --id-field number --recreate && \
python3 create_and_populate_index.py --content indices/abilities/index_data.json --index abilities --mapping-file  indices/abilities/index_mappings.json --settings indices/abilities/index_config.json --id-field number --recreate && \
python3 create_and_populate_index.py --content indices/moves/index_data.json --index moves --mapping-file  indices/moves/index_mappings.json --settings indices/moves/index_config.json --id-field number --recreate && \
python3 create_and_populate_index.py --content indices/objects/index_data.json --index objects --mapping-file  indices/objects/index_mappings.json --settings indices/objects/index_config.json --recreate && \
cd ..
```
This command needs to sleep for 20 seconds to allow the elastic server to set up before processing requests.

#### Windows (CMD)
```bash
cd elastic && ^
docker compose up -d && ^
timeout /t 20 && ^
python create_and_populate_index.py --content indices/pokemon/index_data.json --index pokemon --mapping-file  indices/pokemon/index_mappings.json --settings indices/pokemon/index_config.json --id-field number --recreate && ^
python create_and_populate_index.py --content indices/abilities/index_data.json --index abilities --mapping-file  indices/abilities/index_mappings.json --settings indices/abilities/index_config.json --id-field number --recreate && ^
python create_and_populate_index.py --content indices/moves/index_data.json --index moves --mapping-file  indices/moves/index_mappings.json --settings indices/moves/index_config.json --id-field number --recreate && ^
python create_and_populate_index.py --content indices/objects/index_data.json --index objects --mapping-file  indices/objects/index_mappings.json --settings indices/objects/index_config.json --recreate && ^
cd ..
```
This command needs to sleep for 20 seconds to allow the elastic server to set up before processing requests.

### Index monitoring
https://chromewebstore.google.com/detail/multi-elasticsearch-heads/cpmmilfkofbeimbmgiclohpodggeheim

## Frontend web

### Requirements

- Node 20.

### Run

#### Linux / macOS
```bash
cd frontend-web && \
npm install && \
npm run dev
```

#### Windows (CMD)
```bash
cd frontend-web && ^
npm install && ^
npm run dev
```
