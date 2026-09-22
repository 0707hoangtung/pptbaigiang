import JSZip from 'jszip';
import { 
  Presentation, 
  Slide, 
  SlideElement, 
  TextElement, 
  ShapeElement, 
  ImageElement, 
  TableElement, 
  ShapeType 
} from '../types/presentation';

// Helper to convert English Metric Units (EMU) to percentage coordinates (0 - 100)
// 1 inch = 914,400 EMUs. Standard 16:9 slide = 12,192,000 x 6,858,000 EMUs
// Standard 4:3 slide = 9,144,000 x 6,858,000 EMUs
function emuToPercent(val: number, totalSlideEmu: number): number {
  if (!totalSlideEmu || totalSlideEmu <= 0) return 0;
  const pct = (val / totalSlideEmu) * 100;
  return Math.max(0, Math.min(100, Math.round(pct * 10) / 10));
}

// Convert color hex or scheme to CSS color
function parseColor(colorNode: Element | null): string | null {
  if (!colorNode) return null;
  const srgb = colorNode.querySelector('srgbClr');
  if (srgb) {
    const val = srgb.getAttribute('val');
    if (val) return `#${val}`;
  }
  const scrgb = colorNode.querySelector('scrgbClr');
  if (scrgb) {
    const r = Math.round((parseInt(scrgb.getAttribute('r') || '0', 10) / 1000) * 255);
    const g = Math.round((parseInt(scrgb.getAttribute('g') || '0', 10) / 1000) * 255);
    const b = Math.round((parseInt(scrgb.getAttribute('b') || '0', 10) / 1000) * 255);
    return `rgb(${r}, ${g}, ${b})`;
  }
  const prstClr = colorNode.querySelector('prstClr');
  if (prstClr) {
    const val = prstClr.getAttribute('val');
    if (val) return val;
  }
  return null;
}

// Map PPT preset geometry string to our ShapeType
function mapPptShapeType(prst: string | null): ShapeType {
  if (!prst) return 'rect';
  const lower = prst.toLowerCase();
  if (lower.includes('roundrect')) return 'rounded-rect';
  if (lower.includes('ellipse') || lower.includes('circle')) return 'circle';
  if (lower.includes('triangle')) return 'triangle';
  if (lower.includes('diamond')) return 'diamond';
  if (lower.includes('star')) return 'star';
  if (lower.includes('heart')) return 'heart';
  if (lower.includes('cloud')) return 'cloud';
  if (lower.includes('arrow') && lower.includes('double')) return 'arrow-double';
  if (lower.includes('arrow') || lower.includes('rightarrow')) return 'arrow-right';
  if (lower.includes('cylinder')) return 'cylinder';
  if (lower.includes('line')) return 'line';
  return 'rect';
}

export interface PptxImportResult {
  presentation: Presentation;
  slideCount: number;
  imageCount: number;
  warnings: string[];
}

