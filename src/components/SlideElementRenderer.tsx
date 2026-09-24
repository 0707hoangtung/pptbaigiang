import React, { useState } from 'react';
import { 
  SlideElement, 
  TextElement, 
  ShapeElement, 
  ImageElement, 
  TableElement, 
  ChartElement, 
  SmartArtElement, 
  WordArtElement, 
  CameoElement,
  VideoElement,
  AudioElement,
  LinkElement
} from '../types/presentation';
import { 
  ArrowRight, 
  CheckCircle2, 
  Star, 
  Camera, 
  BarChart3, 
  FileText,
  Volume2,
  Film,
  Play,
  Music,
  ExternalLink,
  Globe,
  Radio
} from 'lucide-react';
import { renderMixedMathContent } from '../utils/mathRenderer';
import { getYouTubeEmbedUrl, getFacebookEmbedUrl } from './MultimediaModal';

interface SlideElementRendererProps {
  element: SlideElement;
  isSelected: boolean;
  onUpdateText?: (newText: string) => void;
  onUpdateTableCell?: (rowIndex: number, colIndex: number, val: string) => void;
  isPresenterMode?: boolean;
  readOnly?: boolean;
}

export const SlideElementRenderer: React.FC<SlideElementRendererProps> = ({
  element,
  isSelected,
  onUpdateText,
  onUpdateTableCell,
  isPresenterMode = false,
  readOnly = false
}) => {
  const [isEditingInline, setIsEditingInline] = useState(false);
  const isLocked = isPresenterMode || readOnly;

  // 1. TEXT ELEMENT
  if (element.type === 'text') {
    const textEl = element as TextElement;
    const hasImage = Boolean(textEl.imageUrl);
    const imgPos = textEl.imagePosition || 'top';

    if (isEditingInline && !isLocked) {
      return (
        <div className="w-full h-full flex flex-col p-1.5 bg-black/30 rounded border border-blue-400 overflow-hidden">
          {hasImage && imgPos === 'top' && (
            <div className="h-2/5 w-full flex items-center justify-center p-1 bg-black/10 shrink-0 overflow-hidden mb-1">
              <img 
                src={textEl.imageUrl} 
                alt="Ảnh trong hộp chữ" 
                className="max-h-full max-w-full object-contain rounded" 
              />
            </div>
          )}
          <textarea
            value={textEl.text}
            onChange={(e) => onUpdateText && onUpdateText(e.target.value)}
            onBlur={() => setIsEditingInline(false)}
            autoFocus
            className="w-full flex-1 p-1 resize-none bg-transparent text-white focus:outline-hidden"
            style={{
              fontSize: `${textEl.fontSize}px`,
              fontFamily: textEl.fontFamily || 'Segoe UI',
              fontWeight: textEl.fontWeight || 'normal',
              fontStyle: textEl.fontStyle || 'normal',
              textAlign: textEl.textAlign || 'left',
              color: textEl.color || '#ffffff'
            }}
          />
          {hasImage && imgPos === 'bottom' && (
            <div className="h-2/5 w-full flex items-center justify-center p-1 bg-black/10 shrink-0 overflow-hidden mt-1">
              <img 
                src={textEl.imageUrl} 
                alt="Ảnh trong hộp chữ" 
                className="max-h-full max-w-full object-contain rounded" 
              />
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        onDoubleClick={() => !isLocked && setIsEditingInline(true)}
        className="w-full h-full flex flex-col select-none overflow-hidden"
        style={{
          fontSize: `${textEl.fontSize}px`,
          fontFamily: textEl.fontFamily || 'Segoe UI',
          fontWeight: textEl.fontWeight || 'normal',
          fontStyle: textEl.fontStyle || 'normal',
          textDecoration: textEl.textDecoration || 'none',
          color: textEl.color || '#ffffff',
          backgroundColor: textEl.backgroundColor,
          borderRadius: textEl.borderRadius ? `${textEl.borderRadius}px` : undefined,
          padding: textEl.padding ? `${textEl.padding}px` : '4px',
          lineHeight: '1.4',
          ...(hasImage && imgPos === 'background' ? {
            backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url(${textEl.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          } : {})
        }}
      >
        {/* Render image above text if top */}
        {hasImage && imgPos === 'top' && (
          <div className="w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden mb-1">
            <img 
              src={textEl.imageUrl} 
              alt="Ảnh trong hộp chữ" 
              className="max-h-full max-w-full object-contain rounded pointer-events-none" 
            />
          </div>
        )}

        {/* Text Content */}
        <div
          className={`w-full block ${hasImage && imgPos !== 'background' ? 'shrink-0' : 'my-auto'}`}
          style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            textAlign: textEl.textAlign || 'left'
          }}
        >
          {renderMixedMathContent(textEl.text)}
        </div>

        {/* Render image below text if bottom */}
        {hasImage && imgPos === 'bottom' && (
          <div className="w-full flex-1 min-h-0 flex items-center justify-center overflow-hidden mt-1">
            <img 
              src={textEl.imageUrl} 
              alt="Ảnh trong hộp chữ" 
              className="max-h-full max-w-full object-contain rounded pointer-events-none" 
            />
          </div>
        )}
      </div>
    );
  }

  // 2. SHAPE ELEMENT
  if (element.type === 'shape') {
    const shapeEl = element as ShapeElement;

    // Helper to render specific SVG shapes
    const renderShapeSVG = () => {
      switch (shapeEl.shapeType) {
        case 'circle':
          return (
            <ellipse 
              cx="50%" 
              cy="50%" 
              rx="48%" 
              ry="48%" 
              fill={shapeEl.fillColor} 
              stroke={shapeEl.strokeColor} 
              strokeWidth={shapeEl.strokeWidth || 1} 
            />
          );
        case 'triangle':
          return (
            <polygon 
              points="50,4 96,96 4,96" 
              fill={shapeEl.fillColor} 
              stroke={shapeEl.strokeColor} 
              strokeWidth={shapeEl.strokeWidth || 1} 
            />
          );
        case 'star':
          return (
            <polygon 
              points="50,4 63,35 96,38 71,60 78,94 50,77 22,94 29,60 4,38 37,35" 
              fill={shapeEl.fillColor} 
              stroke={shapeEl.strokeColor} 
              strokeWidth={shapeEl.strokeWidth || 1} 
            />
          );
        case 'arrow-right':
          return (
            <polygon 
              points="4,35 60,35 60,15 96,50 60,85 60,65 4,65" 
              fill={shapeEl.fillColor} 
              stroke={shapeEl.strokeColor} 
              strokeWidth={shapeEl.strokeWidth || 1} 
            />
          );
        case 'speech-bubble':
          return (
            <path 
              d="M10,10 H90 A6,6 0 0,1 96,16 V65 A6,6 0 0,1 90,71 H40 L25,90 V71 H10 A6,6 0 0,1 4,65 V16 A6,6 0 0,1 10,10 Z" 
              fill={shapeEl.fillColor} 
              stroke={shapeEl.strokeColor} 
              strokeWidth={shapeEl.strokeWidth || 1} 
            />
          );
        case 'diamond':
          return (
            <polygon 
              points="50,4 96,50 50,96 4,50" 
              fill={shapeEl.fillColor} 
              stroke={shapeEl.strokeColor} 
              strokeWidth={shapeEl.strokeWidth || 1} 
            />
          );
        default: // rect or rounded-rect
          return (
            <rect 
              x="2%" 
              y="2%" 
              width="96%" 
              height="96%" 
              rx={shapeEl.shapeType === 'rounded-rect' ? '8%' : '0'} 
              fill={shapeEl.fillColor} 
              stroke={shapeEl.strokeColor} 
              strokeWidth={shapeEl.strokeWidth || 1} 
            />
          );
      }
    };

    return (
      <div className="w-full h-full relative flex items-center justify-center">
        <svg className="w-full h-full absolute inset-0 overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
          {renderShapeSVG()}
        </svg>

        {shapeEl.text && (
          <div 
            onDoubleClick={() => !isLocked && setIsEditingInline(true)}
            className="relative z-10 p-2 text-center select-none font-medium leading-tight max-w-[90%]"
            style={{
              color: shapeEl.textColor || '#ffffff',
              fontSize: `${shapeEl.fontSize || 16}px`,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {renderMixedMathContent(shapeEl.text)}
          </div>
        )}
      </div>
    );
  }

  // 3. IMAGE ELEMENT
  if (element.type === 'image') {
    const imgEl = element as ImageElement;
    return (
      <div 
        className="w-full h-full overflow-hidden shadow-md flex items-center justify-center bg-black/20"
        style={{
          borderRadius: imgEl.borderRadius ? `${imgEl.borderRadius}px` : '8px',
          border: imgEl.borderColor ? `${imgEl.borderWidth || 2}px solid ${imgEl.borderColor}` : undefined
        }}
      >
        <img
          src={imgEl.src}
          alt={imgEl.alt || 'Slide photo'}
          className="w-full h-full object-cover pointer-events-none"
          crossOrigin="anonymous"
        />
      </div>
    );
  }

  // 4. TABLE ELEMENT
  if (element.type === 'table') {
    const tblEl = element as TableElement;
    return (
      <div className="w-full h-full overflow-auto rounded-lg shadow-sm border border-white/20 bg-slate-900/30">
        <table className="w-full h-full border-collapse text-left" style={{ fontSize: `${tblEl.fontSize || 16}px` }}>
          <thead>
            <tr style={{ backgroundColor: tblEl.headerBgColor || '#0284c7', color: tblEl.headerTextColor || '#ffffff' }}>
              {tblEl.data[0]?.map((head, colIdx) => (
                <th key={colIdx} className="p-2.5 font-bold border border-white/20">
                  {isLocked ? (
                    head
                  ) : (
                    <input
                      type="text"
                      value={head}
                      onChange={(e) => onUpdateTableCell && onUpdateTableCell(0, colIdx, e.target.value)}
                      className="w-full bg-transparent focus:outline-hidden font-bold"
                    />
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tblEl.data.slice(1).map((row, rIdx) => (
              <tr 
                key={rIdx} 
                style={{ 
                  backgroundColor: rIdx % 2 === 0 ? tblEl.rowAltColor || 'rgba(255,255,255,0.05)' : 'transparent',
                  color: '#ffffff'
                }}
              >
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className="p-2 border border-white/15">
                    {isLocked ? (
                      cell
                    ) : (
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => onUpdateTableCell && onUpdateTableCell(rIdx + 1, cIdx, e.target.value)}
                        className="w-full bg-transparent focus:outline-hidden"
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 5. CHART ELEMENT
  if (element.type === 'chart') {
    const chartEl = element as ChartElement;
    const maxVal = Math.max(...chartEl.data.map(d => d.value), 1);

    return (
      <div className="w-full h-full p-4 bg-slate-900/50 backdrop-blur-xs rounded-xl border border-white/20 flex flex-col justify-between text-white">
        <div className="font-bold text-base text-amber-300 mb-2 border-b border-white/15 pb-1 flex items-center gap-1.5">
          <BarChart3 size={18} />
          <span>{chartEl.title}</span>
        </div>

        {/* Bar Chart Visualization */}
        <div className="flex-1 flex items-end justify-around gap-2 pt-4 pb-2 px-2 border-b border-white/20">
          {chartEl.data.map((item, idx) => {
            const heightPercent = Math.max(8, Math.round((item.value / maxVal) * 85));
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-[11px] font-bold text-amber-300 mb-1 opacity-90 group-hover:opacity-100">
                  {item.value}
                </span>
                <div
                  className="w-full max-w-[48px] rounded-t-md transition-all duration-300 shadow-md group-hover:brightness-110"
                  style={{
                    height: `${heightPercent}%`,
                    backgroundColor: item.color || '#38bdf8'
                  }}
                />
                <span className="text-[10px] text-slate-200 mt-1.5 truncate max-w-full text-center font-medium">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // 6. SMARTART ELEMENT
  if (element.type === 'smartart') {
    const smEl = element as SmartArtElement;

    if (smEl.smartArtType === 'cards') {
      return (
        <div className="w-full h-full grid grid-cols-3 gap-4">
          {smEl.items.map((item) => (
            <div
              key={item.id}
              className="rounded-xl p-4 shadow-lg flex flex-col justify-between border border-white/20 text-white"
              style={{ backgroundColor: item.color || '#0284c7' }}
            >
              <div>
                <h4 className="font-bold text-lg mb-2 flex items-center gap-1.5 border-b border-white/20 pb-1">
                  <CheckCircle2 size={18} className="text-white/80" />
                  <span>{item.title}</span>
                </h4>
                <p className="text-sm text-white/90 leading-relaxed font-normal">
                  {item.desc}
                </p>
              </div>
              <div className="mt-2 text-right">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-white/80">
                  Trọng tâm
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Process flow
    return (
      <div className="w-full h-full flex items-center justify-between gap-2">
        {smEl.items.map((item, idx) => (
          <React.Fragment key={item.id}>
            <div
              className="flex-1 h-full rounded-xl p-3 shadow-md flex flex-col justify-center items-center text-center border border-white/20 text-white transition hover:scale-102"
              style={{ backgroundColor: item.color || '#0284c7' }}
            >
              <span className="font-bold text-base mb-1">{item.title}</span>
              {item.desc && <span className="text-xs text-white/85 leading-snug">{item.desc}</span>}
            </div>
            {idx < smEl.items.length - 1 && (
              <div className="shrink-0 text-amber-400">
                <ArrowRight size={22} className="stroke-[3]" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  // 7. WORDART ELEMENT
  if (element.type === 'wordart') {
    const waEl = element as WordArtElement;
    return (
      <div 
        className="w-full h-full flex items-center justify-center font-black tracking-wide text-center uppercase drop-shadow-md select-none"
        style={{
          fontSize: `${waEl.fontSize || 36}px`,
          color: waEl.stylePreset === 'golden' ? '#fde047' : '#ffffff',
          textShadow: '0 4px 12px rgba(0,0,0,0.6), 0 0 20px rgba(251,191,36,0.4)',
          letterSpacing: '0.05em'
        }}
      >
        {waEl.text}
      </div>
    );
  }

  // 8. CAMEO ELEMENT
  if (element.type === 'cameo') {
    return (
      <div className="w-full h-full rounded-full border-4 border-amber-400 overflow-hidden shadow-2xl relative bg-slate-900 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent flex flex-col justify-end p-2 items-center text-white">
          <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center mb-1 ring-2 ring-amber-300">
            <Camera size={24} className="text-amber-300" />
          </div>
          <span className="text-[11px] font-bold tracking-wide">Giáo viên (Cameo)</span>
          <span className="text-[9px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live Camera
          </span>
        </div>
      </div>
    );
  }

  // 9. VIDEO ELEMENT (Hỗ trợ file video máy tính & link YouTube / Facebook / Web)
  if (element.type === 'video') {
    const videoEl = element as VideoElement;
    const ytUrl = getYouTubeEmbedUrl(videoEl.url);
    const fbUrl = getFacebookEmbedUrl(videoEl.url);
    const isEmbed = Boolean(ytUrl || fbUrl);
    const embedSrc = ytUrl || fbUrl || videoEl.url;

    return (
      <div className="w-full h-full rounded-xl overflow-hidden shadow-xl border border-white/20 bg-black flex flex-col relative group">
        {/* Optional Title Bar */}
        {videoEl.title && (
          <div className="bg-slate-900/90 text-white text-[11px] font-semibold px-2.5 py-1 flex items-center justify-between border-b border-white/10 shrink-0 z-10">
            <div className="flex items-center gap-1.5 truncate">
              <Film size={13} className="text-red-400 shrink-0" />
              <span className="truncate">{videoEl.title}</span>
            </div>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-red-600/80 font-bold uppercase tracking-wider shrink-0 ml-1">
              {ytUrl ? 'YouTube' : fbUrl ? 'Facebook' : 'Video'}
            </span>
          </div>
        )}

        <div className="flex-1 w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
          {isEmbed ? (
            <iframe
              src={embedSrc}
              title={videoEl.title || 'Video Player'}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={videoEl.url}
              controls
              className="w-full h-full object-contain"
            />
          )}
        </div>
      </div>
    );
  }

  // 10. AUDIO ELEMENT (Hỗ trợ file âm thanh từ máy tính & link online)
  if (element.type === 'audio') {
    const audioEl = element as AudioElement;
    return (
      <div className="w-full h-full rounded-xl p-3 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/40 text-white shadow-xl flex flex-col justify-between select-none">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 truncate">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Music size={15} />
            </div>
            <div className="truncate">
              <h4 className="font-bold text-xs truncate leading-tight text-indigo-100">
                {audioEl.title || 'Âm thanh bài giảng'}
              </h4>
              <span className="text-[10px] text-indigo-300/80 flex items-center gap-1">
                <Volume2 size={11} className="text-emerald-400 animate-pulse" />
                <span>Âm thanh phát chuẩn</span>
              </span>
            </div>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-semibold shrink-0">
            Audio
          </span>
        </div>

        <div className="w-full mt-1">
          <audio
            src={audioEl.url}
            controls
            className="w-full h-8 rounded-md accent-indigo-500"
          />
        </div>
      </div>
    );
  }

  // 11. LINK ELEMENT (Liên kết web / tài liệu)
  if (element.type === 'link') {
    const linkEl = element as LinkElement;
    return (
      <div 
        onClick={(e) => {
          if (isPresenterMode) {
            e.stopPropagation();
            window.open(linkEl.url, '_blank', 'noopener,noreferrer');
          }
        }}
        className={`w-full h-full rounded-xl p-3.5 bg-gradient-to-r from-blue-900/90 to-indigo-900/90 border border-blue-400/40 text-white shadow-xl flex items-center justify-between transition ${
          isPresenterMode ? 'cursor-pointer hover:scale-102 hover:brightness-110' : ''
        }`}
        title={`Mở liên kết: ${linkEl.url}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-md ring-2 ring-blue-300/30">
            <ExternalLink size={20} />
          </div>
          <div className="truncate">
            <h4 className="font-bold text-xs text-white truncate leading-snug">
              {linkEl.title || linkEl.url}
            </h4>
            <p className="text-[11px] text-blue-200 truncate mt-0.5">
              {linkEl.description || linkEl.url}
            </p>
          </div>
        </div>

        <div className="shrink-0 ml-2 text-right">
          <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-blue-400/20 text-blue-200 border border-blue-300/30 flex items-center gap-1">
            <Globe size={11} />
            <span>{isPresenterMode ? 'Bấm mở ↗' : 'Liên kết'}</span>
          </span>
        </div>
      </div>
    );
  }

  return <div>{(element as any)?.type || ''}</div>;
};
