import React, { useState, useEffect } from 'react';
import { X, Save, BookOpen, GraduationCap, User, Palette, Ratio, Sparkles, Trash2 } from 'lucide-react';
import { Presentation } from '../types/presentation';
import { PRESENTATION_THEMES } from '../data/defaultLectures';

interface EditLectureModalProps {
  isOpen: boolean;
  onClose: () => void;
  presentation: Presentation | null;
  onSave: (updated: Presentation) => void;
  onDelete?: (presentation: Presentation) => void;
}

const COMMON_SUBJECTS = [
  'Toán học',
  'Khoa học Tự nhiên',
  'Vật lí',
  'Hóa học',
  'Sinh học',
  'Ngữ văn',
  'Lịch sử & Địa lí',
  'Tiếng Anh',
  'Tin học',
  'Công nghệ',
  'Giáo dục Công dân'
];

const COMMON_GRADES = [
  'Lớp 6',
  'Lớp 7',
  'Lớp 8',
  'Lớp 9',
  'Lớp 10',
  'Lớp 11',
  'Lớp 12'
];

export const EditLectureModal: React.FC<EditLectureModalProps> = ({
  isOpen,
  onClose,
  presentation,
  onSave,
  onDelete
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');
  const [author, setAuthor] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3'>('16:9');
  const [themeId, setThemeId] = useState('ocean-blue');

  useEffect(() => {
    if (presentation) {
      setTitle(presentation.title || '');
      setSubject(presentation.subject || 'Khoa học Tự nhiên');
      setGrade(presentation.grade || 'Lớp 6');
      setAuthor(presentation.author || 'Thầy / Cô Giáo');
      setAspectRatio(presentation.aspectRatio || '16:9');
      setThemeId(presentation.themeId || 'ocean-blue');
    }
  }, [presentation]);

  if (!isOpen || !presentation) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Vui lòng nhập tiêu đề bài giảng');
      return;
    }

    const updatedPresentation: Presentation = {
      ...presentation,
      title: title.trim(),
      subject: subject.trim(),
      grade: grade.trim(),
      author: author.trim() || 'Giáo viên',
      aspectRatio,
      themeId,
      updatedAt: new Date().toISOString().split('T')[0]
    };

    onSave(updatedPresentation);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#c43e1c] text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <BookOpen size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold">Chỉnh Sửa Thông Tin Bài Giảng</h3>
              <p className="text-xs text-white/80">Cập nhật tiêu đề, môn học, khối lớp và thiết kế</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
          {/* Tiêu đề */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Tiêu đề bài giảng <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Bài 28: Khám phá Hệ Mặt Trời và Các Hành Tinh"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 font-medium focus:bg-white focus:ring-2 focus:ring-[#c43e1c] focus:border-transparent focus:outline-hidden transition"
            />
          </div>

          {/* Môn học */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <BookOpen size={14} className="text-[#c43e1c]" />
              <span>Môn học</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="VD: Khoa học Tự nhiên"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 mb-2 focus:bg-white focus:ring-2 focus:ring-[#c43e1c] focus:outline-hidden"
            />
            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SUBJECTS.map((sub) => (
                <button
                  type="button"
                  key={sub}
                  onClick={() => setSubject(sub)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                    subject === sub
                      ? 'bg-[#c43e1c] text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Khối lớp & Tác giả */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <GraduationCap size={14} className="text-amber-600" />
                <span>Khối lớp</span>
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#c43e1c] focus:outline-hidden"
              >
                {COMMON_GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <User size={14} className="text-blue-600" />
                <span>Giáo viên / Tác giả</span>
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="VD: Thầy Nguyễn Văn An"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#c43e1c] focus:outline-hidden"
              />
            </div>
          </div>

          {/* Tỉ lệ khung hình */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Ratio size={14} className="text-indigo-600" />
              <span>Tỉ lệ khung hình trình chiếu</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition ${
                  aspectRatio === '16:9'
                    ? 'border-[#c43e1c] bg-red-50/50 text-[#c43e1c] ring-2 ring-[#c43e1c]'
                    : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-6 h-3.5 border-2 border-current rounded-xs"></div>
                <span>Màn hình rộng (16:9)</span>
              </button>

              <button
                type="button"
                onClick={() => setAspectRatio('4:3')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition ${
                  aspectRatio === '4:3'
                    ? 'border-[#c43e1c] bg-red-50/50 text-[#c43e1c] ring-2 ring-[#c43e1c]'
                    : 'border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="w-5 h-4 border-2 border-current rounded-xs"></div>
                <span>Màn hình chuẩn (4:3)</span>
              </button>
            </div>
          </div>

          {/* Chủ đề giao diện bài giảng */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Palette size={14} className="text-emerald-600" />
              <span>Giao diện màu sắc (Theme)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PRESENTATION_THEMES.map((th) => (
                <button
                  type="button"
                  key={th.id}
                  onClick={() => setThemeId(th.id)}
                  className={`p-2 rounded-lg border text-left flex items-center gap-2 transition ${
                    themeId === th.id
                      ? 'border-[#c43e1c] ring-2 ring-[#c43e1c] bg-slate-50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="w-5 h-5 rounded-md shrink-0 border border-black/10 shadow-xs"
                    style={{ background: th.slideBg }}
                  ></div>
                  <span className="text-[11px] font-semibold text-slate-800 truncate">
                    {th.name.split('(')[0].trim()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-2.5">
            {onDelete && presentation ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(presentation);
                  onClose();
                }}
                className="px-3.5 py-2 rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 text-xs font-bold transition flex items-center gap-1.5"
                title="Xóa bài giảng này"
              >
                <Trash2 size={14} />
                <span>Xóa bài giảng</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-[#c43e1c] hover:bg-[#a83214] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md"
              >
                <Save size={14} />
                <span>Lưu thay đổi</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
