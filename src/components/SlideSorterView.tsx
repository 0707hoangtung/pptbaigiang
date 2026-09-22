import React from 'react';
import { Slide } from '../types/presentation';
import { Plus, Copy, Trash2, ArrowLeft } from 'lucide-react';

interface SlideSorterViewProps {
  slides: Slide[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onCloseSorter: () => void;
  defaultSlideBg: string;
}

export const SlideSorterView: React.FC<SlideSorterViewProps> = ({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onCloseSorter,
  defaultSlideBg
}) => {
  return (
    <div className="flex-1 bg-[#d8dde6] p-6 overflow-y-auto flex flex-col">
      {/* Sorter Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-300">
        <div className="flex items-center gap-3">
          <button
            onClick={onCloseSorter}
            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-xs"
          >
            <ArrowLeft size={14} />
            <span>Quay lại soạn thảo</span>
          </button>
          <h2 className="text-base font-bold text-slate-800">
            Bảng Sắp Xếp Trang Chiếu ({slides.length} trang)
          </h2>
        </div>

        <button
          onClick={onAddSlide}
          className="px-3.5 py-1.5 bg-[#c43e1c] hover:bg-[#a83214] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
        >
          <Plus size={14} />
          <span>Thêm trang chiếu mới</span>
        </button>
      </div>

      {/* Grid of slides */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {slides.map((slide, index) => {
          const isActive = index === activeSlideIndex;
          const slideBg = slide.backgroundColor || defaultSlideBg;

          return (
            <div
              key={slide.id}
              onClick={() => {
                onSelectSlide(index);
                onCloseSorter();
              }}
              className="flex flex-col group cursor-pointer"
            >
              {/* Thumbnail Container */}
              <div
                className={`relative aspect-video rounded-lg overflow-hidden shadow-md transition-all duration-200 ${
                  isActive
                    ? 'ring-4 ring-[#c43e1c] scale-102'
                    : 'border-2 border-slate-300 hover:border-slate-400 hover:shadow-xl'
                }`}
                style={{ background: slide.backgroundGradient || slideBg }}
              >
                {/* Mini Elements Preview */}
                <div className="w-full h-full p-2 relative overflow-hidden pointer-events-none">
                  {slide.elements.slice(0, 6).map((el) => {
                    if (el.type === 'text') {
                      return (
                        <div
                          key={el.id}
                          className="absolute text-[8px] leading-tight font-bold truncate"
                          style={{
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            width: `${el.width}%`,
                            color: el.color || '#ffffff'
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
                          className="absolute rounded-xs bg-white/20 border border-white/20"
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

                {/* Hover overlay quick actions */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex items-center space-x-1 bg-black/70 rounded-md p-1 pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateSlide(index);
                    }}
                    className="p-1 text-white hover:text-amber-300"
                    title="Nhân đôi slide"
                  >
                    <Copy size={13} />
                  </button>
                  {slides.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteSlide(index);
                      }}
                      className="p-1 text-red-300 hover:text-red-100"
                      title="Xóa slide"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Slide Number & Title Label */}
              <div className="mt-2 flex items-center justify-between text-xs px-1">
                <span className="font-bold text-slate-700">
                  Slide {index + 1}
                </span>
                <span className="text-slate-500 text-[11px] truncate max-w-[140px]">
                  {slide.title || 'Không có tiêu đề'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
