import re
import json
import base64
import gzip
import io

path = r"c:\Users\suman\Downloads\Startups\Orbit Backgrounds.html"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

m = re.search(r'<script type="__bundler/manifest">([\s\S]*?)</script>', content)
manifest = json.loads(m.group(1))

for uuid, entry in manifest.items():
    data = base64.b64decode(entry["data"])
    if entry.get("compressed"):
        data = gzip.decompress(data)
    mime = entry.get("mime", "")
    out = rf"c:\Users\suman\Downloads\Startups\extracted\{uuid}"
    import os
    os.makedirs(os.path.dirname(out), exist_ok=True)
    ext = {
        "text/javascript": ".js",
        "text/css": ".css",
        "font/woff2": ".woff2",
        "image/png": ".png",
        "image/svg+xml": ".svg",
    }.get(mime, ".bin")
    out_path = out + ext
    with open(out_path, "wb") as f:
        f.write(data)
    print(uuid, mime, len(data), out_path)

# Search JS for screen names and UI strings
js_path = r"c:\Users\suman\Downloads\Startups\extracted\2dbce2cf-88b1-475b-ba8f-78660f0a1533.js"
with open(js_path, "r", encoding="utf-8", errors="ignore") as f:
    js = f.read()

# Find quoted strings that look like UI copy
strings = re.findall(r'"([A-Za-z][^"\\]{2,60})"', js)
ui = []
for s in strings:
    if any(k in s.lower() for k in ["login", "feed", "sign", "email", "password", "orbit", "startup", "profile", "home", "welcome", "continue", "create", "post", "follow"]):
        ui.append(s)
print("\n--- relevant strings ---")
for s in sorted(set(ui))[:80]:
    print(s)

# screen names
screens = re.findall(r'start:\s*"([^"]+)"|screen:\s*"([^"]+)"|name:\s*"([^"]+)"', js)
print("\n--- screen refs ---")
print(sorted(set(x for tup in screens for x in tup if x))[:50])