export async function parsePowerPointFile(
  file: File, 
  onProgress?: (msg: string, percent: number) => void
): Promise<PptxImportResult> {
  onProgress?.('Đang đọc tệp PowerPoint...', 10);
  const arrayBuffer = await file.arrayBuffer();
  
  onProgress?.('Đang giải nén tài liệu...', 20);
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  const warnings: string[] = [];
  const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, "");

  // 1. Parse presentation.xml for slide dimensions & slide list
  let slideWidthEmu = 12192000; // default 16:9 width
  let slideHeightEmu = 6858000; // default 16:9 height
  let aspectRatio: '16:9' | '4:3' = '16:9';

  const presXmlFile = zip.file('ppt/presentation.xml');
  const slideRIds: string[] = [];

  if (presXmlFile) {
    const presXmlStr = await presXmlFile.async('text');
    const parser = new DOMParser();
    const presDoc = parser.parseFromString(presXmlStr, 'application/xml');
    
    // Slide dimensions
    const sldSz = presDoc.querySelector('sldSz');
    if (sldSz) {
      const cx = parseInt(sldSz.getAttribute('cx') || '0', 10);
      const cy = parseInt(sldSz.getAttribute('cy') || '0', 10);
      if (cx > 0 && cy > 0) {
        slideWidthEmu = cx;
        slideHeightEmu = cy;
        const ratio = cx / cy;
        aspectRatio = ratio >= 1.5 ? '16:9' : '4:3';
      }
    }

    // Slide IDs list
    const sldIdNodes = presDoc.querySelectorAll('sldId');
    sldIdNodes.forEach(node => {
      const rId = node.getAttribute('r:id') || node.getAttribute('id');
      if (rId) slideRIds.push(rId);
    });
  }

  // 2. Map rId to slide path from ppt/_rels/presentation.xml.rels
  const slidePathMap = new Map<string, string>();
  const presRelsFile = zip.file('ppt/_rels/presentation.xml.rels');
  if (presRelsFile) {
    const relsXmlStr = await presRelsFile.async('text');
    const parser = new DOMParser();
    const relsDoc = parser.parseFromString(relsXmlStr, 'application/xml');
    const relationships = relsDoc.querySelectorAll('Relationship');
    relationships.forEach(rel => {
      const id = rel.getAttribute('Id');
      const target = rel.getAttribute('Target');
      if (id && target && target.includes('slide')) {
        // target might be "slides/slide1.xml" or "/ppt/slides/slide1.xml"
        const cleanPath = target.startsWith('/') ? target.substring(1) : `ppt/${target}`;
        slidePathMap.set(id, cleanPath.replace('ppt/ppt/', 'ppt/'));
      }
    });
  }

  // Determine slide file order
  let slidePaths: string[] = [];
  for (const rId of slideRIds) {
    const path = slidePathMap.get(rId);
    if (path && zip.file(path)) {
      slidePaths.push(path);
    }
  }

  // Fallback: If no slide paths found through rels, search directly
  if (slidePaths.length === 0) {
    const slideFileNames = Object.keys(zip.files).filter(k => /^ppt\/slides\/slide\d+\.xml$/i.test(k));
    slideFileNames.sort((a, b) => {
      const numA = parseInt(a.replace(/\D/g, '') || '0', 10);
      const numB = parseInt(b.replace(/\D/g, '') || '0', 10);
      return numA - numB;
    });
    slidePaths = slideFileNames;
  }

  if (slidePaths.length === 0) {
    throw new Error('Không tìm thấy trang slide nào trong file PowerPoint này. Vui lòng kiểm tra lại định dạng tệp .pptx.');
  }

  onProgress?.(`Đã tìm thấy ${slidePaths.length} trang slide. Đang trích xuất nội dung...`, 35);

  let totalImagesExtracted = 0;
  const slides: Slide[] = [];

  // Parse each slide
  for (let i = 0; i < slidePaths.length; i++) {
    const slidePath = slidePaths[i];
    const slideFile = zip.file(slidePath);
    if (!slideFile) continue;

    const progressPct = Math.round(35 + (i / slidePaths.length) * 55);
    onProgress?.(`Đang xử lý trang slide ${i + 1}/${slidePaths.length}...`, progressPct);

    const slideXmlStr = await slideFile.async('text');
    const parser = new DOMParser();
    const slideDoc = parser.parseFromString(slideXmlStr, 'application/xml');

    // 2.1 Load slide relationships (for images/media)
    // e.g. ppt/slides/_rels/slide1.xml.rels
    const slideRelsPath = slidePath.replace(/slides\/(slide\d+\.xml)/, 'slides/_rels/$1.rels');
    const slideRelsFile = zip.file(slideRelsPath);
    const mediaRelsMap = new Map<string, string>();

    if (slideRelsFile) {
      try {
        const relsXmlStr = await slideRelsFile.async('text');
        const relsDoc = parser.parseFromString(relsXmlStr, 'application/xml');
        const rels = relsDoc.querySelectorAll('Relationship');
        rels.forEach(r => {
          const id = r.getAttribute('Id');
          const target = r.getAttribute('Target');
          if (id && target) {
            // target could be "../media/image1.png"
            const cleanTarget = target.replace(/^\.\.\//, 'ppt/');
            mediaRelsMap.set(id, cleanTarget);
          }
        });
      } catch (err) {
        console.warn('Error reading slide rels:', err);
      }
    }

    // 2.2 Slide Background
    let slideBgColor = '#ffffff';
    const bgNode = slideDoc.querySelector('bg');
    if (bgNode) {
      const bgClr = parseColor(bgNode);
      if (bgClr) slideBgColor = bgClr;
    }

    const elements: SlideElement[] = [];
    let slideTitle = `Trang ${i + 1}`;

    // 2.3 Process Shapes & Text Boxes (<p:sp>)
    const spNodes = slideDoc.querySelectorAll('sp');
    spNodes.forEach((sp, spIdx) => {
      try {
        const xfrm = sp.querySelector('spPr > xfrm') || sp.querySelector('xfrm');
        let x = 10;
        let y = 10 + (spIdx * 12);
        let width = 80;
        let height = 20;

        if (xfrm) {
          const off = xfrm.querySelector('off');
          const ext = xfrm.querySelector('ext');
          if (off && ext) {
            const rawX = parseInt(off.getAttribute('x') || '0', 10);
            const rawY = parseInt(off.getAttribute('y') || '0', 10);
            const rawW = parseInt(ext.getAttribute('cx') || '0', 10);
            const rawH = parseInt(ext.getAttribute('cy') || '0', 10);

            x = emuToPercent(rawX, slideWidthEmu);
            y = emuToPercent(rawY, slideHeightEmu);
            width = Math.max(8, emuToPercent(rawW, slideWidthEmu));
            height = Math.max(6, emuToPercent(rawH, slideHeightEmu));
          }
        }

        // Shape fill & stroke
        const spPr = sp.querySelector('spPr');
        const fillColor = parseColor(spPr?.querySelector('solidFill') || null);
        const strokeNode = spPr?.querySelector('ln');
        const strokeColor = parseColor(strokeNode?.querySelector('solidFill') || null);
        const geomNode = spPr?.querySelector('prstGeom');
        const prstGeom = geomNode ? geomNode.getAttribute('prst') : null;

        // Text content
        const txBody = sp.querySelector('txBody');
        let fullText = '';
        let fontSize = 20;
        let isBold = false;
        let isItalic = false;
        let isUnderline = false;
        let textColor = '#1e293b';
        let textAlign: 'left' | 'center' | 'right' | 'justify' = 'left';
        let fontFamily = 'Segoe UI';

        if (txBody) {
          const paragraphs = txBody.querySelectorAll('p');
          const paragraphTexts: string[] = [];

          paragraphs.forEach((p, pIdx) => {
            const pPr = p.querySelector('pPr');
            if (pPr) {
              const algn = pPr.getAttribute('algn');
              if (algn === 'ctr') textAlign = 'center';
              else if (algn === 'r') textAlign = 'right';
              else if (algn === 'just') textAlign = 'justify';
            }

            let pText = '';
            const runs = p.querySelectorAll('r');
            runs.forEach(r => {
              const rPr = r.querySelector('rPr');
              if (rPr) {
                if (rPr.getAttribute('b') === '1') isBold = true;
                if (rPr.getAttribute('i') === '1') isItalic = true;
                if (rPr.getAttribute('u') === 'sng') isUnderline = true;
                
                const sz = parseInt(rPr.getAttribute('sz') || '0', 10);
                if (sz > 0) {
                  // sz is in 100ths of pt, e.g. 2400 = 24pt
                  fontSize = Math.round(sz / 100);
                }

                const clr = parseColor(rPr.querySelector('solidFill'));
                if (clr) textColor = clr;

                const latin = rPr.querySelector('latin');
                if (latin && latin.getAttribute('typeface')) {
                  fontFamily = latin.getAttribute('typeface') || fontFamily;
                }
              }

              const tNode = r.querySelector('t');
              if (tNode && tNode.textContent) {
                pText += tNode.textContent;
              }
            });

            // If no runs but field or directly text
            if (!pText) {
              const directT = p.querySelectorAll('t');
              directT.forEach(t => {
                if (t.textContent) pText += t.textContent;
              });
            }

            if (pText.trim()) {
              paragraphTexts.push(pText);
            }
          });

          fullText = paragraphTexts.join('\n');
        }

        // Check if this looks like a slide title
        if (fullText && fullText.length < 120 && (y < 28 || fontSize >= 28)) {
          if (slideTitle === `Trang ${i + 1}`) {
            slideTitle = fullText.split('\n')[0].substring(0, 80);
          }
        }

        // If shape has background or stroke or distinct geometry
        if (prstGeom && prstGeom !== 'rect' && prstGeom !== 'textbox') {
          const shapeEl: ShapeElement = {
            id: `el-shape-${i}-${spIdx}-${Date.now()}`,
            type: 'shape',
            shapeType: mapPptShapeType(prstGeom),
            fillColor: fillColor || '#3b82f6',
            strokeColor: strokeColor || 'transparent',
            strokeWidth: strokeColor ? 2 : 0,
            text: fullText,
            textColor: textColor || '#ffffff',
            fontSize: Math.min(fontSize, 32),
            x,
            y,
            width,
            height,
            zIndex: elements.length + 1
          };
          elements.push(shapeEl);
        } else if (fullText.trim()) {
          // Text element
          const textEl: TextElement = {
            id: `el-text-${i}-${spIdx}-${Date.now()}`,
            type: 'text',
            text: fullText,
            fontSize: Math.max(13, Math.min(fontSize, 56)),
            fontFamily,
            color: textColor,
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal',
            textDecoration: isUnderline ? 'underline' : 'none',
            textAlign,
            backgroundColor: fillColor || undefined,
            borderColor: strokeColor || undefined,
            borderWidth: strokeColor ? 1 : 0,
            padding: 8,
            x,
            y,
            width,
            height,
            zIndex: elements.length + 1
          };
          elements.push(textEl);
        } else if (fillColor || strokeColor) {
          // Decorative shape with no text
          const shapeEl: ShapeElement = {
            id: `el-decor-${i}-${spIdx}-${Date.now()}`,
            type: 'shape',
            shapeType: 'rect',
            fillColor: fillColor || '#e2e8f0',
            strokeColor: strokeColor || 'transparent',
            strokeWidth: strokeColor ? 1 : 0,
            x,
            y,
            width,
            height,
            zIndex: elements.length + 1
          };
          elements.push(shapeEl);
        }
      } catch (err) {
        console.warn('Error parsing shape:', err);
      }
    });

    // 2.4 Process Pictures (<p:pic>)
    const picNodes = slideDoc.querySelectorAll('pic');
    for (let picIdx = 0; picIdx < picNodes.length; picIdx++) {
      try {
        const pic = picNodes[picIdx];
        const xfrm = pic.querySelector('spPr > xfrm') || pic.querySelector('xfrm');
        let x = 20;
        let y = 25;
        let width = 60;
        let height = 50;

        if (xfrm) {
          const off = xfrm.querySelector('off');
          const ext = xfrm.querySelector('ext');
          if (off && ext) {
            const rawX = parseInt(off.getAttribute('x') || '0', 10);
            const rawY = parseInt(off.getAttribute('y') || '0', 10);
            const rawW = parseInt(ext.getAttribute('cx') || '0', 10);
            const rawH = parseInt(ext.getAttribute('cy') || '0', 10);

            x = emuToPercent(rawX, slideWidthEmu);
            y = emuToPercent(rawY, slideHeightEmu);
            width = Math.max(10, emuToPercent(rawW, slideWidthEmu));
            height = Math.max(10, emuToPercent(rawH, slideHeightEmu));
          }
        }

        const blip = pic.querySelector('blip');
        const rEmbed = blip ? (blip.getAttribute('r:embed') || blip.getAttribute('embed')) : null;

        if (rEmbed && mediaRelsMap.has(rEmbed)) {
          const mediaPath = mediaRelsMap.get(rEmbed)!;
          const mediaFile = zip.file(mediaPath);
          if (mediaFile) {
            const ext = mediaPath.split('.').pop()?.toLowerCase() || 'png';
            const mimeType = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'svg' ? 'image/svg+xml' : 'image/png';
            const base64Data = await mediaFile.async('base64');
            const dataUrl = `data:${mimeType};base64,${base64Data}`;

            const imgEl: ImageElement = {
              id: `el-img-${i}-${picIdx}-${Date.now()}`,
              type: 'image',
              src: dataUrl,
              alt: `Hình ảnh trang ${i + 1}`,
              objectFit: 'contain',
              borderRadius: 6,
              x,
              y,
              width,
              height,
              zIndex: elements.length + 1
            };
            elements.push(imgEl);
            totalImagesExtracted++;
          }
        }
      } catch (err) {
        console.warn('Error parsing picture:', err);
      }
    }

    // 2.5 Process Tables (<a:tbl>)
    const tblNodes = slideDoc.querySelectorAll('tbl');
    tblNodes.forEach((tbl, tblIdx) => {
      try {
        const trNodes = tbl.querySelectorAll('tr');
        const rows = trNodes.length;
        if (rows === 0) return;

        const tableData: string[][] = [];
        let cols = 0;

        trNodes.forEach(tr => {
          const tcNodes = tr.querySelectorAll('tc');
          cols = Math.max(cols, tcNodes.length);
          const rowData: string[] = [];
          tcNodes.forEach(tc => {
            const texts: string[] = [];
            tc.querySelectorAll('t').forEach(t => {
              if (t.textContent) texts.push(t.textContent);
            });
            rowData.push(texts.join(' ').trim());
          });
          tableData.push(rowData);
        });

        // Try getting parent frame position
        const frame = tbl.closest('graphicFrame');
        let x = 15;
        let y = 30;
        let width = 70;
        let height = 40;

        if (frame) {
          const xfrm = frame.querySelector('xfrm');
          if (xfrm) {
            const off = xfrm.querySelector('off');
            const ext = xfrm.querySelector('ext');
            if (off && ext) {
              const rawX = parseInt(off.getAttribute('x') || '0', 10);
              const rawY = parseInt(off.getAttribute('y') || '0', 10);
              const rawW = parseInt(ext.getAttribute('cx') || '0', 10);
              const rawH = parseInt(ext.getAttribute('cy') || '0', 10);
              x = emuToPercent(rawX, slideWidthEmu);
              y = emuToPercent(rawY, slideHeightEmu);
              width = Math.max(20, emuToPercent(rawW, slideWidthEmu));
              height = Math.max(15, emuToPercent(rawH, slideHeightEmu));
            }
          }
        }

        const tableEl: TableElement = {
          id: `el-tbl-${i}-${tblIdx}-${Date.now()}`,
          type: 'table',
          rows,
          cols,
          data: tableData,
          headerBgColor: '#1e5385',
          headerTextColor: '#ffffff',
          rowAltColor: '#f8fafc',
          borderColor: '#cbd5e1',
          fontSize: 14,
          x,
          y,
          width,
          height,
          zIndex: elements.length + 1
        };
        elements.push(tableEl);
      } catch (err) {
        console.warn('Error parsing table:', err);
      }
    });

    // 2.6 Fallback if empty slide: Create a default placeholder text
    if (elements.length === 0) {
      elements.push({
        id: `el-empty-${i}-${Date.now()}`,
        type: 'text',
        text: `Nội dung trang ${i + 1}`,
        fontSize: 28,
        fontFamily: 'Segoe UI',
        color: '#334155',
        fontWeight: 'bold',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'center',
        x: 20,
        y: 40,
        width: 60,
        height: 20,
        zIndex: 1
      });
    }

    slides.push({
      id: `slide-pptx-${i + 1}-${Date.now()}`,
      title: slideTitle,
      notes: '',
      backgroundColor: slideBgColor,
      elements,
      transition: 'fade'
    });
  }

  onProgress?.('Hoàn tất phân tích bài giảng PowerPoint!', 100);

  // Derive theme ID based on aspect ratio or background colors
  const finalPresentation: Presentation = {
    id: `pptx-user-${Date.now()}`,
    title: fileNameWithoutExt,
    subject: 'Bài giảng nhập từ PowerPoint',
    grade: 'Phổ thông',
    author: 'Giáo viên',
    updatedAt: new Date().toISOString().split('T')[0],
    aspectRatio,
    themeId: 'ocean-blue',
    slides
  };

  return {
    presentation: finalPresentation,
    slideCount: slides.length,
    imageCount: totalImagesExtracted,
    warnings
  };
}
