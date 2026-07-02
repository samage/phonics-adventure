"""Parse Hop English phonics table rows."""
import re
import urllib.request

URL = "https://www.hopenglish.com/hope-tips-basic-phonics"
req = urllib.request.Request(URL, headers={"User-Agent": "Mozilla/5.0"})
html = urllib.request.urlopen(req, timeout=30).read().decode("utf-8", "ignore")

# Split by table rows
rows = re.findall(r"<tr>(.*?)</tr>", html, re.S | re.I)
print(f"Total tr: {len(rows)}")

for row in rows:
    if ".mp3" not in row:
        continue
    tds = re.findall(r"<td[^>]*>(.*?)</td>", row, re.S | re.I)
    if len(tds) < 4:
        continue
    combo = re.sub(r"<[^>]+>", "", tds[0]).strip()
    combo = re.sub(r"\s+", " ", combo)
    ref = re.sub(r"<[^>]+>", "", tds[1]).strip()
    examples = re.sub(r"<[^>]+>", "", tds[2]).strip()
    examples = re.sub(r"\s+", " ", examples)[:50]
    audio = re.search(r"/(\d+)\.mp3", row)
    audio_id = audio.group(1) if audio else "?"
    print(f"{audio_id:>4} | {combo[:35]:<35} | {ref[:12]:<12} | {examples}")
