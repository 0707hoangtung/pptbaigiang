import React from 'react';
import {
  Sparkles,
  Play,
  Tv,
  Clock,
  Volume2,
  FolderOpen,
  PlusCircle,
  HelpCircle,
  Keyboard,
  Share2,
  Download,
  BookOpen,
  FastForward,
  Eye,
  FileUp,
  Lock
} from 'lucide-react';
import { TransitionType } from '../types/presentation';

// Transitions Ribbon
interface TransitionsRibbonProps {
  currentTransition?: TransitionType;
  onChangeTransition: (trans: TransitionType) => void;
  onApplyToAll: () => void;
}

const TRANSITIONS_LIST: { id: TransitionType; name: string; icon: string }[] = [
  { id: 'none', name: 'Không có', icon: '⛔' },
  { id: 'fade', name: 'Mờ dần (Fade)', icon: '🌫️' },
  { id: 'push', name: 'Đẩy (Push)', icon: '⬆️' },
  { id: 'wipe', name: 'Lau (Wipe)', icon: '🧹' },
  { id: 'zoom', name: 'Thu phóng (Zoom)', icon: '🔍' },
  { id: 'flip', name: 'Lật trang (Flip)', icon: '📖' }
];

export const TransitionsRibbon: React.FC<TransitionsRibbonProps> = ({
  currentTransition = 'fade',
  onChangeTransition,
  onApplyToAll
}) => {
  return (
    <div className="flex items-stretch h-[82px] bg-[#f8f9fa] border-b border-[#dadce0] px-2 overflow-x-auto text-[11px] select-none text-slate-700">
      <div className="flex flex-col px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <div className="flex items-center space-x-1">
          {TRANSITIONS_LIST.map((t) => (
            <button
              key={t.id}
              onClick={() => onChangeTransition(t.id)}
              className={`flex flex-col items-center justify-center p-1 rounded transition w-18 h-[50px] ${
                currentTransition === t.id 
                  ? 'bg-blue-100 text-blue-900 ring-1 ring-blue-500 font-bold' 
                  : 'hover:bg-slate-200'
              }`}
            >
              <span className="text-base">{t.icon}</span>
              <span className="text-[10px] mt-0.5 truncate">{t.name}</span>
            </button>
          ))}
        </div>
        <span className="text-[10px] text-slate-400 font-medium text-center">Hiệu ứng chuyển tiếp trang</span>
      </div>

      <div className="flex flex-col px-3 shrink-0 justify-between py-1">
        <button
          onClick={onApplyToAll}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-xs shadow-xs transition mt-1"
        >
          Áp dụng cho tất cả slide
        </button>
        <span className="text-[10px] text-slate-400 font-medium text-center">Thời gian & Thiết lập</span>
      </div>
    </div>
  );
};

// Slide Show Ribbon
interface SlideShowRibbonProps {
  onStartFromBeginning: () => void;
  onStartFromCurrent: () => void;
  onPresenterMode: () => void;
  onTriggerConfetti: () => void;
  onOpenImportPptx?: () => void;
  isLoggedIn?: boolean;
}

