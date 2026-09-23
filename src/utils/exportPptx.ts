import PptxGenJS from 'pptxgenjs';
import { Presentation, ShapeElement, TableElement, TextElement, ImageElement } from '../types/presentation';

// Helper to sanitize hex color for pptxgenjs (needs 6 hex chars without #, or default)
function sanitizeColor(hexColor?: string, defaultColor: string = 'FFFFFF'): string {
  if (!hexColor) return defaultColor;
  const clean = hexColor.trim().replace(/^#/, '');
  
  // If rgba or transparent
  if (clean.startsWith('rgba') || clean === 'transparent') {
    return defaultColor;
  }
  
  // If 3 hex chars, expand to 6
  if (clean.length === 3) {
    return clean.split('').map(c => c + c).join('').toUpperCase();
  }
  
  // If valid 6 or 8 chars hex
  if (clean.length >= 6) {
    return clean.substring(0, 6).toUpperCase();
  }
  
  return defaultColor;
}

// Map app shape types to PptxGenJS shape types
function mapShapeType(pptx: PptxGenJS, shapeType?: string): PptxGenJS.ShapeType {
  const shapes = pptx.ShapeType;
  switch (shapeType) {
    case 'circle':
      return shapes.ellipse;
    case 'rounded-rect':
      return shapes.roundRect;
    case 'triangle':
      return shapes.triangle;
    case 'diamond':
      return shapes.diamond;
    case 'pentagon':
      return shapes.pentagon;
    case 'hexagon':
      return shapes.hexagon;
    case 'star':
      return shapes.star5;
    case 'arrow-right':
      return shapes.rightArrow;
    case 'arrow-left':
      return shapes.leftArrow;
    case 'arrow-up':
      return shapes.upArrow;
    case 'arrow-down':
      return shapes.downArrow;
    case 'heart':
      return shapes.heart;
    case 'callout':
      return shapes.wedgeRectCallout;
    case 'cylinder':
      return shapes.can;
    case 'cube':
      return shapes.cube;
    case 'cloud':
      return shapes.cloud;
    case 'sun':
      return shapes.sun;
    case 'lightning':
      return shapes.lightningBolt;
    case 'banner':
      return shapes.ribbon;
    case 'line':
      return shapes.line;
    case 'rectangle':
    default:
      return shapes.rect;
  }
}

/**
 * Export presentation into a genuine Microsoft PowerPoint (.pptx) file
 */
export async function exportToPowerPoint(presentation: Presentation): Promise<void> {
  const pptx = new PptxGenJS();

  // Set Presentation Metadata
  pptx.title = presentation.title || 'Bài Giảng';
  pptx.subject = presentation.subject || 'Bài giảng điện tử';
  pptx.author = presentation.author || 'Giáo viên';
  pptx.company = 'Kho Bài Giảng Điện Tử';
  pptx.revision = '1';

  // Set Aspect Ratio & Dimensions (inches)
  const is4x3 = presentation.aspectRatio === '4:3';
  const slideWidth = 10;
  const slideHeight = is4x3 ? 7.5 : 5.625;

  if (is4x3) {
    pptx.layout = 'LAYOUT_4x3';
  } else {
    pptx.layout = 'LAYOUT_16x9';
  }

  const toX = (val: number) => (Math.max(0, Math.min(100, val)) / 100) * slideWidth;
  const toY = (val: number) => (Math.max(0, Math.min(100, val)) / 100) * slideHeight;
  const toW = (val: number) => (Math.max(0.5, Math.min(100, val)) / 100) * slideWidth;
  const toH = (val: number) => (Math.max(0.5, Math.min(100, val)) / 100) * slideHeight;

  // Iterate each slide
  for (let sIndex = 0; sIndex < presentation.slides.length; sIndex++) {
    const slideData = presentation.slides[sIndex];
    const pptSlide = pptx.addSlide();

    // 1. Slide Background
    if (slideData.backgroundColor) {
      if (slideData.backgroundColor.startsWith('linear-gradient') || slideData.backgroundColor.startsWith('radial-gradient')) {
        const match = slideData.backgroundColor.match(/#[a-fA-F0-9]{3,8}/);
        const bgColor = match ? sanitizeColor(match[0], '1E293B') : '1E293B';
        pptSlide.background = { color: bgColor };
      } else {
        pptSlide.background = { color: sanitizeColor(slideData.backgroundColor, '1E293B') };
      }
    } else {
      pptSlide.background = { color: '1E293B' };
    }

    // 2. Speaker Notes
    if (slideData.notes && slideData.notes.trim()) {
      pptSlide.addNotes(slideData.notes.trim());
    }

    // 3. Sort elements by zIndex
    const sortedElements = [...slideData.elements].sort((a, b) => (a.zIndex || 1) - (b.zIndex || 1));

    for (const el of sortedElements) {
      const elX = toX(el.x);
      const elY = toY(el.y);
      const elW = toW(el.width);
      const elH = toH(el.height);

      try {
        switch (el.type) {
          case 'text': {
            const textEl = el as TextElement;
            const hasImg = Boolean(textEl.imageUrl);
            const imgPos = textEl.imagePosition || 'top';

            // If text element has an embedded image
            if (hasImg && textEl.imageUrl) {
              if (imgPos === 'background') {
                try {
                  pptSlide.addImage({
                    data: textEl.imageUrl,
                    x: elX,
                    y: elY,
                    w: elW,
                    h: elH
                  });
                } catch (e) {
                  console.warn('Failed to embed text background image:', e);
                }
                
                pptSlide.addText(textEl.text || '', {
                  x: elX,
                  y: elY,
                  w: elW,
                  h: elH,
                  fontSize: Math.max(10, Math.round((textEl.fontSize || 22) * 0.75)),
                  fontFace: textEl.fontFamily || 'Segoe UI',
                  color: sanitizeColor(textEl.color, 'FFFFFF'),
                  bold: textEl.fontWeight === 'bold' || textEl.fontWeight === '700',
                  italic: textEl.fontStyle === 'italic',
                  underline: textEl.textDecoration === 'underline' ? { style: 'sng' } : undefined,
                  align: (textEl.textAlign || 'left') as any,
                  valign: 'middle'
                });
              } else if (imgPos === 'top') {
                const imgH = elH * 0.55;
                const txtH = elH * 0.44;
                try {
                  pptSlide.addImage({
                    data: textEl.imageUrl,
                    x: elX,
                    y: elY,
                    w: elW,
                    h: imgH
                  });
                } catch (e) {
                  console.warn('Failed to embed text top image:', e);
                }

                pptSlide.addText(textEl.text || '', {
                  x: elX,
                  y: elY + imgH,
                  w: elW,
                  h: txtH,
                  fontSize: Math.max(10, Math.round((textEl.fontSize || 20) * 0.7)),
                  fontFace: textEl.fontFamily || 'Segoe UI',
                  color: sanitizeColor(textEl.color, 'FFFFFF'),
                  bold: textEl.fontWeight === 'bold' || textEl.fontWeight === '700',
                  italic: textEl.fontStyle === 'italic',
                  underline: textEl.textDecoration === 'underline' ? { style: 'sng' } : undefined,
                  align: (textEl.textAlign || 'left') as any,
                  valign: 'top'
                });
              } else {
                const txtH = elH * 0.45;
                const imgH = elH * 0.54;
                pptSlide.addText(textEl.text || '', {
                  x: elX,
                  y: elY,
                  w: elW,
                  h: txtH,
                  fontSize: Math.max(10, Math.round((textEl.fontSize || 20) * 0.7)),
                  fontFace: textEl.fontFamily || 'Segoe UI',
                  color: sanitizeColor(textEl.color, 'FFFFFF'),
                  bold: textEl.fontWeight === 'bold' || textEl.fontWeight === '700',
                  italic: textEl.fontStyle === 'italic',
                  underline: textEl.textDecoration === 'underline' ? { style: 'sng' } : undefined,
                  align: (textEl.textAlign || 'left') as any,
                  valign: 'top'
                });

                try {
                  pptSlide.addImage({
                    data: textEl.imageUrl,
                    x: elX,
                    y: elY + txtH,
                    w: elW,
                    h: imgH
                  });
                } catch (e) {
                  console.warn('Failed to embed text bottom image:', e);
                }
              }
            } else {
              // Standard Text Box
              const textOptions: PptxGenJS.TextPropsOptions = {
                x: elX,
                y: elY,
                w: elW,
                h: elH,
                fontSize: Math.max(10, Math.round((textEl.fontSize || 22) * 0.75)),
                fontFace: textEl.fontFamily || 'Segoe UI',
                color: sanitizeColor(textEl.color, 'FFFFFF'),
                bold: textEl.fontWeight === 'bold' || textEl.fontWeight === '700',
                italic: textEl.fontStyle === 'italic',
                underline: textEl.textDecoration === 'underline' ? { style: 'sng' } : undefined,
                align: (textEl.textAlign || 'left') as any,
                valign: 'middle',
                wrap: true
              };

              if (textEl.backgroundColor && textEl.backgroundColor !== 'transparent') {
                textOptions.fill = { color: sanitizeColor(textEl.backgroundColor, '000000') };
              }

              pptSlide.addText(textEl.text || '', textOptions);
            }
            break;
          }

          case 'image': {
            const imgEl = el as ImageElement;
            if (imgEl.src) {
              pptSlide.addImage({
                data: imgEl.src,
                x: elX,
                y: elY,
                w: elW,
                h: elH,
                altText: imgEl.alt || 'Hình ảnh bài giảng'
              });
            }
            break;
          }

          case 'shape': {
            const shapeEl = el as ShapeElement;
            const pShapeType = mapShapeType(pptx, shapeEl.shapeType);
            const fillColor = sanitizeColor(shapeEl.fillColor, '3B82F6');
            const strokeColor = sanitizeColor(shapeEl.strokeColor, 'FFFFFF');

            pptSlide.addShape(pShapeType, {
              x: elX,
              y: elY,
              w: elW,
              h: elH,
              fill: { color: fillColor },
              line: { color: strokeColor, width: shapeEl.strokeWidth || 1 }
            });

            if (shapeEl.text && shapeEl.text.trim()) {
              pptSlide.addText(shapeEl.text, {
                x: elX,
                y: elY,
                w: elW,
                h: elH,
                fontSize: Math.max(10, Math.round((shapeEl.fontSize || 18) * 0.75)),
                color: sanitizeColor(shapeEl.textColor, 'FFFFFF'),
                align: 'center',
                valign: 'middle',
                bold: true
              });
            }
            break;
          }

          case 'table': {
            const tableEl = el as TableElement;
            if (tableEl.data && tableEl.data.length > 0) {
              const tableRows: PptxGenJS.TableRow[] = tableEl.data.map((row, rIdx) => {
                const isHeader = rIdx === 0;
                return row.map((cellText) => ({
                  text: cellText || '',
                  options: {
                    fill: { color: isHeader ? '0284C7' : (rIdx % 2 === 0 ? '1E293B' : '0F172A') },
                    color: 'FFFFFF',
                    bold: isHeader,
                    fontSize: isHeader ? 12 : 11,
                    align: 'center',
                    valign: 'middle',
                    border: { type: 'solid', pt: 1, color: '475569' }
                  }
                }));
              });

              pptSlide.addTable(tableRows, {
                x: elX,
                y: elY,
                w: elW,
                h: elH
              });
            }
            break;
          }

          case 'wordart': {
            pptSlide.addText(el.text || 'WORDART', {
              x: elX,
              y: elY,
              w: elW,
              h: elH,
              fontSize: Math.max(16, Math.round((el.fontSize || 38) * 0.8)),
              fontFace: 'Arial Black',
              color: 'F59E0B',
              bold: true,
              align: 'center',
              valign: 'middle'
            });
            break;
          }

          case 'smartart': {
            const smEl = el as any;
            if (smEl.items && Array.isArray(smEl.items)) {
              const count = smEl.items.length;
              const cardWidth = elW / count;
              smEl.items.forEach((item: any, i: number) => {
                const itemX = elX + i * cardWidth;
                pptSlide.addShape(pptx.ShapeType.roundRect, {
                  x: itemX,
                  y: elY,
                  w: Math.max(0.4, cardWidth - 0.1),
                  h: elH,
                  fill: { color: sanitizeColor(item.color, '0284C7') }
                });

                pptSlide.addText([
                  { text: (item.title || '') + '\n', options: { bold: true, fontSize: 13, color: 'FFFFFF' } },
                  { text: item.desc || '', options: { fontSize: 10, color: 'F1F5F9' } }
                ], {
                  x: itemX + 0.05,
                  y: elY + 0.1,
                  w: Math.max(0.3, cardWidth - 0.2),
                  h: Math.max(0.3, elH - 0.2),
                  valign: 'top',
                  align: 'center'
                });
              });
            }
            break;
          }

          case 'cameo': {
            pptSlide.addShape(pptx.ShapeType.ellipse, {
              x: elX,
              y: elY,
              w: elW,
              h: elH,
              fill: { color: '475569' },
              line: { color: '38BDF8', width: 3 }
            });
            pptSlide.addText('📷 Cameo (Camera)', {
              x: elX,
              y: elY,
              w: elW,
              h: elH,
              align: 'center',
              valign: 'middle',
              color: 'FFFFFF',
              fontSize: 11
            });
            break;
          }

          case 'video':
          case 'audio': {
            pptSlide.addShape(pptx.ShapeType.roundRect, {
              x: elX,
              y: elY,
              w: elW,
              h: elH,
              fill: { color: '1E293B' },
              line: { color: 'EF4444', width: 2 }
            });
            pptSlide.addText([
              { text: `${el.type === 'video' ? '🎬 Video' : '🎵 Audio'}: ${(el as any).title || 'Tệp đa phương tiện'}\n`, options: { bold: true, fontSize: 12, color: 'FFFFFF' } },
              { text: (el as any).src || '', options: { fontSize: 9, color: '93C5FD' } }
            ], {
              x: elX,
              y: elY,
              w: elW,
              h: elH,
              align: 'center',
              valign: 'middle'
            });
            break;
          }

          default:
            if ((el as any).text) {
              pptSlide.addText((el as any).text, {
                x: elX,
                y: elY,
                w: elW,
                h: elH,
                fontSize: 14,
                color: 'FFFFFF'
              });
            }
            break;
        }
      } catch (elemErr) {
        console.warn('Error exporting element to pptx:', el, elemErr);
      }
    }
  }

  // Generate and download file
  const fileName = (presentation.title || 'Bai_Giang_Dien_Tu')
    .replace(/[\\/:*?"<>|]/g, '_')
    .trim() + '.pptx';

  await pptx.writeFile({ fileName });
}
