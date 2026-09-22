import React from 'react';
import {
  Play,
  RotateCcw,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Layers,
  HelpCircle,
  Zap,
  MousePointer
} from 'lucide-react';
import { ElementAnimationType, SlideElement } from '../types/presentation';

interface AnimationsRibbonProps {
  selectedElement: SlideElement | null;
  onUpdateElement: (updated: Partial<SlideElement>) => void;
  slideElements: SlideElement[];
  onApplyToAllElements: (anim: ElementAnimationType) => void;
  onClearAllAnimations: () => void;
  onPreviewAnimation: (elementId?: string) => void;
  onMoveOrder: (elementId: string, direction: 'earlier' | 'later') => void;
}

export const BASIC_ANIMATIONS: {
  id: ElementAnimationType;
  name: string;
  sub: string;
  icon: string;
  badgeColor: string;
  desc: string;
}[] = [
  {
    id: 'none',
    name: 'Không có',
    sub: 'None',
    icon: '⛔',
    badgeColor: 'bg-slate-200 text-slate-700',
    desc: 'Khối hiển thị ngay từ đầu khi mở slide'
  },
  {
    id: 'appear',
    name: 'Xuất hiện',
    sub: 'Appear',
    icon: '⚡',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    desc: 'Hiện ra tức thì khi bấm chuột hoặc phím Space'
  },
  {
    id: 'fade-in',
    name: 'Mờ dần',
    sub: 'Fade In',
    icon: '🌫️',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    desc: 'Mờ dần chuyển sang rõ nét mềm mại'
  },
  {
    id: 'fly-in',
    name: 'Bay vào',
    sub: 'Fly In',
    icon: '🛫',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    desc: 'Bay mượt mà từ dưới màn hình lên vị trí'
  },
  {
    id: 'zoom-in',
    name: 'Thu phóng',
    sub: 'Zoom In',
    icon: '🔍',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    desc: 'Phóng to từ tâm ra kích thước chuẩn'
  }
];

