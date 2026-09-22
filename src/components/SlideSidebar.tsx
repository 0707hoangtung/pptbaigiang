import React from 'react';
import { 
  Plus, 
  Copy, 
  Trash2, 
  ChevronUp, 
  ChevronDown, 
  FilePlus, 
  MoreVertical 
} from 'lucide-react';
import { Slide } from '../types/presentation';

interface SlideSidebarProps {
  slides: Slide[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onMoveSlide: (fromIndex: number, toIndex: number) => void;
  aspectRatio: '16:9' | '4:3';
  defaultSlideBg: string;
}

export const SlideSidebar: React.FC<SlideSidebarProps> = ({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
  aspectRatio,
  defaultSlideBg
}) => {
  return (
    <div className="w-48 sm:w-52 md:w-56 bg-[#e9ecef] border-r border-[#dadce0] flex flex-col shrink-0 select-none">
      {/* Header bar of slide list */}
      <div className="h-9 px-2 flex items-center justify-between border-b border-[#dadce0] bg-[#f1f3f5] text-xs font-semibold text-slate-700">
        <span className="flex items-center gap-1">
          <span>Trang chiếu</span>
          <span className="text-[10px] px-1.5 py-0.2 bg-slate-300 rounded-full font-bold text-slate-800">
            {slides.length}
          </span>
        </span>
        <button
          onClick={onAddSlide}
          className="p-1 rounded hover:bg-slate-300 text-slate-800 transition flex items-center gap-1 text-[11px] font-medium"
          title="Thêm slide mới (+)"
        >
          <Plus size={14} />
          <span className="hidden sm:inline">Thêm</span>
        </button>
      </div>

      {/* Slide Thumbnails Scrollable List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-3">
        {slides.map((slide, index) => {
          const isActive = index === activeSlideIndex;
          const slideBg = slide.backgroundColor || defaultSlideBg;

          return (
            <div
              key={slide.id}
              onClick={() => onSelectSlide(index)}
              className="flex items-start space-x-2 group cursor-pointer"
            >
              {/* Slide Number (1, 2, 3... exactly like PowerPoint) */}
              <div className="w-4 pt-1 text-right text-[11px] font-bold text-slate-500 group-hover:text-slate-900">
                {index + 1}
              </div>

              {/* Thumbnail Container */}
              <div
                className={`flex-1 rounded-md overflow-hidden transition relative shadow-sm ${
                  aspectRatio === '16:9' ? 'aspect-video' : 'aspect-4/3'
                } ${
                  isActive
                    ? 'ring-2 ring-[#c43e1c] shadow-md' // Matches orange border in user screenshot!
                    : 'border border-slate-300 hover:border-slate-400 group-hover:shadow-md'
                }`}
                style={{
                  background: slide.backgroundGradient || slideBg
                }}
              >
                {/* Mini representation of elements inside thumbnail */}
                <div className="w-full h-full p-1.5 relative overflow-hidden pointer-events-none">
                  {slide.elements.slice(0, 5).map((el) => {
                    if (el.type === 'text') {
                      return (
                        <div
                          key={el.id}
                          className="absolute text-[6px] leading-tight truncate font-bold"
                          style={{
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            width: `${el.width}%`,
                            color: el.color || '#ffffff',
                            textAlign: el.textAlign || 'left'
                          }}
                        >
                          {el.text}
                        </div>
                      );
                    }
                    if (el.type === 'shape') {
                      return (
                        <div
                          key={el.id}
                          className="absolute rounded-xs border border-white/20"
                          style={{
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            width: `${el.width}%`,
                            height: `${el.height}%`,
                            backgroundColor: el.fillColor || 'rgba(255,255,255,0.2)'
                          }}
                        />
                      );
                    }
                    if (el.type === 'image') {
                      return (
                        <div
                          key={el.id}
                          className="absolute rounded-xs bg-slate-700/50 border border-white/30"
                          style={{
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            width: `${el.width}%`,
                            height: `${el.height}%`
                          }}
                        />
                      );
                    }
                    return null;
                  })}
                </div>

                {/* Hover Action Menu for current slide */}
                <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition flex items-center space-x-0.5 bg-black/60 rounded p-0.5 pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index > 0) onMoveSlide(index, index - 1);
                    }}
                    disabled={index === 0}
                    className="p-0.5 text-white/80 hover:text-white disabled:opacity-30"
                    title="Lên trên"
                  >
                    <ChevronUp size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (index < slides.length - 1) onMoveSlide(index, index + 1);
                    }}
                    disabled={index === slides.length - 1}
                    className="p-0.5 text-white/80 hover:text-white disabled:opacity-30"
                    title="Xuống dưới"
                  >
                    <ChevronDown size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateSlide(index);
                    }}
                    className="p-0.5 text-white/80 hover:text-white"
                    title="Nhân bản slide"
                  >
                    <Copy size={11} />
                  </button>
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlide(index);
                      }}
                      className="p-0.5 text-red-300 hover:text-red-100"
                      title="Xóa slide"
                    >
                      <Trash2 size={11} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Add Slide Button */}
      <div className="p-2 border-t border-[#dadce0] bg-[#f8f9fa]">
        <button
          onClick={onAddSlide}
          className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition shadow-xs"
        >
          <Plus size={14} className="text-[#c43e1c]" />
          <span>Thêm slide mới</span>
        </button>
      </div>
    </div>
  );
};
