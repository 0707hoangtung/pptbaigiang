import React from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface NotesPanelProps {
  notes: string;
  onChangeNotes: (notes: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  readOnly?: boolean;
}

export const NotesPanel: React.FC<NotesPanelProps> = ({
  notes,
  onChangeNotes,
  isOpen,
  onToggle,
  readOnly = false
}) => {
  return (
    <div className="bg-[#f8f9fa] border-t border-[#dadce0] flex flex-col select-none shrink-0 transition-all duration-150">
      {/* Click to add notes bar - matching user screenshot! */}
      <div
        onClick={onToggle}
        className="h-7 px-4 flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
      >
        <div className="flex items-center space-x-2">
          <FileText size={13} className="text-slate-400" />
          <span className="font-normal italic text-[11.5px]">
            {notes ? 'Ghi chú bài giảng của giáo viên' : 'Bấm để thêm ghi chú (Click to add notes)...'}
          </span>
          {readOnly && (
            <span className="text-[10px] text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded font-semibold ml-2">
              Chỉ xem
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1 text-[11px] text-slate-400">
          <span>{isOpen ? 'Thu gọn' : 'Mở rộng'}</span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>

      {/* Expanded Notes Textarea */}
      {isOpen && (
        <div className="p-3 bg-white border-t border-slate-200">
          <textarea
            value={notes}
            onChange={(e) => !readOnly && onChangeNotes(e.target.value)}
            readOnly={readOnly}
            placeholder={readOnly ? "Chế độ chỉ xem: Bạn không thể sửa đổi ghi chú của bài giảng này." : "Nhập lời giảng, câu hỏi gợi mở, hoặc lưu ý cần nhấn mạnh khi trình chiếu trang này..."}
            rows={3}
            className={`w-full text-xs text-slate-800 p-2 border border-slate-300 rounded focus:ring-1 focus:ring-blue-500 focus:outline-hidden resize-none leading-relaxed ${
              readOnly ? 'bg-slate-50 cursor-not-allowed text-slate-600' : ''
            }`}
          />
        </div>
      )}
    </div>
  );
};