export const SlideShowRibbon: React.FC<SlideShowRibbonProps> = ({
  onStartFromBeginning,
  onStartFromCurrent,
  onPresenterMode,
  onTriggerConfetti,
  onOpenImportPptx,
  isLoggedIn = false
}) => {
  return (
    <div className="flex items-stretch h-[82px] bg-[#f8f9fa] border-b border-[#dadce0] px-2 overflow-x-auto text-[11px] select-none text-slate-700">
      {!isLoggedIn && (
        <div className="flex items-center gap-1.5 px-3 py-1 my-1.5 bg-amber-100/90 text-amber-900 rounded-lg border border-amber-300 text-xs font-bold mr-2 shrink-0 shadow-2xs">
          <Lock size={15} className="text-amber-700 shrink-0" />
          <div className="flex flex-col">
            <span>Chế độ trình chiếu đang khóa</span>
            <span className="text-[10px] text-amber-800 font-normal">Vui lòng đăng nhập để sử dụng</span>
          </div>
        </div>
      )}

      <div className="flex flex-col px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <div className="flex items-center space-x-2">
          <button
            onClick={onStartFromBeginning}
            className={`flex flex-col items-center justify-center p-1.5 rounded transition w-22 h-[50px] group cursor-pointer ${
              !isLoggedIn 
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300' 
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
            }`}
            title={isLoggedIn ? "Bắt đầu trình chiếu từ đầu (F5)" : "Khóa: Vui lòng đăng nhập để bắt đầu trình chiếu (F5)"}
          >
            <div className="relative">
              <Play size={20} className={!isLoggedIn ? "text-amber-700 fill-current" : "text-emerald-600 fill-current group-hover:scale-110 transition"} />
              {!isLoggedIn && (
                <Lock size={11} className="absolute -top-1 -right-2 text-amber-700 drop-shadow-xs" />
              )}
            </div>
            <span className="text-[10.5px] font-bold mt-0.5">{isLoggedIn ? "Từ đầu (F5)" : "Khóa (F5)"}</span>
          </button>

          <button
            onClick={onStartFromCurrent}
            className={`flex flex-col items-center justify-center p-1.5 rounded transition w-22 h-[50px] cursor-pointer ${
              !isLoggedIn
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                : 'hover:bg-slate-200 text-slate-700'
            }`}
            title={isLoggedIn ? "Trình chiếu từ trang hiện tại" : "Khóa: Vui lòng đăng nhập để bắt đầu trình chiếu"}
          >
            <div className="relative">
              <FastForward size={20} className={!isLoggedIn ? "text-slate-500" : "text-blue-600"} />
              {!isLoggedIn && (
                <Lock size={11} className="absolute -top-1 -right-2 text-amber-700 drop-shadow-xs" />
              )}
            </div>
            <span className="text-[10.5px] font-medium mt-0.5">Từ trang này</span>
          </button>

          {onOpenImportPptx && (
            <button
              onClick={onOpenImportPptx}
              className="flex flex-col items-center justify-center p-1.5 rounded bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-200 transition w-22 h-[50px] group cursor-pointer"
              title="Nhập bài giảng có sẵn từ file PowerPoint (.pptx)"
            >
              <FileUp size={20} className="text-[#c43e1c] group-hover:scale-110 transition" />
              <span className="text-[10.5px] font-bold mt-0.5">Nhập PPTX</span>
            </button>
          )}
        </div>
        <span className="text-[10px] text-slate-400 font-medium text-center">Bắt đầu trình chiếu</span>
      </div>

      <div className="flex flex-col px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <button
          onClick={onPresenterMode}
          className={`flex flex-col items-center justify-center p-1.5 rounded transition w-24 h-[50px] cursor-pointer ${
            !isLoggedIn
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
              : 'hover:bg-slate-200 text-slate-700'
          }`}
          title={isLoggedIn ? "Chế độ diễn giả cho giáo viên (hiển thị đồng hồ, ghi chú và slide tiếp theo)" : "Khóa: Vui lòng đăng nhập để sử dụng"}
        >
          <div className="relative">
            <Tv size={20} className={!isLoggedIn ? "text-slate-500" : "text-purple-600"} />
            {!isLoggedIn && (
              <Lock size={11} className="absolute -top-1 -right-2 text-amber-700 drop-shadow-xs" />
            )}
          </div>
          <span className="text-[10.5px] font-bold mt-0.5">Chế độ Diễn giả</span>
        </button>
        <span className="text-[10px] text-slate-400 font-medium text-center">Màn hình diễn giả</span>
      </div>

      <div className="flex flex-col px-2 shrink-0 justify-between py-1">
        <button
          onClick={onTriggerConfetti}
          className={`flex flex-col items-center justify-center p-1.5 rounded transition w-24 h-[50px] cursor-pointer ${
            !isLoggedIn
              ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
              : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300'
          }`}
          title={isLoggedIn ? "Bắn pháo hoa khen ngợi học sinh khi trả lời đúng" : "Khóa: Vui lòng đăng nhập để sử dụng"}
        >
          <div className="relative">
            <Sparkles size={20} className={!isLoggedIn ? "text-slate-500" : "text-amber-600"} />
            {!isLoggedIn && (
              <Lock size={11} className="absolute -top-1 -right-2 text-amber-700 drop-shadow-xs" />
            )}
          </div>
          <span className="text-[10.5px] font-bold mt-0.5">Pháo hoa khen</span>
        </button>
        <span className="text-[10px] text-slate-400 font-medium text-center">Tương tác lớp học</span>
      </div>
    </div>
  );
};

// Help Ribbon
interface HelpRibbonProps {
  onOpenRepository: () => void;
}

export const HelpRibbon: React.FC<HelpRibbonProps> = ({ onOpenRepository }) => {
  return (
    <div className="flex items-stretch h-[82px] bg-[#f8f9fa] border-b border-[#dadce0] px-3 overflow-x-auto text-[11px] select-none text-slate-700">
      <div className="flex items-center space-x-4 py-1">
        <div className="flex flex-col justify-center">
          <div className="font-bold text-slate-800 flex items-center gap-1.5">
            <Keyboard size={15} className="text-blue-600" />
            <span>Phím tắt thao tác nhanh:</span>
          </div>
          <div className="text-[11px] text-slate-600 space-x-3 mt-1">
            <span><strong className="text-slate-800">F5:</strong> Trình chiếu từ đầu</span>
            <span><strong className="text-slate-800">Mũi tên Trái / Phải:</strong> Chuyển slide</span>
            <span><strong className="text-slate-800">Delete:</strong> Xóa phần tử đang chọn</span>
            <span><strong className="text-slate-800">Ctrl + Z / Y:</strong> Hoàn tác / Làm lại</span>
            <span><strong className="text-slate-800">B:</strong> Đen màn hình khi giảng bài</span>
          </div>
        </div>

        <button
          onClick={onOpenRepository}
          className="px-3 py-1.5 bg-[#c43e1c] hover:bg-[#a83214] text-white rounded font-medium shadow-xs transition flex items-center gap-1.5"
        >
          <BookOpen size={14} />
          <span>Mở Hướng dẫn & Kho bài giảng</span>
        </button>
      </div>
    </div>
  );
};
