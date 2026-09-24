import React from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  Copy,
  Trash2,
  Layers,
  ArrowUp,
  ArrowDown,
  Palette,
  Type,
  PlusSquare,
  Sparkles,
  FileUp,
  Save,
  Download,
  Lock
} from 'lucide-react';
import { SlideElement } from '../types/presentation';

interface HomeRibbonProps {
  selectedElement: SlideElement | null;
  onUpdateElement: (updated: Partial<SlideElement>) => void;
  onDeleteElement: () => void;
  onDuplicateElement: () => void;
  onBringForward: () => void;
  onSendBackward: () => void;
  onAddSlide: () => void;
  onOpenImportPptx?: () => void;
  onExportPPTX?: () => void;
  onSave?: () => void;
  readOnly?: boolean;
}

const FONT_FAMILIES = [
  { label: 'Segoe UI (Chuẩn Office)', value: 'Segoe UI' },
  { label: 'Plus Jakarta Sans', value: 'Plus Jakarta Sans' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Merriweather (Chữ có chân)', value: 'Merriweather' },
  { label: 'Roboto Mono', value: 'Roboto Mono' }
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 44, 52, 64, 72];

const COLOR_PRESETS = [
  '#ffffff', '#000000', '#1e293b', '#ef4444', '#f97316', '#f59e0b', 
  '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'
];

export const HomeRibbon: React.FC<HomeRibbonProps> = ({
  selectedElement,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onBringForward,
  onSendBackward,
  onAddSlide,
  onOpenImportPptx,
  onExportPPTX,
  onSave,
  readOnly = false
}) => {
  const isTextLike = selectedElement && (selectedElement.type === 'text' || selectedElement.type === 'shape');
  const textElem = selectedElement?.type === 'text' ? selectedElement : null;

  return (
    <div className="flex items-stretch h-[82px] bg-[#f8f9fa] border-b border-[#dadce0] px-2 overflow-x-auto text-[11px] select-none text-slate-700">
      {readOnly && (
        <div className="flex items-center gap-1.5 px-2.5 py-1 my-1.5 mr-2 bg-amber-100 border border-amber-300 rounded text-amber-900 font-semibold shrink-0">
          <Lock size={14} className="text-amber-700" />
          <div className="flex flex-col text-[10px] leading-tight">
            <span className="font-bold">Chế độ Chỉ xem</span>
            <span className="text-[9px] text-amber-800">Không thể sửa/xóa</span>
          </div>
        </div>
      )}

      {/* 1. Trang chiếu & Lưu trữ (Slides & Save) */}
      <div className="flex flex-col items-center px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <div className="flex items-center space-x-1">
          <button
            onClick={onAddSlide}
            className="flex flex-col items-center justify-center p-1 rounded hover:bg-slate-200 transition w-13 h-[50px] group cursor-pointer"
            title={readOnly ? "Đăng nhập hoặc tạo bản sao để thêm trang mới" : "Thêm trang chiếu mới"}
          >
            {readOnly ? (
              <Lock size={20} className="text-amber-600 group-hover:scale-105 transition" />
            ) : (
              <PlusSquare size={22} className="text-[#c43e1c] group-hover:scale-105 transition" />
            )}
            <span className="text-[10.5px] leading-tight font-medium mt-0.5">Trang mới</span>
          </button>

          {onOpenImportPptx && (
            <button
              onClick={onOpenImportPptx}
              className="flex flex-col items-center justify-center p-1 rounded hover:bg-orange-50 text-slate-800 transition w-14 h-[50px] group cursor-pointer"
              title="Nhập bài giảng có sẵn từ file PowerPoint (.pptx) trên máy tính"
            >
              <FileUp size={20} className="text-[#c43e1c] group-hover:scale-110 transition" />
              <span className="text-[10px] leading-tight font-bold mt-0.5 text-[#c43e1c]">Nhập PPTX</span>
            </button>
          )}

          {onExportPPTX && (
            <button
              onClick={onExportPPTX}
              className="flex flex-col items-center justify-center p-1 rounded hover:bg-orange-50 text-slate-800 transition w-14 h-[50px] group cursor-pointer"
              title="Xuất bài giảng hiện tại ra file PowerPoint (.pptx) chuẩn Office"
            >
              <Download size={20} className="text-[#c43e1c] group-hover:scale-110 transition" />
              <span className="text-[10px] leading-tight font-bold mt-0.5 text-[#c43e1c]">Xuất PPTX</span>
            </button>
          )}

          {onSave && (
            <button
              onClick={onSave}
              className="flex flex-col items-center justify-center p-1 rounded hover:bg-amber-50 text-slate-800 transition w-14 h-[50px] group cursor-pointer"
              title="Lưu bài giảng vào Kho bài giảng (Ctrl + S)"
            >
              <Save size={20} className="text-amber-600 group-hover:scale-110 transition" />
              <span className="text-[10px] leading-tight font-bold mt-0.5 text-amber-700">Lưu vào Kho</span>
            </button>
          )}
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Trang & Lưu kho</span>
      </div>

      {/* 2. Phông chữ (Font Formatting) */}
      <div className={`flex flex-col px-2 border-r border-[#dadce0] shrink-0 justify-between py-1 ${readOnly ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center space-x-1 mb-1">
          {/* Font Family */}
          <select
            value={textElem?.fontFamily || 'Segoe UI'}
            onChange={(e) => onUpdateElement({ fontFamily: e.target.value } as any)}
            disabled={!isTextLike}
            className="h-6 px-1.5 bg-white border border-slate-300 rounded text-[11px] focus:outline-hidden disabled:opacity-40"
          >
            {FONT_FAMILIES.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          {/* Font Size */}
          <select
            value={textElem?.fontSize || 20}
            onChange={(e) => onUpdateElement({ fontSize: Number(e.target.value) } as any)}
            disabled={!isTextLike}
            className="h-6 px-1.5 bg-white border border-slate-300 rounded text-[11px] focus:outline-hidden disabled:opacity-40 w-14"
          >
            {FONT_SIZES.map(s => (
              <option key={s} value={s}>{s} px</option>
            ))}
          </select>
        </div>

        {/* Font Style Buttons */}
        <div className="flex items-center space-x-0.5">
          <button
            onClick={() => onUpdateElement({ fontWeight: textElem?.fontWeight === 'bold' ? 'normal' : 'bold' } as any)}
            disabled={!isTextLike}
            className={`p-1 rounded hover:bg-slate-200 transition ${textElem?.fontWeight === 'bold' ? 'bg-slate-300 text-slate-900 font-bold' : ''} disabled:opacity-40`}
            title="In đậm (Ctrl + B)"
          >
            <Bold size={13} />
          </button>
          <button
            onClick={() => onUpdateElement({ fontStyle: textElem?.fontStyle === 'italic' ? 'normal' : 'italic' } as any)}
            disabled={!isTextLike}
            className={`p-1 rounded hover:bg-slate-200 transition ${textElem?.fontStyle === 'italic' ? 'bg-slate-300' : ''} disabled:opacity-40`}
            title="In nghiêng (Ctrl + I)"
          >
            <Italic size={13} />
          </button>
          <button
            onClick={() => onUpdateElement({ textDecoration: textElem?.textDecoration === 'underline' ? 'none' : 'underline' } as any)}
            disabled={!isTextLike}
            className={`p-1 rounded hover:bg-slate-200 transition ${textElem?.textDecoration === 'underline' ? 'bg-slate-300' : ''} disabled:opacity-40`}
            title="Gạch chân (Ctrl + U)"
          >
            <Underline size={13} />
          </button>

          {/* Color Picker for Text */}
          <div className="flex items-center ml-1 space-x-1 pl-1 border-l border-slate-300">
            <span className="text-[10px] text-slate-500 font-medium">Màu chữ:</span>
            <input
              type="color"
              value={textElem?.color || '#ffffff'}
              onChange={(e) => onUpdateElement({ color: e.target.value } as any)}
              disabled={!isTextLike}
              className="w-5 h-5 rounded border border-slate-300 cursor-pointer disabled:opacity-40"
              title="Chọn màu chữ"
            />
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-medium text-center">Phông chữ</span>
      </div>

      {/* 3. Đoạn văn (Paragraph Alignment) */}
      <div className="flex flex-col px-2 border-r border-[#dadce0] shrink-0 justify-between py-1">
        <div className="flex items-center space-x-0.5">
          <button
            onClick={() => onUpdateElement({ textAlign: 'left' } as any)}
            disabled={!textElem}
            className={`p-1 rounded hover:bg-slate-200 ${textElem?.textAlign === 'left' ? 'bg-slate-300' : ''} disabled:opacity-40`}
            title="Căn trái"
          >
            <AlignLeft size={14} />
          </button>
          <button
            onClick={() => onUpdateElement({ textAlign: 'center' } as any)}
            disabled={!textElem}
            className={`p-1 rounded hover:bg-slate-200 ${textElem?.textAlign === 'center' ? 'bg-slate-300' : ''} disabled:opacity-40`}
            title="Căn giữa"
          >
            <AlignCenter size={14} />
          </button>
          <button
            onClick={() => onUpdateElement({ textAlign: 'right' } as any)}
            disabled={!textElem}
            className={`p-1 rounded hover:bg-slate-200 ${textElem?.textAlign === 'right' ? 'bg-slate-300' : ''} disabled:opacity-40`}
            title="Căn phải"
          >
            <AlignRight size={14} />
          </button>
          <button
            onClick={() => onUpdateElement({ textAlign: 'justify' } as any)}
            disabled={!textElem}
            className={`p-1 rounded hover:bg-slate-200 ${textElem?.textAlign === 'justify' ? 'bg-slate-300' : ''} disabled:opacity-40`}
            title="Căn đều hai bên"
          >
            <AlignJustify size={14} />
          </button>
        </div>

        {/* Quick color pallete */}
        <div className="flex items-center space-x-1 mt-1">
          {COLOR_PRESETS.slice(0, 6).map(c => (
            <button
              key={c}
              onClick={() => onUpdateElement({ color: c } as any)}
              disabled={!isTextLike}
              className="w-3.5 h-3.5 rounded-full border border-slate-300 hover:scale-125 transition disabled:opacity-30"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <span className="text-[10px] text-slate-400 font-medium text-center">Đoạn văn</span>
      </div>

      {/* 4. Sắp xếp & Thao tác phần tử (Arrange & Actions) */}
      <div className="flex flex-col px-2 shrink-0 justify-between py-1">
        <div className="flex items-center space-x-1">
          <button
            onClick={onBringForward}
            disabled={readOnly || !selectedElement}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
            title="Đưa phần tử lên lớp trên"
          >
            <ArrowUp size={13} className="text-blue-600" />
            <span>Lên trên</span>
          </button>

          <button
            onClick={onSendBackward}
            disabled={readOnly || !selectedElement}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
            title="Hạ phần tử xuống lớp dưới"
          >
            <ArrowDown size={13} className="text-slate-600" />
            <span>Xuống dưới</span>
          </button>

          <button
            onClick={onDuplicateElement}
            disabled={readOnly || !selectedElement}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
            title="Nhân bản phần tử được chọn"
          >
            <Copy size={13} className="text-emerald-600" />
            <span>Nhân đôi</span>
          </button>

          <button
            onClick={onDeleteElement}
            disabled={readOnly || !selectedElement}
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-red-100 text-red-600 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
            title="Xóa phần tử (Delete / Backspace)"
          >
            <Trash2 size={13} />
            <span>Xóa</span>
          </button>
        </div>

        <div className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
          {selectedElement ? (
            <span className="text-blue-600 font-semibold">
              Đang chọn: {selectedElement.type.toUpperCase()} (#{selectedElement.id.slice(0, 6)})
            </span>
          ) : (
            <span className="text-slate-400">Bấm vào phần tử trên slide để định dạng</span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 font-medium text-center">Sắp xếp & Thao tác</span>
      </div>
    </div>
  );
};