export const AnimationsRibbon: React.FC<AnimationsRibbonProps> = ({
  selectedElement,
  onUpdateElement,
  slideElements,
  onApplyToAllElements,
  onClearAllAnimations,
  onPreviewAnimation,
  onMoveOrder
}) => {
  const currentAnimation: ElementAnimationType = selectedElement?.animation || 'none';

  // Sort animated elements to compute correct order indices
  const animatedElements = slideElements
    .filter(el => el.animation && el.animation !== 'none')
    .sort((a, b) => (a.animationOrder ?? 999) - (b.animationOrder ?? 999));

  const currentOrderIndex = selectedElement
    ? animatedElements.findIndex(el => el.id === selectedElement.id)
    : -1;

  const currentOrderNumber = currentOrderIndex !== -1 ? currentOrderIndex + 1 : null;

  const handleSelectAnimation = (anim: ElementAnimationType) => {
    if (!selectedElement) return;

    if (anim === 'none') {
      onUpdateElement({ animation: 'none', animationOrder: undefined });
    } else {
      // If element didn't have order yet, assign the next available order number
      const nextOrder = selectedElement.animationOrder || (animatedElements.length + 1);
      onUpdateElement({ animation: anim, animationOrder: nextOrder });
      onPreviewAnimation(selectedElement.id);
    }
  };

  return (
    <div className="flex items-stretch h-[82px] bg-[#f8f9fa] border-b border-[#dadce0] px-2 overflow-x-auto text-[11px] select-none text-slate-700">
      {/* Group 1: Xem trước (Preview) */}
      <div className="flex flex-col px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <button
          onClick={() => onPreviewAnimation(selectedElement?.id)}
          className="flex flex-col items-center justify-center p-1.5 rounded bg-white hover:bg-slate-100 text-blue-700 border border-blue-200 transition w-18 h-[50px] shadow-2xs group"
          title="Xem trước chuyển động của khối đang chọn hoặc toàn bộ slide"
        >
          <Play size={20} className="text-blue-600 fill-blue-600 group-hover:scale-110 transition" />
          <span className="text-[10px] font-bold mt-0.5">Xem trước</span>
        </button>
        <span className="text-[10px] text-slate-400 font-medium text-center">Chạy thử</span>
      </div>

      {/* Group 2: 4 Hiệu ứng cơ bản (4 Basic Animations + None) */}
      <div className="flex flex-col px-3 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <div className="flex items-center space-x-1.5">
          {BASIC_ANIMATIONS.map((anim) => {
            const isSelected = selectedElement && currentAnimation === anim.id;
            return (
              <button
                key={anim.id}
                onClick={() => handleSelectAnimation(anim.id)}
                disabled={!selectedElement}
                className={`flex flex-col items-center justify-center p-1 rounded transition w-[76px] h-[50px] border ${
                  !selectedElement
                    ? 'opacity-40 cursor-not-allowed bg-slate-50 border-transparent'
                    : isSelected
                    ? 'bg-blue-100 text-blue-900 border-blue-500 font-bold ring-2 ring-blue-400/50 shadow-xs'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-800'
                }`}
                title={selectedElement ? `${anim.name} (${anim.sub}): ${anim.desc}` : 'Vui lòng chọn một khối trước'}
              >
                <span className="text-base">{anim.icon}</span>
                <span className="text-[10px] truncate max-w-full leading-tight font-medium mt-0.5">
                  {anim.name}
                </span>
                <span className="text-[8.5px] text-slate-400 -mt-0.5">{anim.sub}</span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center justify-between text-[10px] px-1">
          <span className="text-slate-400 font-medium">4 Hiệu ứng xuất hiện cơ bản (PowerPoint)</span>
          {!selectedElement && (
            <span className="text-amber-600 font-semibold flex items-center gap-1 animate-pulse">
              <MousePointer size={11} />
              <span>Bấm chọn 1 khối trên slide để gán</span>
            </span>
          )}
        </div>
      </div>

      {/* Group 3: Thứ tự chạy hiệu ứng (Sequence & Timing) */}
      <div className="flex flex-col px-3 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <div className="flex items-center space-x-2 h-[50px]">
          {selectedElement && currentAnimation !== 'none' ? (
            <div className="flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
              <div className="flex flex-col items-center justify-center">
                <span className="text-[9px] text-slate-400 font-bold uppercase">Thứ tự</span>
                <span className="text-base font-extrabold text-amber-600 leading-none">
                  #{currentOrderNumber}
                </span>
              </div>

              <div className="flex flex-col gap-0.5 border-l border-slate-200 pl-2">
                <button
                  onClick={() => onMoveOrder(selectedElement.id, 'earlier')}
                  disabled={currentOrderIndex <= 0}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded text-[9.5px] font-medium flex items-center gap-0.5 text-slate-700 transition"
                  title="Cho khối này chạy trước khối khác"
                >
                  <ArrowUp size={10} />
                  <span>Chạy sớm hơn</span>
                </button>
                <button
                  onClick={() => onMoveOrder(selectedElement.id, 'later')}
                  disabled={currentOrderIndex === -1 || currentOrderIndex >= animatedElements.length - 1}
                  className="px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded text-[9.5px] font-medium flex items-center gap-0.5 text-slate-700 transition"
                  title="Cho khối này chạy sau khối khác"
                >
                  <ArrowDown size={10} />
                  <span>Chạy muộn hơn</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center text-slate-400 text-xs px-2 py-2 bg-slate-100/70 rounded border border-dashed border-slate-300">
              <span>{selectedElement ? 'Khối này chưa có hiệu ứng' : 'Chưa chọn khối nào'}</span>
            </div>
          )}
        </div>
        <span className="text-[10px] text-slate-400 font-medium text-center">Thứ tự xuất hiện</span>
      </div>

      {/* Group 4: Thiết lập nhanh & Thao tác hàng loạt */}
      <div className="flex flex-col px-3 shrink-0 justify-between py-1">
        <div className="flex items-center space-x-1.5 h-[50px]">
          <button
            onClick={() => onApplyToAllElements(currentAnimation !== 'none' ? currentAnimation : 'fade-in')}
            className="flex flex-col items-center justify-center px-2 py-1 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded transition h-[48px]"
            title="Tự động gán hiệu ứng cho tất cả các khối trong slide theo thứ tự từ trên xuống dưới"
          >
            <Layers size={15} className="text-indigo-600 mb-0.5" />
            <span className="text-[10px] font-medium">Gán cho cả slide</span>
          </button>

          <button
            onClick={onClearAllAnimations}
            className="flex flex-col items-center justify-center px-2 py-1 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-600 hover:text-red-700 rounded transition h-[48px]"
            title="Xóa tất cả hiệu ứng của các khối trong slide này"
          >
            <RotateCcw size={15} className="text-slate-400 hover:text-red-600 mb-0.5" />
            <span className="text-[10px] font-medium">Xóa hết hiệu ứng</span>
          </button>
        </div>
        <span className="text-[10px] text-slate-400 font-medium text-center">
          Slide hiện có: <strong className="text-slate-700">{animatedElements.length}</strong> khối hiệu ứng
        </span>
      </div>
    </div>
  );
};
