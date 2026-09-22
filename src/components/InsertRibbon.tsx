import React, { useState } from 'react';
import {
  PlusSquare,
  Table as TableIcon,
  Image as ImageIcon,
  Shapes,
  Type,
  Omega,
  Film,
  Video,
  Mic,
  Link2,
  Globe,
  Upload,
  ChevronDown
} from 'lucide-react';

interface InsertRibbonProps {
  onAddSlide: (layout?: string) => void;
  onOpenTablePicker: () => void;
  onOpenImagePicker: () => void;
  onOpenShapePicker: () => void;
  onAddTextBox: () => void;
  onOpenMathFormula: () => void;
  onOpenSymbolPicker: () => void;
  onOpenMultimedia: (tab?: 'video-file' | 'video-online' | 'audio' | 'link') => void;
  // Legacy optional props for backward compatibility
  onAddCameo?: () => void;
  onOpenIconPicker?: () => void;
  onOpenSmartArtPicker?: () => void;
  onOpenChartPicker?: () => void;
  onAddWordArt?: () => void;
  onAddVideo?: () => void;
  onAddAudio?: () => void;
  onAddComment?: () => void;
  onToggleCameo?: () => void;
  hasCameo?: boolean;
}

export const InsertRibbon: React.FC<InsertRibbonProps> = ({
  onAddSlide,
  onOpenTablePicker,
  onOpenImagePicker,
  onOpenShapePicker,
  onAddTextBox,
  onOpenMathFormula,
  onOpenSymbolPicker,
  onOpenMultimedia
}) => {
  const [showSlideLayouts, setShowSlideLayouts] = useState(false);
  const [showMediaDropdown, setShowMediaDropdown] = useState(false);

  return (
    <div className="flex items-stretch h-[82px] bg-[#f8f9fa] border-b border-[#dadce0] px-2 overflow-x-auto text-[11px] select-none text-slate-700">
      {/* 1. Group: Trang chiếu (Slides) */}
      <div className="flex flex-col items-center px-2 border-r border-[#dadce0] shrink-0 justify-between py-1 relative">
        <div className="flex items-center space-x-1">
          <div className="relative">
            <button
              onClick={() => setShowSlideLayouts(!showSlideLayouts)}
              className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-14 h-[50px] group cursor-pointer"
              title="Thêm trang chiếu mới"
            >
              <div className="relative">
                <PlusSquare size={24} className="text-[#c43e1c] group-hover:scale-105 transition" />
              </div>
              <span className="text-[10.5px] leading-tight font-medium mt-0.5 flex items-center">
                Trang mới <ChevronDown size={10} className="ml-0.5" />
              </span>
            </button>

            {/* Slide Layout Dropdown */}
            {showSlideLayouts && (
              <div 
                className="absolute top-full left-0 mt-1 w-52 bg-white rounded-md shadow-xl border border-slate-200 z-50 p-1.5"
                onMouseLeave={() => setShowSlideLayouts(false)}
              >
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Chọn bố cục trang chiếu
                </div>
                <button
                  onClick={() => { onAddSlide('title'); setShowSlideLayouts(false); }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded text-xs flex items-center space-x-2"
                >
                  <span className="w-2.5 h-2.5 bg-blue-500 rounded-xs"></span>
                  <span>Trang Tiêu đề</span>
                </button>
                <button
                  onClick={() => { onAddSlide('title-and-content'); setShowSlideLayouts(false); }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded text-xs flex items-center space-x-2"
                >
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-xs"></span>
                  <span>Tiêu đề & Nội dung</span>
                </button>
                <button
                  onClick={() => { onAddSlide('two-column'); setShowSlideLayouts(false); }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded text-xs flex items-center space-x-2"
                >
                  <span className="w-2.5 h-2.5 bg-amber-500 rounded-xs"></span>
                  <span>Hai cột so sánh</span>
                </button>
                <button
                  onClick={() => { onAddSlide('blank'); setShowSlideLayouts(false); }}
                  className="w-full text-left px-2.5 py-1.5 hover:bg-slate-100 rounded text-xs flex items-center space-x-2"
                >
                  <span className="w-2.5 h-2.5 border border-slate-400 rounded-xs"></span>
                  <span>Trang trống</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Trang chiếu</span>
      </div>

      {/* 2. Group: Bảng (Tables) */}
      <div className="flex flex-col items-center px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <button
          onClick={onOpenTablePicker}
          className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-12 h-[50px] group cursor-pointer"
          title="Chèn bảng biểu dữ liệu"
        >
          <TableIcon size={22} className="text-blue-600 group-hover:scale-105 transition" />
          <span className="text-[10.5px] leading-tight font-medium mt-0.5 flex items-center">
            Bảng <ChevronDown size={10} className="ml-0.5" />
          </span>
        </button>
        <span className="text-[10px] text-slate-400 font-medium">Bảng</span>
      </div>

      {/* 3. Group: Hình ảnh (Images) */}
      <div className="flex flex-col items-center px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <button
          onClick={onOpenImagePicker}
          className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-13 h-[50px] group cursor-pointer"
          title="Chèn hình ảnh vào bài giảng"
        >
          <ImageIcon size={23} className="text-emerald-600 group-hover:scale-105 transition" />
          <span className="text-[10.5px] leading-tight font-medium mt-0.5">
            Hình ảnh
          </span>
        </button>
        <span className="text-[10px] text-slate-400 font-medium">Hình ảnh</span>
      </div>

      {/* 4. Group: Hình minh họa (Illustrations - chỉ giữ lại Hình dạng) */}
      <div className="flex flex-col items-center px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <button
          onClick={onOpenShapePicker}
          className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-14 h-[50px] group cursor-pointer"
          title="Chèn hình dạng: chữ nhật, mũi tên, ngôi sao, hình tròn..."
        >
          <Shapes size={22} className="text-cyan-600 group-hover:scale-105 transition" />
          <span className="text-[10.5px] leading-tight font-medium mt-0.5 flex items-center">
            Hình dạng <ChevronDown size={10} className="ml-0.5" />
          </span>
        </button>
        <span className="text-[10px] text-slate-400 font-medium">Hình minh họa</span>
      </div>

      {/* 5. Group: Văn bản (Text - Hộp chữ) */}
      <div className="flex flex-col items-center px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <button
          onClick={onAddTextBox}
          className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-13 h-[50px] group cursor-pointer"
          title="Thêm hộp văn bản để gõ nội dung"
        >
          <div className="p-1 border border-dashed border-slate-600 rounded">
            <Type size={18} className="text-slate-800 group-hover:scale-105 transition" />
          </div>
          <span className="text-[10.5px] leading-tight font-medium mt-0.5">
            Hộp chữ
          </span>
        </button>
        <span className="text-[10px] text-slate-400 font-medium">Văn bản</span>
      </div>

      {/* 6. Group: Ký hiệu & Công thức Toán (Symbols & Equations) */}
      <div className="flex flex-col items-center px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <div className="flex items-center space-x-1">
          <button
            onClick={onOpenMathFormula}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-blue-50 active:bg-blue-100 transition w-15 h-[50px] group text-blue-700 cursor-pointer"
            title="Soạn công thức Toán học ngay trên slide hỗ trợ LaTeX ($...$ hoặc $$...$$)"
          >
            <span className="text-lg font-bold font-serif leading-none group-hover:scale-110 transition text-blue-700">
              ∑
            </span>
            <span className="text-[10.5px] leading-tight font-bold mt-0.5 text-blue-800">
              Toán LaTeX
            </span>
          </button>

          <button
            onClick={onOpenSymbolPicker}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-13 h-[50px] group cursor-pointer"
            title="Chèn ký hiệu toán học và khoa học (π, √, ∑, α, β...)"
          >
            <Omega size={20} className="text-slate-700 group-hover:scale-105 transition" />
            <span className="text-[10.5px] leading-tight font-medium mt-0.5">
              Ký hiệu
            </span>
          </button>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Ký hiệu & Toán</span>
      </div>

      {/* 7. Group: Đa phương tiện (Gom Liên kết, Video và Âm thanh) */}
      <div className="flex flex-col items-center px-2 shrink-0 justify-between py-1 relative">
        <div className="relative">
          <button
            onClick={() => onOpenMultimedia('video-online')}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 active:bg-slate-300 transition w-18 h-[50px] group cursor-pointer"
            title="Chèn Đa phương tiện: Video máy tính, Âm thanh máy tính, link YouTube, Facebook, hoặc liên kết web"
          >
            <div className="relative flex items-center justify-center">
              <Film size={23} className="text-[#c43e1c] group-hover:scale-105 transition" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-600 ring-1 ring-white"></span>
            </div>
            <span className="text-[10.5px] leading-tight font-bold mt-0.5 text-slate-800 flex items-center">
              Đa phương tiện <ChevronDown size={10} className="ml-0.5 text-slate-500" />
            </span>
          </button>

          {/* Quick Dropdown Toggle Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMediaDropdown(!showMediaDropdown);
            }}
            className="absolute top-1 right-0 p-0.5 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-300/50"
            title="Chọn loại phương tiện cần chèn"
          >
            <ChevronDown size={11} />
          </button>

          {/* Media Quick Menu Dropdown */}
          {showMediaDropdown && (
            <div 
              className="absolute top-full right-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 p-2 animate-in fade-in duration-150"
              onMouseLeave={() => setShowMediaDropdown(false)}
            >
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 border-b border-slate-100 mb-1">
                Công cụ Đa phương tiện
              </div>
              <button
                onClick={() => {
                  onOpenMultimedia('video-online');
                  setShowMediaDropdown(false);
                }}
                className="w-full text-left px-2.5 py-2 hover:bg-orange-50 rounded-lg text-xs flex items-center space-x-2.5 transition group cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Globe size={14} />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 group-hover:text-[#c43e1c] block">
                    Link Video (YouTube, Facebook...)
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Nhúng video từ YouTube, Facebook, TikTok
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenMultimedia('video-file');
                  setShowMediaDropdown(false);
                }}
                className="w-full text-left px-2.5 py-2 hover:bg-orange-50 rounded-lg text-xs flex items-center space-x-2.5 transition group cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <Video size={14} />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 group-hover:text-[#c43e1c] block">
                    Video từ máy tính
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Tải file video .MP4, .WEBM, .MOV
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenMultimedia('audio');
                  setShowMediaDropdown(false);
                }}
                className="w-full text-left px-2.5 py-2 hover:bg-indigo-50 rounded-lg text-xs flex items-center space-x-2.5 transition group cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                  <Mic size={14} />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 group-hover:text-indigo-600 block">
                    Âm thanh từ máy tính
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Tải file âm thanh .MP3, .WAV, .M4A
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  onOpenMultimedia('link');
                  setShowMediaDropdown(false);
                }}
                className="w-full text-left px-2.5 py-2 hover:bg-blue-50 rounded-lg text-xs flex items-center space-x-2.5 transition group cursor-pointer"
              >
                <div className="w-6 h-6 rounded bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Link2 size={14} />
                </div>
                <div>
                  <span className="font-semibold text-slate-800 group-hover:text-blue-600 block">
                    Liên kết web
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Đường dẫn website, tài liệu tham khảo
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>
        <span className="text-[10px] text-[#c43e1c] font-bold">Đa phương tiện</span>
      </div>
    </div>
  );
};
