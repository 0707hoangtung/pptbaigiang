import React from 'react';
import { 
  Palette, 
  Monitor, 
  Paintbrush, 
  Sparkles,
  LayoutTemplate,
  Check
} from 'lucide-react';
import { PresentationTheme } from '../types/presentation';
import { PRESENTATION_THEMES } from '../data/defaultLectures';

interface DesignRibbonProps {
  currentThemeId: string;
  onSelectTheme: (theme: PresentationTheme) => void;
  aspectRatio: '16:9' | '4:3';
  onChangeAspectRatio: (ratio: '16:9' | '4:3') => void;
  currentSlideBg?: string;
  onChangeSlideBg: (color: string) => void;
}

export const DesignRibbon: React.FC<DesignRibbonProps> = ({
  currentThemeId,
  onSelectTheme,
  aspectRatio,
  onChangeAspectRatio,
  currentSlideBg,
  onChangeSlideBg
}) => {
  return (
    <div className="flex items-stretch h-[82px] bg-[#f8f9fa] border-b border-[#dadce0] px-2 overflow-x-auto text-[11px] select-none text-slate-700">
      {/* 1. Bộ chủ đề (Themes) */}
      <div className="flex flex-col px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <div className="flex items-center space-x-2">
          {PRESENTATION_THEMES.map((theme) => {
            const isSelected = currentThemeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => onSelectTheme(theme)}
                className={`flex flex-col items-center p-1 rounded border transition ${
                  isSelected 
                    ? 'border-blue-600 ring-2 ring-blue-300 bg-blue-50/50' 
                    : 'border-slate-300 hover:border-slate-400 bg-white'
                }`}
                title={`Áp dụng chủ đề: ${theme.name}`}
              >
                <div 
                  className="w-14 h-8 rounded border border-black/10 flex flex-col justify-between p-1 shadow-xs relative overflow-hidden"
                  style={{ 
                    background: theme.slideGradient || theme.slideBg 
                  }}
                >
                  <div className="h-1.5 w-6 rounded-xs" style={{ backgroundColor: theme.accentColor }}></div>
                  <div className="h-1 w-10 rounded-xs" style={{ backgroundColor: theme.textColor, opacity: 0.8 }}></div>
                  {isSelected && (
                    <div className="absolute top-0.5 right-0.5 bg-blue-600 text-white rounded-full p-0.5">
                      <Check size={8} />
                    </div>
                  )}
                </div>
                <span className="text-[10px] font-medium mt-0.5 truncate max-w-[64px]">
                  {theme.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
        <span className="text-[10px] text-slate-400 font-medium text-center">Chủ đề bài giảng</span>
      </div>

      {/* 2. Tỷ lệ trang chiếu (Slide Size) */}
      <div className="flex flex-col px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => onChangeAspectRatio('16:9')}
            className={`flex flex-col items-center justify-center p-1 rounded transition w-14 h-[50px] ${
              aspectRatio === '16:9' ? 'bg-blue-100 text-blue-900 ring-1 ring-blue-400' : 'hover:bg-slate-200'
            }`}
            title="Màn hình rộng 16:9 (Chuẩn phổ biến hiện nay)"
          >
            <Monitor size={20} className="text-blue-600" />
            <span className="text-[10.5px] font-bold mt-0.5">16:9</span>
            <span className="text-[8.5px] text-slate-500">Màn rộng</span>
          </button>

          <button
            onClick={() => onChangeAspectRatio('4:3')}
            className={`flex flex-col items-center justify-center p-1 rounded transition w-14 h-[50px] ${
              aspectRatio === '4:3' ? 'bg-blue-100 text-blue-900 ring-1 ring-blue-400' : 'hover:bg-slate-200'
            }`}
            title="Màn hình tiêu chuẩn 4:3 (Cho máy chiếu cũ)"
          >
            <LayoutTemplate size={20} className="text-slate-600" />
            <span className="text-[10.5px] font-bold mt-0.5">4:3</span>
            <span className="text-[8.5px] text-slate-500">Tiêu chuẩn</span>
          </button>
        </div>
        <span className="text-[10px] text-slate-400 font-medium text-center">Kích cỡ trang chiếu</span>
      </div>

      {/* 3. Định dạng nền (Format Background) */}
      <div className="flex flex-col px-2 shrink-0 justify-between py-1">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 p-1 bg-white border border-slate-300 rounded">
            <Paintbrush size={15} className="text-amber-600" />
            <span className="text-[10.5px] font-medium">Màu nền trang này:</span>
            <input
              type="color"
              value={currentSlideBg || '#1e5385'}
              onChange={(e) => onChangeSlideBg(e.target.value)}
              className="w-6 h-6 rounded cursor-pointer border border-slate-300"
              title="Đổi màu nền trang chiếu hiện tại"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <button
              onClick={() => onChangeSlideBg('#1e5385')}
              className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-[10px] font-medium text-slate-700"
            >
              Mặc định Xanh PPT
            </button>
            <button
              onClick={() => onChangeSlideBg('#0f172a')}
              className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 rounded text-[10px] font-medium text-slate-700"
            >
              Đen sang trọng
            </button>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-medium text-center">Định dạng nền</span>
      </div>
    </div>
  );
};
