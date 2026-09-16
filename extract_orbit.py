import re
import json
import html as html_module

path = r"c:\Users\suman\Downloads\Startups\Orbit Backgrounds.html"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Extract JSON template from script tag
m = re.search(r'<script type="__bundler/template">([\s\S]*?)</script>', content)
if not m:
    print("No template found")
    exit(1)

template_json = m.group(1).strip()
template = json.loads(template_json)
print("Template length:", len(template))

# Save decoded template for inspection
out_path = r"c:\Users\suman\Downloads\Startups\orbit_template.html"
with open(out_path, "w", encoding="utf-8") as f:
    f.write(template)
print("Wrote", out_path)

# Extract visible text-like content
texts = re.findall(r">([^<>{}\\]{2,100})<", template)
unique = []
seen = set()
for t in texts:
    t = html_module.unescape(t.strip())
    if not t or t in seen:
        continue
    if re.match(r"^[\d\s#.%pxremvhvw]+$", t):
        continue
    seen.add(t)
    unique.append(t)

print("\n--- UI strings ---")
for t in unique[:120]:
    print(t)

# Look for screen/page names in data attributes or class names
for pattern in [r'data-screen="([^"]+)"', r'"screen"\s*:\s*"([^"]+)"', r'/(login|home|profile|settings|signup)']:
    hits = re.findall(pattern, template, re.I)
    if hits:
        print(f"\n--- {pattern} ---")
        print(sorted(set(hits))[:30])
