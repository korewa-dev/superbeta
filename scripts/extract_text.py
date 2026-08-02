import json
from html.parser import HTMLParser

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.texts = []
        self.skip_tags = {'script', 'style', 'code'}
        self.in_skip = False
    
    def handle_starttag(self, tag, attrs):
        if tag in self.skip_tags:
            self.in_skip = True
    
    def handle_endtag(self, tag):
        if tag in self.skip_tags:
            self.in_skip = False
    
    def handle_data(self, data):
        if not self.in_skip:
            stripped = data.strip()
            if stripped:
                self.texts.append(stripped)

with open('scripts/english_bodies.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for key in sorted(data.keys()):
    body = data[key]
    extractor = TextExtractor()
    extractor.feed(body)
    print(f"\n{'='*60}")
    print(f"KEY: {key}")
    print(f"{'='*60}")
    for i, t in enumerate(extractor.texts):
        print(f"\n--- Text block {i} ---")
        print(t)
