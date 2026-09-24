import React, { useRef, useState, useEffect } from 'react';
import { Slide, SlideElement } from '../types/presentation';
import { SlideElementRenderer } from './SlideElementRenderer';
import { Trash2, Copy, Move, ArrowUp, ArrowDown, Calculator, Sparkles, Image as ImageIcon, Layers, X as XIcon } from 'lucide-react';

interface SlideCanvasProps {
  slide: Slide;
  defaultSlideBg: string;
  selectedElementId: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (updated: Partial<SlideElement>) => void;
  onDeleteElement: () => void;
  onDuplicateElement: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onEditFormula?: (currentText: string) => void;
  onOpenAnimationsTab?: () => void;
  previewAnimationElementId?: string | null;
  aspectRatio: '16:9' | '4:3';
  zoomLevel: number; // 50 to 150 percent
  readOnly?: boolean;
}

export const SlideCanvas: React.FC<SlideCanvasProps> = ({
  slide,
  defaultSlideBg,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringForward,
  onSendBackward,
  onEditFormula,
  onOpenAnimationsTab,
  previewAnimationElementId,
  aspectRatio,
  zoomLevel,
  readOnly = false
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; elX: number; elY: number } | null>(null);
  const [resizeStart, setResizeStart] = useState<{
    mouseX: number;
    mouseY: number;
    elX: number;
    elY: number;
    elW: number;
    elH: number;
  } | null>(null);

  const slideBg = slide.backgroundColor || defaultSlideBg;

  // Sorted animated elements for PowerPoint order badges
  const animatedElements = (slide?.elements || [])
    .filter(el => el.animation && el.animation !== 'none')
    .sort((a, b) => (a.animationOrder ?? 999) - (b.animationOrder ?? 999));

  const getAnimationOrder = (elId: string) => {
    const idx = animatedElements.findIndex(el => el.id === elId);
    return idx !== -1 ? idx + 1 : null;
  };

  // Handle Dragging element
  const handleMouseDown = (e: React.MouseEvent, element: SlideElement) => {
    e.stopPropagation();
    onSelectElement(element.id);
    if (readOnly) return; // Do not drag if readOnly!

    if (canvasRef.current) {
      setDragStart({
        x: e.clientX,
        y: e.clientY,
        elX: element.x,
        elY: element.y
      });
      setIsDragging(true);
    }
  };

  // Handle Resizing element
  const handleResizeHandleDown = (e: React.MouseEvent, handle: string, element: SlideElement) => {
    e.stopPropagation();
    if (readOnly) return;
    setIsResizing(handle);
    setResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      elX: element.x,
      elY: element.y,
      elW: element.width,
      elH: element.height
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();

      // Dragging element
      if (isDragging && dragStart && selectedElementId) {
        const deltaXPixels = e.clientX - dragStart.x;
        const deltaYPixels = e.clientY - dragStart.y;

        const deltaXPercent = (deltaXPixels / rect.width) * 100;
        const deltaYPercent = (deltaYPixels / rect.height) * 100;

        const newX = Math.max(0, Math.min(95, Math.round(dragStart.elX + deltaXPercent)));
        const newY = Math.max(0, Math.min(95, Math.round(dragStart.elY + deltaYPercent)));

        onUpdateElement({ x: newX, y: newY });
      }

      // Resizing element
      if (isResizing && resizeStart && selectedElementId) {
        const deltaXPixels = e.clientX - resizeStart.mouseX;
        const deltaYPixels = e.clientY - resizeStart.mouseY;

        const deltaXPercent = (deltaXPixels / rect.width) * 100;
        const deltaYPercent = (deltaYPixels / rect.height) * 100;

        let newW = resizeStart.elW;
        let newH = resizeStart.elH;
        let newX = resizeStart.elX;
        let newY = resizeStart.elY;

        if (isResizing.includes('e')) {
          newW = Math.max(5, Math.min(100 - newX, Math.round(resizeStart.elW + deltaXPercent)));
        }
        if (isResizing.includes('s')) {
          newH = Math.max(5, Math.min(100 - newY, Math.round(resizeStart.elH + deltaYPercent)));
        }
        if (isResizing.includes('w')) {
          const possibleW = Math.round(resizeStart.elW - deltaXPercent);
          if (possibleW >= 5) {
            newW = possibleW;
            newX = Math.round(resizeStart.elX + deltaXPercent);
          }
        }
        if (isResizing.includes('n')) {
          const possibleH = Math.round(resizeStart.elH - deltaYPercent);
          if (possibleH >= 5) {
            newH = possibleH;
            newY = Math.round(resizeStart.elY + deltaYPercent);
          }
        }

        onUpdateElement({ x: newX, y: newY, width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(null);
      setDragStart(null);
      setResizeStart(null);
    };

    if (isDragging || isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, selectedElementId]);

  const selectedElement = slide.elements.find(el => el.id === selectedElementId);

  return (
    <div
      onClick={() => onSelectElement(null)}
      className="flex-1 bg-[#d8dde6] overflow-auto flex items-center justify-center p-6 select-none relative"
    >
      {/* Slide Container with aspect ratio and responsive scaling */}
      <div
        ref={canvasRef}
        className={`relative rounded-sm shadow-2xl transition-all duration-150 overflow-hidden ${
          aspectRatio === '16:9' ? 'w-[960px] aspect-video' : 'w-[800px] aspect-4/3'
        }`}
        style={{
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'center center',
          background: slide.backgroundGradient || slideBg
        }}
      >
        {/* Render Slide Elements */}
        {slide.elements.map((element) => {
            const isSelected = element.id === selectedElementId;
            const animOrder = getAnimationOrder(element.id);
            const isPreviewing = previewAnimationElementId === element.id || previewAnimationElementId === 'ALL';
            const animClass = isPreviewing && element.animation && element.animation !== 'none'
              ? element.animation === 'appear'
                ? 'animate-ppt-appear'
                : element.animation === 'fade-in'
                ? 'animate-ppt-fade-in'
                : element.animation === 'fly-in'
                ? 'animate-ppt-fly-in'
                : element.animation === 'zoom-in'
                ? 'animate-ppt-zoom-in'
                : ''
              : '';

            return (
              <div
                key={element.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectElement(element.id);
                }}
                onMouseDown={(e) => handleMouseDown(e, element)}
                className={`absolute cursor-move ${
                  isSelected 
                    ? 'ring-2 ring-blue-500 ring-offset-1 z-30 shadow-lg' 
                    : 'hover:ring-1 hover:ring-white/40 z-10'
                } ${animClass}`}
                style={{
                  left: `${element.x}%`,
                  top: `${element.y}%`,
                  width: `${element.width}%`,
                  height: `${element.height}%`,
                  zIndex: element.zIndex || 1
                }}
              >
                {/* PowerPoint-style Animation Order Badge */}
                {element.animation && element.animation !== 'none' && (
                  <div
                    className="absolute -top-3 -left-3 z-40 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md ring-2 ring-white cursor-pointer select-none transition-transform hover:scale-110 pointer-events-auto"
                    title={`Hiệu ứng #${animOrder}: ${element.animation.toUpperCase()}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectElement(element.id);
                      if (onOpenAnimationsTab) onOpenAnimationsTab();
                    }}
                  >
                    {animOrder}
                  </div>
                )}

                {/* Element Content Renderer */}
                <SlideElementRenderer
                  element={element}
                  isSelected={isSelected}
                  readOnly={readOnly}
                  onUpdateText={(newText) => onUpdateElement({ text: newText } as any)}
                  onUpdateTableCell={(row, col, val) => {
                    if (element.type === 'table') {
                      const currentData = [...element.data];
                      currentData[row] = [...currentData[row]];
                      currentData[row][col] = val;
                      onUpdateElement({ data: currentData } as any);
                    }
                  }}
                />

                {/* Selection Handles & Action Bar (Only when selected and NOT in readOnly mode) */}
                {isSelected && !readOnly && (
                  <>
                    {/* Floating Action Bar */}
                    <div 
                      className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white rounded px-2 py-1 flex items-center space-x-1.5 shadow-xl text-xs z-50 pointer-events-auto"
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      {element.type === 'text' && (
                        <>
                          <button
                            onClick={() => onEditFormula && onEditFormula((element as any).text || '')}
                            className="px-2 py-0.5 bg-blue-600 hover:bg-blue-500 rounded text-white flex items-center gap-1 font-bold text-[11px] shadow-xs cursor-pointer"
                            title="Soạn công thức Toán (LaTeX)"
                          >
                            <Calculator size={12} />
                            <span>LaTeX</span>
                          </button>

                          {/* Dán / Chèn ảnh vào Hộp chữ */}
                          <label 
                            className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-500 rounded text-white flex items-center gap-1 font-bold text-[11px] shadow-xs cursor-pointer"
                            title="Chèn ảnh vào Hộp chữ này (Hoặc bấm Ctrl + V khi đang chọn hộp chữ để dán nhanh)"
                          >
                            <ImageIcon size={12} />
                            <span>{(element as any).imageUrl ? 'Đổi ảnh' : 'Dán/Chèn ảnh'}</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (re) => {
                                    if (re.target?.result) {
                                      onUpdateElement({ 
                                        imageUrl: re.target.result as string, 
                                        imagePosition: (element as any).imagePosition || 'top',
                                        height: Math.max(element.height, 35)
                                      } as any);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>

                          {/* Toggle vị trí ảnh và nút gỡ ảnh */}
                          {(element as any).imageUrl && (
                            <>
                              <button
                                onClick={() => {
                                  const currentPos = (element as any).imagePosition || 'top';
                                  const nextPos = currentPos === 'top' ? 'bottom' : currentPos === 'bottom' ? 'background' : 'top';
                                  onUpdateElement({ imagePosition: nextPos } as any);
                                }}
                                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 rounded text-amber-300 flex items-center gap-1 text-[11px] cursor-pointer"
                                title={`Vị trí ảnh: ${(element as any).imagePosition === 'bottom' ? 'Dưới chữ' : (element as any).imagePosition === 'background' ? 'Làm nền' : 'Trên chữ'}. Bấm để đổi.`}
                              >
                                <Layers size={11} />
                                <span>
                                  {(element as any).imagePosition === 'bottom' ? 'Dưới' : (element as any).imagePosition === 'background' ? 'Nền' : 'Trên'}
                                </span>
                              </button>

                              <button
                                onClick={() => onUpdateElement({ imageUrl: undefined } as any)}
                                className="p-1 hover:bg-red-600/80 rounded text-slate-300 hover:text-white cursor-pointer"
                                title="Gỡ ảnh khỏi hộp chữ này"
                              >
                                <XIcon size={12} />
                              </button>
                            </>
                          )}
                        </>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenAnimationsTab) onOpenAnimationsTab();
                        }}
                        className={`px-1.5 py-0.5 rounded flex items-center gap-1 text-[11px] font-medium transition ${
                          element.animation && element.animation !== 'none'
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                            : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                        }`}
                        title="Cài đặt hiệu ứng cho khối này"
                      >
                        <Sparkles size={11} className={element.animation && element.animation !== 'none' ? 'text-amber-100' : ''} />
                        <span>
                          {element.animation && element.animation !== 'none'
                            ? `#${animOrder} ${
                                element.animation === 'fade-in' ? 'Mờ dần' :
                                element.animation === 'fly-in' ? 'Bay vào' :
                                element.animation === 'zoom-in' ? 'Thu phóng' : 'Xuất hiện'
                              }`
                            : 'Hiệu ứng'}
                        </span>
                      </button>
                      <button
                        onClick={onDuplicateElement}
                        className="p-1 hover:bg-slate-700 rounded text-slate-200 hover:text-white"
                        title="Nhân bản"
                      >
                      <Copy size={12} />
                    </button>
                    <button
                      onClick={onBringForward}
                      className="p-1 hover:bg-slate-700 rounded text-slate-200 hover:text-white"
                      title="Lên trên"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      onClick={onSendBackward}
                      className="p-1 hover:bg-slate-700 rounded text-slate-200 hover:text-white"
                      title="Xuống dưới"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <button
                      onClick={onDeleteElement}
                      className="p-1 hover:bg-red-600 rounded text-red-300 hover:text-white"
                      title="Xóa"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* 8 Resize Handles */}
                  {['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].map((handle) => {
                    let posClass = '';
                    let cursorClass = '';

                    switch (handle) {
                      case 'nw': posClass = '-top-1.5 -left-1.5'; cursorClass = 'cursor-nwse-resize'; break;
                      case 'n':  posClass = '-top-1.5 left-1/2 -translate-x-1/2'; cursorClass = 'cursor-ns-resize'; break;
                      case 'ne': posClass = '-top-1.5 -right-1.5'; cursorClass = 'cursor-nesw-resize'; break;
                      case 'e':  posClass = 'top-1/2 -right-1.5 -translate-y-1/2'; cursorClass = 'cursor-ew-resize'; break;
                      case 'se': posClass = '-bottom-1.5 -right-1.5'; cursorClass = 'cursor-nwse-resize'; break;
                      case 's':  posClass = '-bottom-1.5 left-1/2 -translate-x-1/2'; cursorClass = 'cursor-ns-resize'; break;
                      case 'sw': posClass = '-bottom-1.5 -left-1.5'; cursorClass = 'cursor-nesw-resize'; break;
                      case 'w':  posClass = 'top-1/2 -left-1.5 -translate-y-1/2'; cursorClass = 'cursor-ew-resize'; break;
                    }

                    return (
                      <div
                        key={handle}
                        onMouseDown={(e) => handleResizeHandleDown(e, handle, element)}
                        className={`absolute w-3 h-3 bg-white border-2 border-blue-600 rounded-xs shadow-xs z-40 ${posClass} ${cursorClass}`}
                      />
                    );
                  })}
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
