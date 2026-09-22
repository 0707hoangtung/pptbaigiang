import React from 'react';
import { 
  FileText, 
  Layout, 
  LayoutGrid, 
  BookOpen, 
  Tv, 
  Minus, 
  Plus, 
  Maximize2, 
  Globe2, 
  CheckCircle2,
  Clock,
  RefreshCw
} from 'lucide-react';
import { ViewMode } from '../types/presentation';

interface StatusBarProps {
  currentSlideIndex: number;
  totalSlides: number;
  isNotesOpen: boolean;
  onToggleNotes: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  zoomLevel: number;
  onChangeZoom: (level: number) => void;
  onFitToWindow: () => void;
  currentTime?: string;
  lastSavedTime?: string;
  isRealtimeSyncing?: boolean;
  isOnline?: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentSlideIndex,
  totalSlides,
  isNotesOpen,
  onToggleNotes,
  viewMode,
  onChangeViewMode,
  zoomLevel,
  onChangeZoom,
  onFitToWindow,
  currentTime,
  lastSavedTime,
  isRealtimeSyncing,
  isOnline = true
}) => {
  return (
    <div className="h-6.5 bg-[#f1f3f5] border-t border-[#dadce0] px-3 flex items-center justify-between text-[11px] text-slate-600 select-none shrink-0 z-20">
      {/* Left items: Slide X of Y, Language, Realtime & Live clock */}
      <div className="flex items-center space-x-3.5">
        <span className="font-semibold text-slate-800">
          Trang {currentSlideIndex + 1} / {totalSlides}
          <span className="text-[10px] text-slate-400 font-normal ml-1">
            (Slide {currentSlideIndex + 1} of {totalSlides})
          </span>
        </span>

        <div className="flex items-center space-x-1 hover:text-slate-900 cursor-pointer">
          <Globe2 size={12} className="text-slate-500" />
          <span>Tiếng Việt</span>
        </div>

        {/* Real-time synchronization status */}
        <div className="hidden sm:flex items-center space-x-1 font-medium">
          {isRealtimeSyncing ? (
            <span className="flex items-center gap-1 text-amber-600">
              <RefreshCw size={11} className="animate-spin" />
              <span>Đang đồng bộ đám mây...</span>
            </span>
          ) : !isOnline ? (
            <span className="flex items-center gap-1 text-amber-700" title="Dữ liệu được lưu trong bộ nhớ máy (IndexedDB) và sẽ tự động đồng bộ khi có mạng">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              <span>Lưu ngoại tuyến (IndexedDB)</span>
              {lastSavedTime && <span className="text-slate-400 text-[10px]">({lastSavedTime})</span>}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-700" title="Đồng bộ đám mây thời gian thực - Dữ liệu thống nhất trên mọi thiết bị">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Đám mây thời gian thực</span>
              {lastSavedTime && <span className="text-slate-400 text-[10px]">({lastSavedTime})</span>}
            </span>
          )}
        </div>

        {/* Real-time digital clock */}
        {currentTime && (
          <div className="hidden md:flex items-center gap-1 text-slate-700 font-mono text-[10.5px]">
            <Clock size={11} className="text-slate-500" />
            <span>{currentTime}</span>
          </div>
        )}
      </div>

      {/* Right items: Notes toggle, View Modes, Zoom Slider */}
      <div className="flex items-center space-x-3">
        {/* Notes Toggle Button */}
        <button
          onClick={onToggleNotes}
          className={`flex items-center space-x-1 px-1.5 py-0.5 rounded transition ${
            isNotesOpen ? 'bg-slate-300 font-semibold text-slate-900' : 'hover:bg-slate-200'
          }`}
          title="Bật/tắt khung ghi chú giáo viên"
        >
          <FileText size={12} />
          <span>Ghi chú</span>
        </button>

        {/* View Mode Buttons (Normal, Sorter, Reading, SlideShow) */}
        <div className="flex items-center space-x-0.5 border-l border-r border-slate-300 px-1.5">
          <button
            onClick={() => onChangeViewMode('normal')}
            className={`p-1 rounded transition ${
              viewMode === 'normal' ? 'bg-slate-300 text-slate-900 font-bold' : 'hover:bg-slate-200'
            }`}
            title="Chế độ bình thường (Normal View)"
          >
            <Layout size={13} />
          </button>

          <button
            onClick={() => onChangeViewMode('sorter')}
            className={`p-1 rounded transition ${
              viewMode === 'sorter' ? 'bg-slate-300 text-slate-900 font-bold' : 'hover:bg-slate-200'
            }`}
            title="Sắp xếp trang chiếu (Slide Sorter View)"
          >
            <LayoutGrid size={13} />
          </button>

          <button
            onClick={() => onChangeViewMode('reading')}
            className={`p-1 rounded transition ${
              viewMode === 'reading' ? 'bg-slate-300 text-slate-900 font-bold' : 'hover:bg-slate-200'
            }`}
            title="Chế độ đọc (Reading View)"
          >
            <BookOpen size={13} />
          </button>

          <button
            onClick={() => onChangeViewMode('slideshow')}
            className={`p-1 rounded transition ${
              viewMode === 'slideshow' ? 'bg-emerald-600 text-white font-bold' : 'hover:bg-slate-200 text-emerald-700'
            }`}
            title="Bắt đầu trình chiếu toàn màn hình (Slide Show)"
          >
            <Tv size={13} />
          </button>
        </div>

        {/* Zoom Slider and Percentage */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onChangeZoom(Math.max(50, zoomLevel - 10))}
            className="p-0.5 hover:bg-slate-200 rounded text-slate-700"
            title="Thu nhỏ"
          >
            <Minus size={11} />
          </button>

          <input
            type="range"
            min={50}
            max={150}
            step={5}
            value={zoomLevel}
            onChange={(e) => onChangeZoom(Number(e.target.value))}
            className="w-16 h-1 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-[#c43e1c]"
          />

          <button
            onClick={() => onChangeZoom(Math.min(150, zoomLevel + 10))}
            className="p-0.5 hover:bg-slate-200 rounded text-slate-700"
            title="Phóng to"
          >
            <Plus size={11} />
          </button>

          <span className="w-8 text-right font-medium text-[10.5px]">
            {zoomLevel}%
          </span>

          <button
            onClick={onFitToWindow}
            className="p-1 hover:bg-slate-200 rounded text-slate-600 ml-1"
            title="Vừa khít cửa sổ (Fit to window)"
          >
            <Maximize2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};
