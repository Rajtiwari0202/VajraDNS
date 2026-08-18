import zipfile
import xml.etree.ElementTree as ET

with zipfile.ZipFile('SIH2025-IDEA-Presentation-Format.pptx', 'r') as z:
    slides = [f for f in z.namelist() if f.startswith('ppt/slides/slide') and f.endswith('.xml')]
    slides.sort(key=lambda x: int(x.split('slide')[-1].split('.')[0]))
    print(f"Total Slides: {len(slides)}")
    
    for idx, s in enumerate(slides, 1):
        tree = ET.fromstring(z.read(s))
        texts = [node.text.strip() for node in tree.iter() if node.text and node.text.strip()]
        print("=" * 60)
        print(f"SLIDE {idx}:")
        print("=" * 60)
        for t in texts:
            print(f" - {t}")
