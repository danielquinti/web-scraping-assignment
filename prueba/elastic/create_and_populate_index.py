from elasticsearch import Elasticsearch, helpers
from typing import List, Dict, Any
import json
import argparse

def create_index(args, client):
    # Create index with mapping if provided and it doesn't exist
    with open(args.settings, 'r', encoding='utf-8') as mf:
        settings = json.load(mf)
    # optional recreate
    if args.recreate and client.indices.exists(index=args.index):
        print(f"Deleting existing index '{args.index}'...")
        client.indices.delete(index=args.index)

    # Create index with mapping if provided and it doesn't exist
    if args.mapping_file:
        if not client.indices.exists(index=args.index):
            with open(args.mapping_file, 'r', encoding='utf-8') as mf:
                mapping = json.load(mf)
            print(f"Creating index '{args.index}' with provided mapping...")
            client.indices.create(index=args.index, settings=settings, body=mapping)
        else:
            print(f"Index '{args.index}' exists; skipping mapping creation.")

def generate_bulk_actions(docs, index_name, id_field= None):
    for doc in docs:
        action = {"_index": index_name, "_source": doc}
        if id_field and id_field in doc:
            action["_id"] = str(doc[id_field])
        yield action

def populate_index(args, client):
    docs = load_json_list(args.content)
    total = len(docs)
    print(f'Loaded {total} documents from {args.content}')
    docs_iter = (d for d in docs)
    batch_num = 0
    for batch in chunked_iterable(docs_iter, args.batch):
        batch_num += 1
        actions = []
        for a in generate_bulk_actions(batch, args.index, args.id_field):
            actions.append(a)
        print(f"Sending batch {batch_num} with {len(batch)} docs (total so far: {min(batch_num*args.batch, total)})")
        success, errors = helpers.bulk(client, actions, raise_on_error=False, stats_only=False) if actions else (0, [])
        print(f"Batch {batch_num} result - successful ops: {success}")
        if errors:
            print(f"Errors in batch {batch_num} (first 3 shown): {errors[:3]}")

    print('Finished bulk indexing.')

def chunked_iterable(iterable, size):
    chunk = []
    for item in iterable:
        chunk.append(item)
        if len(chunk) >= size:
            yield chunk
            chunk = []
    if chunk:
        yield chunk

def load_json_list(path: str) -> List[Dict[str, Any]]:
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return data

def create_and_populate_index(args):
    client = Elasticsearch(hosts=[args.url])
    create_index(args, client)
    populate_index(args, client)



if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Bulk-index a JSON list into Elasticsearch')
    parser.add_argument('--content', required=True, help='Path to JSON file')
    parser.add_argument('--index', required=True, help='Target index name')
    parser.add_argument('--settings', required=True, help='Path to settings file')
    parser.add_argument('--url', default='http://localhost:9200', help='Elasticsearch URL')
    parser.add_argument('--id-field', default=None, help='If provided, use this field from each doc as _id')
    parser.add_argument('--batch', type=int, default=1500, help='Batch size for bulk API (default 1000)')
    parser.add_argument('--recreate', action='store_true', help='Delete index before indexing')
    parser.add_argument('--mapping-file', default=None, help='Optional mapping JSON to create index with')
    args = parser.parse_args()

    create_and_populate_index(args)