"""Typeset a five-page visual decision book; this is not a browser screenshot.

Reads the same verified source fonts as the interactive export. Variable fonts
are instantiated at explicit axes for PDF embedding; intermediate font software
is not distributed. The PDF includes provenance and links to unchanged sources.
"""
import argparse
import hashlib
import json
import tempfile
from pathlib import Path
from fontTools.ttLib import TTFont as SourceFont
from fontTools.varLib.instancer import instantiateVariableFont
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor

HERE = Path(__file__).resolve().parent
W, H = 1280, 900
COLORS = {
 'frankx': dict(bg='#F4F0E7', ink='#193C30', muted='#526252', line='#CBD0BE', accent='#A95A32', card='#E6E9D9'),
 'arcanea': dict(bg='#080E1C', ink='#F1E9D9', muted='#BCB8B0', line='#3B4250', accent='#C7A777', card='#14202C'),
 'starlight': dict(bg='#F6F8F7', ink='#153843', muted='#50666B', line='#C7D5D5', accent='#14727D', card='#E5EFED'),
}


def main(cache, out):
    manifest = json.loads((HERE / 'font-manifest.json').read_text())
    for f in manifest['files']:
        assert hashlib.sha256((cache / f['filename']).read_bytes()).hexdigest() == f['sha256']
        assert hashlib.sha256((cache / f['license_file']).read_bytes()).hexdigest() == f['license_sha256']
    specs = {
      'Sans':('InstrumentSans[wdth,wght].ttf',400), 'SansBold':('InstrumentSans[wdth,wght].ttf',600),
      'Serif':('InstrumentSerif-Regular.ttf',400), 'SerifItalic':('InstrumentSerif-Italic.ttf',400),
      'Geist':('Geist[wght].ttf',400), 'GeistBold':('Geist[wght].ttf',600),
      'News':('Newsreader[opsz,wght].ttf',400), 'NewsItalic':('Newsreader-Italic[opsz,wght].ttf',400),
      'Inter':('Inter[opsz,wght].ttf',400), 'Playfair':('PlayfairDisplay[wght].ttf',400),
      'Mono':('IBMPlexMono-Regular.ttf',400),
    }
    temp = tempfile.TemporaryDirectory(prefix='brand-proof-fonts-')
    for name,(filename, weight) in specs.items():
        f = SourceFont(cache / filename)
        if 'fvar' in f:
            axes = {a.axisTag: a.defaultValue for a in f['fvar'].axes}
            axes['wght'] = weight
            if 'opsz' in axes: axes['opsz'] = 24 if name in ['News','NewsItalic'] else 14
            f = instantiateVariableFont(f, axes, inplace=False)
        # Unique internal proof names avoid Reserved Font Name claims for these
        # temporary static instances. Original source and notice remain linked.
        for rec in f['name'].names:
            if rec.nameID in [1,2,4,6,16,17]:
                val = 'Regular' if rec.nameID in [2,17] else 'ReviewProof'+name
                rec.string = val.encode(rec.getEncoding(), errors='replace')
        path = Path(temp.name) / (name+'.ttf'); f.save(path); f.close()
        pdfmetrics.registerFont(TTFont(name, str(path)))
    out.parent.mkdir(parents=True, exist_ok=True)
    c=canvas.Canvas(str(out),pagesize=(W,H),pageCompression=1)
    c.setTitle('Three brands, three distinct voices - visual decision edition')
    c.setAuthor('FrankX / Starlight Design Intelligence')
    boxes=[]
    def rect(x,y,w,h,color,stroke=None,r=0):
        c.setFillColor(HexColor(color)); c.setStrokeColor(HexColor(stroke or color))
        if r: c.roundRect(x,H-y-h,w,h,r,stroke=bool(stroke),fill=1)
        else: c.rect(x,H-y-h,w,h,stroke=bool(stroke),fill=1)
    def line(x,y,x2,y2,color):
        c.setStrokeColor(HexColor(color));c.setLineWidth(.8);c.line(x,H-y,x2,H-y2)
    def text(s,x,y,font='Sans',size=18,color='#193C30'):
        c.setFillColor(HexColor(color));c.setFont(font,size);c.drawString(x,H-y-size*.83,s)
        width=pdfmetrics.stringWidth(s,font,size)
        assert x>=0 and x+width<=W+1 and y>=0 and y+size<=H+1, (s,x,y,width)
        boxes.append((c.getPageNumber(),s,x,y,width,size))
    def wrap(s,x,y,width,font='Sans',size=18,leading=None,color='#193C30'):
        leading=leading or size*1.45
        rows=[]
        for para in s.split('\n'):
            row=''
            for word in para.split():
                proposed=(row+' '+word).strip()
                if row and pdfmetrics.stringWidth(proposed,font,size)>width:
                    rows.append(row);row=word
                else:row=proposed
            rows.append(row)
        for i,row in enumerate(rows):text(row,x,y+i*leading,font,size,color)
        return y+len(rows)*leading
    def page(k,number,label):
        p=COLORS[k];rect(0,0,W,H,p['bg']);text(label,44,30,'Sans',16,p['muted']);text('Review edition / 10 September 2026',910,30,'Sans',15,p['muted']);line(44,64,1236,64,p['line']);text(f'{number:02d} / 05',1160,858,'Sans',15,p['muted']);return p
    def circle(cx,cy,r,color,fill=True,stroke=None):
        c.setFillColor(HexColor(color));c.setStrokeColor(HexColor(stroke or color));c.circle(cx,H-cy,r,stroke=bool(stroke),fill=fill)
    def button(label,x,y,p):
        width=pdfmetrics.stringWidth(label,'Sans',17)+64;rect(x,y,width,43,p['ink'],r=3);text(label,x+16,y+11,'Sans',17,p['bg']);line(x+width-32,y+21,x+width-16,y+21,p['bg']);line(x+width-21,y+16,x+width-16,y+21,p['bg']);line(x+width-21,y+26,x+width-16,y+21,p['bg'])
    def footer(p,label):text(label,44,858,'Sans',15,p['muted'])

    # A designed overview, with an honest distinction between brand roles.
    rect(0,0,W,H,'#ECECE7');text('Portfolio / Visual direction',44,32,'Sans',17);text('10 September 2026',1060,32,'Sans',16)
    text('Three brands. Three distinct voices.',44,94,'Sans',52)
    text('One quality standard. A recognizable expression for each.',46,165,'Sans',21,'#526252')
    cards=[('frankx','FrankX','Sans','Serif',['Build what you','want to exist.'],'An editorial home for ideas, tools and the work behind them.','Instrument Sans + Instrument Serif'),('arcanea','Arcanea','Geist','News',['A world begins','with one page.'],'A world and a studio for people who create stories worth returning to.','Geist + Newsreader'),('starlight','Starlight Intelligence','Sans','News',['Give intelligence','a direction.'],'A future-facing institution with a clear structure for shared work.','Instrument Sans + Newsreader')]
    for i,(k,name,sans,serif,head,desc,pair) in enumerate(cards):
        p=COLORS[k];x=44+i*402;rect(x,230,386,516,p['bg']);text(name,x+26,258,sans,24 if i<2 else 22,p['ink']);line(x+26,306,x+360,306,p['line'])
        text('Aa',x+26,329,serif,116,p['accent']);text(head[0],x+26,466,sans if i!=1 else serif,34,p['ink']);text(head[1],x+26,507,serif,40,p['ink']);wrap(desc,x+26,579,332,sans,18,27,p['muted']);wrap(pair,x+26,697,335,sans,15,21,p['ink'])
    text('The next step is a selected kit that every publishing surface can reproduce.',44,782,'Sans',25)
    text('Applied specimens and recommendations. No production identity was changed.',44,831,'Sans',16,'#526252');c.showPage()

    p=page('frankx',2,'FrankX / Editorial and personal surfaces')
    text('Build what you',48,104,'Sans',72,p['ink']);text('want to exist.',48,184,'Serif',86,p['ink'])
    wrap('A place to think deeply, make useful things and share what works. Explore the essays, music and systems taking shape along the way.',50,292,625,'Sans',22,33,p['muted']);button('Explore the field notes',50,410,p)
    rect(826,111,350,344,p['card'],p['line']);text('Notes from the work',852,138,'Sans',16,p['muted']);text('Ideas into',852,205,'Serif',63,p['ink']);text('practice.',852,274,'Serif',63,p['ink']);line(852,363,1148,363,p['line']);text('FrankX',852,391,'Sans',17,p['ink']);text('Open notebook',1027,392,'Sans',15,p['muted']);rect(1159,144,18,62,p['accent'])
    line(44,494,1236,494,p['line']);text('Same headline. Two typographic positions.',48,518,'Sans',22,p['ink'])
    text('Recommended / Instrument Sans + Instrument Serif',48,565,'Sans',15,p['muted']);text('Build what you',48,595,'Sans',32,p['ink']);text('want to exist.',48,634,'Serif',44,p['ink'])
    text('Alternative / Inter + Playfair Display',654,565,'Sans',15,p['muted']);text('Build what you',654,595,'Inter',32,p['ink']);text('want to exist.',654,634,'Playfair',44,p['ink'])
    line(44,702,1236,702,p['line']);wrap('Choose the Instrument pairing for new editorial work. Retain Inter for existing technical interfaces; do not turn every FrankX route into a magazine.',48,725,700,'Sans',20,28,p['ink']);wrap('Signature\nWarm paper. Forest ink. One expressive phrase. No decorative uppercase.',867,725,350,'Sans',17,25,p['muted']);footer(p,'Type by role / Editorial recommendation; flagship migration remains separate.');c.showPage()

    p=page('arcanea',3,'Arcanea / A reading room with a world around it')
    text('A world begins',48,107,'News',74,p['ink']);text('with one page.',48,190,'News',74,p['accent']);wrap('Give a character a reason to leave home. Follow a thread of music. Keep the details that make the world yours.',50,289,640,'Geist',22,33,p['muted']);button('Enter the reading room',50,411,p)
    # Original geometric threshold study, not a new logo or world-canon asset.
    rect(840,115,304,315,p['card'],p['line']);circle(992,251,116,p['card'],False,'#8C795D');circle(992,251,89,p['card'],False,'#607582');text('Aa',917,181,'News',120,p['accent']);line(875,378,1109,378,p['accent']);text('A threshold for the imagination',834,460,'Geist',16,p['muted'])
    line(44,504,1236,504,p['line']);text('Original reading specimen',48,527,'Geist',16,p['muted']);wrap('The sea kept every story that had never found its ending. At dusk, they washed ashore as small blue stones, still warm with the voices of the people who had imagined them.',48,563,600,'News',26,37,p['ink']);text('Recommended / Geist + Newsreader',731,527,'Geist',16,p['muted']);text('A world begins',731,553,'News',36,p['ink']);text('with one page.',731,594,'News',36,p['accent']);text('Alternate display / Instrument Serif',731,653,'Geist',16,p['muted']);text('A world begins',731,679,'Serif',36,p['ink']);text('with one page.',731,720,'Serif',36,p['accent'])
    wrap('Choose Newsreader for sustained lore. Use Instrument Serif for brief narrative display on a separate surface, with Geist handling its body text.',48,782,1160,'Geist',18,26,p['ink']);footer(p,'The world carries the spectacle. Reading stays quiet. No newly approved mark.');c.showPage()

    p=page('starlight',4,'Starlight / Public horizon, operational clarity')
    text('Give intelligence',48,108,'Sans',69,p['ink']);text('a direction.',48,187,'News',79,p['accent']);wrap('Bring ambitious questions into shared work. Connect research, human judgment and capable systems so the next decision has somewhere solid to stand.',50,291,660,'Sans',22,33,p['muted']);button('Explore the work',50,410,p)
    for r,col in [(147,'#D4E7E1'),(119,'#AACBC6'),(89,'#76A9AC'),(52,'#376C7C')]:circle(1010,267,r,col)
    c.setStrokeColor(HexColor('#4F808B'));c.setLineWidth(1);c.ellipse(826,H-359,1196,H-163,stroke=1,fill=0);circle(1135,205,8,'#C99750');text('From a question to a shared horizon',819,459,'Sans',16,p['muted'])
    line(44,505,1236,505,p['line'])
    for i,(a,b,z) in enumerate([('Research','A question with sources that can be inspected.','Trace the evidence'),('Human + AI systems','Responsibilities and a visible decision owner.','Keep judgment visible'),('Academy','A learning path that ends in something you made.','artifact / 001')]):
        y=530+i*64;text(a,48,y,'Sans',19,p['ink']);text(b,325,y,'Sans',18,p['muted']);text(z,1000,y,'Mono' if i==2 else 'Sans',15,p['ink']);line(44,y+40,1236,y+40,p['line'])
    text('Newsreader / kit-based recommendation',48,747,'Sans',16,p['muted']);text('Give intelligence a direction.',48,781,'News',36,p['ink']);text('Instrument Serif / observed loader',737,747,'Sans',16,p['muted']);text('Give intelligence a direction.',737,781,'Serif',36,p['ink']);footer(p,'Restore the documented editorial role. The loader is evidence of drift, not authority.');c.showPage()

    p=page('frankx',5,'From a chosen direction to a dependable kit')
    text('Make quality repeatable.',46,103,'Sans',55,p['ink']);wrap('A kit is a versioned release that downstream tools can reproduce. The repository holds the decision; Figma, Canva and product code carry it into use.',48,181,1030,'Sans',24,34,p['muted'])
    rows=[('01','Choose','An owner-selected direction with explicit font roles and a named surface.'),('02','Package','Exact font files and notices; original logo masters; colors, spacing and copy rules.'),('03','Prove','Desktop and phone layouts, fallback, accessibility and actual platform exports.'),('04','Distribute','One pinned version in product code, a Figma library and a Canva publishing kit.')]
    for i,(n,title,desc) in enumerate(rows):
        y=294+i*84;line(44,y,1236,y,p['line']);text(n,48,y+20,'Serif',32,p['accent']);text(title,120,y+23,'Sans',24,p['ink']);wrap(desc,331,y+21,867,'Sans',20,28,p['muted'])
    line(44,630,1236,630,p['line']);text('Build original marks before a full typeface.',48,657,'Sans',29,p['ink']);wrap('A custom wordmark or symbol can create recognition with a bounded asset. A full font family earns its own repository only when language, platform, identity or licensing economics justify maintaining one.',48,708,1120,'Sans',20,29,p['muted'])
    text('Evidence boundary',48,788,'SansBold',16,p['ink']);wrap('This book is independently typeset from verified source fonts. It is not browser, Figma or Canva proof. Source files, OFL notices and the interactive specimen accompany the GitHub draft.',212,788,1000,'Sans',15,21,p['muted']);footer(p,'github.com/frankxai/starlight-design-intelligence/pull/22')
    c.linkURL('https://github.com/frankxai/starlight-design-intelligence/pull/22',(44,14,840,42),relative=0)
    c.linkURL('https://github.com/google/fonts/tree/334b789e33413f3aba4264d9aa6c97f7b94c5a2f',(212,48,1236,112),relative=0)
    c.save();temp.cleanup()
    print(json.dumps({'path':str(out.resolve()),'pages':5,'textRuns':len(boxes),'boundsChecked':True,'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'sourceFontFiles':9,'renderMethod':'ReportLab; explicit static font instances; not browser capture'}))


if __name__=='__main__':
    ap=argparse.ArgumentParser();ap.add_argument('--cache',type=Path,required=True);ap.add_argument('--out',type=Path,required=True);a=ap.parse_args();main(a.cache,a.out)
