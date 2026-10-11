// Build optional exports from the current public-guide source only.
// Does not deploy, access credentials or overwrite the historical R1 exports.
import fs from 'node:fs'
import path from 'node:path'
import {execFileSync} from 'node:child_process'
import {chromium} from '@playwright/test'
const root=process.cwd(),out=path.join(root,'.sources/handoff')
fs.mkdirSync(out,{recursive:true})
const stem=path.join(out,'GoodMorning_Handoff_2026-10-11_V26')
let html=execFileSync('pandoc',['handoff/DELIVERY.md','--from=markdown','--to=html5','--standalone','--metadata=lang:en','--metadata=pagetitle:더굿모닝치과 홈페이지 운영·인수 안내서'],{encoding:'utf8'})
const font=fs.readFileSync('public/static/fonts/PretendardVariable.woff2').toString('base64')
html=html.replace('lang="en"','lang="ko"').replace(/<style>[\s\S]*?<\/style>/g,'').replace('</head>',`<style>@font-face{font-family:'Handoff Sans';src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 900;font-style:normal;}\n${fs.readFileSync('handoff/print.css','utf8')}</style></head>`)
fs.writeFileSync(stem+'.html',html)
execFileSync('pandoc',['handoff/DELIVERY.md','--from=markdown','--to=docx','--lua-filter=handoff/pagebreak.lua','--metadata=lang:en','--output='+stem+'.docx'],{stdio:'pipe'})
execFileSync('python3',['-c',String.raw`
import sys
from docx import Document
from docx.shared import Pt, Mm, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
d=Document(sys.argv[1])
for section in d.sections:
 section.page_width=Mm(210);section.page_height=Mm(297)
 section.top_margin=Mm(15);section.bottom_margin=Mm(17)
 section.left_margin=Mm(15);section.right_margin=Mm(15)
for name in ['Normal','Body Text','First Paragraph','Compact']:
 try:s=d.styles[name]
 except KeyError:continue
 s.font.name='Malgun Gothic';s.font.size=Pt(9.5)
 s.paragraph_format.line_spacing=1.3;s.paragraph_format.space_after=Pt(4)
 s.element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:eastAsia'),'맑은 고딕')
for name,size in [('Heading 1',23),('Heading 2',12)]:
 s=next(s for s in d.styles if s.style_id==name.replace(' ',''));s.font.name='Malgun Gothic';s.font.size=Pt(size);s.font.color.rgb=RGBColor.from_string('292D29')
 s.paragraph_format.space_before=Pt(11);s.paragraph_format.space_after=Pt(6)
 s.element.get_or_add_rPr().get_or_add_rFonts().set(qn('w:eastAsia'),'맑은 고딕')
for table in d.tables:
 for i,row in enumerate(table.rows):
  for cell in row.cells:
   for p in cell.paragraphs:
    p.paragraph_format.space_after=Pt(3);p.paragraph_format.space_before=Pt(3)
    for r in p.runs:r.font.size=Pt(9)
   if i==0:
    shade=OxmlElement('w:shd');shade.set(qn('w:fill'),'EDE8C5');cell._tc.get_or_add_tcPr().append(shade)
for section in d.sections:
 p=section.footer.paragraphs[0];p.text='GOOD MORNING DENTAL · HANDOFF V26 · 2026-10-11'
 for r in p.runs:r.font.size=Pt(8)
d.core_properties.title='더굿모닝치과 홈페이지 운영·인수 안내서'
d.save(sys.argv[1])
`,stem+'.docx'],{stdio:'pipe'})
const browser=await chromium.launch({args:['--no-sandbox','--disable-dev-shm-usage']})
try {
 const page=await browser.newPage()
 await page.setContent(html,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready)
 await page.pdf({path:stem+'.pdf',format:'A4',printBackground:true,preferCSSPageSize:true,displayHeaderFooter:true,headerTemplate:'<span></span>',footerTemplate:'<div style="font-family:sans-serif;font-size:8px;width:100%;margin:0 15mm;color:#777;display:flex;justify-content:space-between"><span>GOOD MORNING DENTAL · HANDOFF V26 · 2026-10-11</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'})
 console.log('Built PDF / DOCX / self-contained HTML:',stem)
} finally {await browser.close()}
