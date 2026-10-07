"""Optional development tool: python -m pip install fonttools brotli.
Produces an OFL-renamed font subset; not required at runtime or during deploy.
The full original font remains a fallback for uncommon/new CMS characters.
"""
from pathlib import Path
import re
from fontTools import subset
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parent
text = ''.join(p.read_text() for p in (root / 'src').glob('*.ts*'))
text += ''.join(p.read_text() for p in (root / 'public/static').glob('*.js'))
unicodes = {ord(c) for c in text} | set(range(32, 256))
# KS X 1001's 2,350 common Hangul syllables also cover changing RSS titles.
for code in range(0xAC00, 0xD7A4):
    try:
        if len(chr(code).encode('euc_kr')) == 2:
            unicodes.add(code)
    except UnicodeEncodeError:
        pass
font = TTFont(root / 'public/static/fonts/PretendardVariable.woff2')
original_codes = set(font.getBestCmap())
options = subset.Options()
options.layout_features = ['*']
worker = subset.Subsetter(options=options)
worker.populate(unicodes=unicodes)
worker.subset(font)
# The original reserves the Pretendard name: rename the derivative.
for name in font['name'].names:
    if name.nameID in (1, 3, 4, 6, 16, 17, 25):
        label = 'Regular' if name.nameID == 17 else ('GoodMorningSans-Regular' if name.nameID in (3, 6, 25) else 'Good Morning Sans')
        name.string = label.encode(name.getEncoding())
font.flavor = 'woff2'
output = root / 'public/static/fonts/GoodMorningSans.woff2'
font.save(output)
# Only ask for the original when it can supply a glyph missing from the subset.
# Without this range browsers may download it speculatively for unsupported glyphs.
remaining = sorted(original_codes - set(font.getBestCmap()))
ranges = []
for code in remaining:
    if ranges and code == ranges[-1][1] + 1:
        ranges[-1][1] = code
    else:
        ranges.append([code, code])
css_range = ','.join(f'U+{a:X}' if a == b else f'U+{a:X}-{b:X}' for a, b in ranges)
css_path = root / 'public/static/style.css'
css = css_path.read_text()
pattern = r"(@font-face\{font-family:'Pretendard Variable';[^}]*?)(?:;unicode-range:[^}]*)?\}"
css, count = re.subn(pattern, lambda m: m[1] + ';unicode-range:' + css_range + '}', css, count=1)
if count != 1:
    raise RuntimeError('Original font fallback declaration was not found')
css_path.write_text(css)
print(f'Good Morning Sans: {output.stat().st_size:,} bytes; original license retained.')
