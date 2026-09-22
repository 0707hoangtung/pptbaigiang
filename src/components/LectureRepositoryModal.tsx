import React, { useState } from 'react';
import { 
  X, 
  FolderOpen, 
  Plus, 
  Download, 
  Upload, 
  BookOpen, 
  Trash2, 
  Clock, 
  User, 
  GraduationCap, 
  Check, 
  Sparkles,
  Save,
  Edit3,
  Copy,
  AlertTriangle,
  Play,
  RotateCcw,
  FileUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Presentation } from '../types/presentation';
import { LECTURE_LIBRARY } from '../data/defaultLectures';
import { EditLectureModal } from './EditLectureModal';

interface LectureRepositoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPresentation: Presentation;
  onLoadPresentation: (presentation: Presentation) => void;
  onSaveCurrentToLibrary: () => void;
  onSaveCurrentAsNewCopy?: () => void;
  onNewPresentation: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenImportPptx?: () => void;
  savedPresentations: Presentation[];
  onDeleteSavedPresentation: (id: string) => void;
  onUpdatePresentationInLibrary: (updated: Presentation) => void;
  onDuplicatePresentation: (presentation: Presentation) => void;
  deletedLectureIds?: string[];
  onRestoreDefaultSamples?: () => void;
}

export const LectureRepositoryModal: React.FC<LectureRepositoryModalProps> = ({
  isOpen,
  onClose,
  currentPresentation,
  onLoadPresentation,
  onSaveCurrentToLibrary,
  onSaveCurrentAsNewCopy,
  onNewPresentation,
  onImportJSON,
  onOpenImportPptx,
  savedPresentations,
  onDeleteSavedPresentation,
  onUpdatePresentationInLibrary,
  onDuplicatePresentation,
  deletedLectureIds = [],
  onRestoreDefaultSamples
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [saveNoticeMessage, setSaveNoticeMessage] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  
  // Edit Lecture Modal state
  const [editingPresentation, setEditingPresentation] = useState<Presentation | null>(null);
  
  // Delete confirmation modal state
  const [deletingPresentation, setDeletingPresentation] = useState<Presentation | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  if (!isOpen) return null;

  // Single source of truth: all presentations in the repository come directly from Cloud Firestore
  // (Synchronized in real time across any device, normal or incognito tab)
  const allPresentations: Presentation[] = savedPresentations;

  const isCurrentSaved = savedPresentations.some(s => s.id === currentPresentation.id);

  const handleSaveCurrent = () => {
    onSaveCurrentToLibrary();
    setActiveCategory('all');
    setSearchTerm('');
    setHighlightedId(currentPresentation.id);
    setSaveNoticeMessage(`Đã lưu bài giảng "${currentPresentation.title}" vào Kho bài giảng thành công! Bài giảng đã đồng bộ đám mây.`);
    setTimeout(() => {
      setHighlightedId(null);
    }, 4000);
  };

  const handleSaveAsNew = () => {
    if (onSaveCurrentAsNewCopy) {
      onSaveCurrentAsNewCopy();
    } else {
      onSaveCurrentToLibrary();
    }
    setActiveCategory('all');
    setSearchTerm('');
    setSaveNoticeMessage(`Đã lưu bài giảng thành bản sao mới trong Kho bài giảng của bạn!`);
  };

  const categories = [
    { id: 'all', label: `Tất cả bài giảng (${allPresentations.length})` },
    { id: 'khtn', label: 'Khoa học Tự nhiên' },
    { id: 'math', label: 'Toán học' },
    { id: 'lit', label: 'Ngữ văn' },
    { id: 'eng', label: 'Tiếng Anh' },
    { id: 'cs', label: 'Tin học' }
  ];

  const filtered = allPresentations.filter(lec => {
    const matchSearch = lec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lec.subject && lec.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lec.author && lec.author.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchSearch) return false;
    if (activeCategory === 'all') return true;
    if (activeCategory === 'khtn' && lec.subject?.toLowerCase().includes('khoa học')) return true;
    if (activeCategory === 'math' && lec.subject?.toLowerCase().includes('toán')) return true;
    if (activeCategory === 'lit' && lec.subject?.toLowerCase().includes('văn')) return true;
    if (activeCategory === 'eng' && (lec.subject?.toLowerCase().includes('anh') || lec.subject?.toLowerCase().includes('english'))) return true;
    if (activeCategory === 'cs' && (lec.subject?.toLowerCase().includes('tin') || lec.subject?.toLowerCase().includes('python'))) return true;
    return false;
  });

  const handleExportSingleJSON = (presentation: Presentation) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(presentation, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${presentation.title.replace(/[/\\?%*:|"<>]/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const confirmDelete = async () => {
    if (deletingPresentation && !isDeleting) {
      try {
        setIsDeleting(true);
        await onDeleteSavedPresentation(deletingPresentation.id);
      } finally {
        setIsDeleting(false);
        setDeletingPresentation(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#c43e1c] text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-[#c43e1c] flex items-center justify-center font-black text-xl shadow-md">
              P
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide flex items-center gap-2">
                KHO BÀI GIẢNG ĐIỆN TỬ
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/20 font-medium">
                  Thời Gian Thực & Quản Lý Toàn Quyền
                </span>
              </h2>
              <p className="text-xs text-white/85">
                Xem, chỉnh sửa thông tin, tạo bản sao và xóa bài giảng trực tiếp trong kho lưu trữ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenImportPptx && (
              <button
                onClick={onOpenImportPptx}
                className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1.5"
                title="Nhập bài giảng từ tệp PowerPoint (.pptx) trên máy tính"
              >
                <FileUp size={14} className="text-amber-300" />
                <span>Nhập File (.pptx)</span>
              </button>
            )}

            <button
              onClick={handleSaveCurrent}
              className="px-3.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Lưu bài giảng đang soạn vào kho bài cá nhân"
            >
              <Save size={14} />
              <span>Lưu bài hiện tại vào Kho</span>
            </button>

            <button
              onClick={onNewPresentation}
              className="px-3.5 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={14} />
              <span>Tạo bài mới</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition ml-2 cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Active Presentation Quick Action Bar */}
        <div className="bg-amber-50/90 border-b border-amber-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
            <span className="text-slate-600 font-semibold shrink-0">Bài đang soạn:</span>
            <span className="font-bold text-slate-900 truncate max-w-xs md:max-w-md" title={currentPresentation.title}>
              {currentPresentation.title}
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-200/80 text-amber-900 text-[10.5px] font-semibold shrink-0">
              {currentPresentation.slides.length} trang
            </span>
            {isCurrentSaved ? (
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10.5px] font-bold shrink-0 flex items-center gap-1 border border-emerald-300">
                <Check size={12} /> Đã có trong Kho
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 text-[10.5px] font-bold shrink-0 flex items-center gap-1 border border-red-200">
                <AlertCircle size={12} /> Chưa lưu vào Kho
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleSaveCurrent}
              className="px-3 py-1.5 bg-[#c43e1c] hover:bg-[#a83214] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              title="Lưu hoặc cập nhật bài giảng đang soạn vào Kho bài giảng"
            >
              <Save size={13} />
              <span>{isCurrentSaved ? 'Cập nhật lại vào Kho' : 'Lưu ngay vào Kho'}</span>
            </button>
            {onSaveCurrentAsNewCopy && (
              <button
                onClick={handleSaveAsNew}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                title="Lưu thành một bản sao bài giảng mới riêng biệt"
              >
                <Plus size={13} />
                <span>Lưu bản sao mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Notice Message if just saved */}
        {saveNoticeMessage && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 flex items-center justify-between text-xs text-emerald-900 font-semibold animate-in fade-in duration-200 shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-emerald-600 shrink-0" />
              <span>{saveNoticeMessage}</span>
            </div>
            <button onClick={() => setSaveNoticeMessage(null)} className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full font-medium transition shrink-0 ${
                  activeCategory === cat.id
                    ? 'bg-[#c43e1c] text-white shadow-xs font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

            {/* Search Input & Import file */}
          <div className="flex items-center gap-2">
            {deletedLectureIds.length > 0 && onRestoreDefaultSamples && (
              <button
                onClick={onRestoreDefaultSamples}
                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 rounded-lg text-xs font-semibold flex items-center gap-1 shadow-xs transition"
                title="Khôi phục lại các bài mẫu đã xóa"
              >
                <RotateCcw size={13} className="text-amber-700" />
                <span>Khôi phục bài mẫu ({deletedLectureIds.length})</span>
              </button>
            )}

            <input
              type="text"
              placeholder="Tìm kiếm bài giảng, môn học..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs w-60 focus:ring-1 focus:ring-[#c43e1c] focus:outline-hidden"
            />

            {/* Prominent PowerPoint Import Button */}
            {onOpenImportPptx && (
              <button
                onClick={onOpenImportPptx}
                className="px-3 py-1.5 bg-[#c43e1c] hover:bg-[#a83214] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                title="Nhập bài giảng có sẵn từ file PowerPoint (.pptx) trên máy tính để trình chiếu hoặc chỉnh sửa"
              >
                <FileUp size={14} className="text-amber-300" />
                <span>Nhập File (.pptx)</span>
              </button>
            )}

            <label className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-1 shadow-xs" title="Nhập tệp sao lưu bài giảng (.json)">
              <Upload size={13} className="text-blue-600" />
              <span>Nhập JSON</span>
              <input type="file" accept=".json" onChange={onImportJSON} className="hidden" />
            </label>
          </div>
        </div>

        {/* Presentation Cards Grid */}
        <div className="flex-1 p-6 overflow-y-auto bg-[#f8f9fa]">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <FolderOpen size={48} className="mx-auto mb-3 opacity-40 text-[#c43e1c]" />
              <p className="font-semibold text-slate-600">Không tìm thấy bài giảng nào phù hợp</p>
              <p className="text-xs mt-1">Thử thay đổi từ khóa tìm kiếm hoặc chọn danh mục khác</p>
              {onOpenImportPptx && (
                <button
                  onClick={onOpenImportPptx}
                  className="mt-4 px-4 py-2 bg-[#c43e1c] hover:bg-[#a83214] text-white rounded-xl text-xs font-bold inline-flex items-center gap-2 shadow-sm transition cursor-pointer"
                >
                  <FileUp size={14} />
                  <span>Nhập file PowerPoint (.pptx) từ máy tính</span>
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((presentation) => {
                const isCurrent = presentation.id === currentPresentation.id;
                const isUserSaved = savedPresentations.some(s => s.id === presentation.id);
                const isHighlighted = presentation.id === highlightedId;
                const firstSlide = presentation.slides[0];
                const slideBg = firstSlide?.backgroundColor || '#1e5385';

                return (
                  <div
                    key={presentation.id}
                    className={`bg-white rounded-xl overflow-hidden border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-xl group relative ${
                      isHighlighted 
                        ? 'ring-4 ring-emerald-400 border-emerald-500 shadow-lg scale-[1.01]' 
                        : isCurrent 
                        ? 'ring-2 ring-[#c43e1c] border-[#c43e1c]' 
                        : 'border-slate-200'
                    }`}
                  >
                    <div>
                      {/* Slide Cover Preview */}
                      <div
                        className="aspect-video relative overflow-hidden flex flex-col justify-between p-3.5 text-white"
                        style={{ background: firstSlide?.backgroundGradient || slideBg }}
                      >
                        <div className="flex items-center justify-between z-10">
                          <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-bold backdrop-blur-xs">
                            {presentation.subject || 'Chủ đề chung'}
                          </span>
                          <div className="flex items-center gap-1">
                            {isHighlighted ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold animate-pulse shadow-xs">
                                ✓ Vừa lưu vào Kho
                              </span>
                            ) : isUserSaved ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-[10px] font-bold shadow-xs">
                                Bài của tôi
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-blue-600/80 text-[10px] font-bold shadow-xs">
                                Mẫu chuẩn
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-full bg-black/40 text-[10px] font-bold backdrop-blur-xs">
                              {presentation.slides.length} trang
                            </span>
                            {/* Nút xóa nhanh góc trên card */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeletingPresentation(presentation);
                              }}
                              className="w-5 h-5 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xs transition ml-1 cursor-pointer"
                              title="Xóa bài giảng này"
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>

                        <div className="z-10 text-center my-auto px-2">
                          <h4 className="font-bold text-sm leading-snug drop-shadow-md line-clamp-2">
                            {presentation.title}
                          </h4>
                        </div>

                        <div className="flex items-center justify-between text-[10px] opacity-85 z-10">
                          <span>{presentation.author}</span>
                          <span>{presentation.updatedAt}</span>
                        </div>
                      </div>

                      {/* Meta description */}
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-slate-800 text-sm mb-1 leading-snug line-clamp-2 group-hover:text-[#c43e1c] transition">
                            {presentation.title}
                          </h3>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-2">
                          <span className="flex items-center gap-1">
                            <GraduationCap size={13} className="text-amber-600" />
                            <span>{presentation.grade || 'Trung học'}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={13} className="text-blue-600" />
                            <span className="truncate max-w-[120px]">{presentation.author}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Toolbar & Footer */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-1">
                        {/* Primary action: Open / Edit in canvas */}
                        {isCurrent ? (
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 py-1">
                              <Check size={14} />
                              <span>{isUserSaved ? 'Đang mở & Đã lưu' : 'Đang mở'}</span>
                            </span>
                            {!isUserSaved && (
                              <button
                                onClick={handleSaveCurrent}
                                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-bold text-[11px] shadow-xs transition flex items-center gap-1 cursor-pointer"
                                title="Lưu bài giảng đang soạn này vào Kho"
                              >
                                <Save size={12} />
                                <span>Lưu vào Kho</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              onLoadPresentation(presentation);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-[#c43e1c] hover:bg-[#a83214] text-white rounded-lg font-bold text-xs shadow-xs transition flex items-center gap-1"
                          >
                            <Play size={12} className="fill-current" />
                            <span>Mở bài giảng</span>
                          </button>
                        )}

                        {/* Management action buttons */}
                        <div className="flex items-center gap-1.5">
                          {/* Chỉnh sửa thông tin bài giảng */}
                          <button
                            onClick={() => setEditingPresentation(presentation)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 bg-white border border-slate-200 rounded-lg transition"
                            title="Chỉnh sửa thông tin bài giảng (Tiêu đề, môn học, khối lớp...)"
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* Tạo bản sao bài giảng */}
                          <button
                            onClick={() => onDuplicatePresentation(presentation)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 bg-white border border-slate-200 rounded-lg transition"
                            title="Nhân bản bài giảng này thành bản sao mới"
                          >
                            <Copy size={15} />
                          </button>

                          {/* Tải tệp JSON */}
                          <button
                            onClick={() => handleExportSingleJSON(presentation)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 bg-white border border-slate-200 rounded-lg transition"
                            title="Xuất tải tệp JSON bài giảng này về máy"
                          >
                            <Download size={15} />
                          </button>

                          {/* Xóa bài giảng - Luôn hiển thị rõ ràng cho TẤT CẢ các bài giảng */}
                          <button
                            onClick={() => setDeletingPresentation(presentation)}
                            className="px-2 py-1 text-red-600 hover:text-red-700 hover:bg-red-100 bg-red-50 border border-red-200 rounded-lg transition flex items-center gap-1 font-bold text-xs shadow-2xs cursor-pointer"
                            title="Xóa bài giảng này khỏi Kho bài giảng"
                          >
                            <Trash2 size={14} className="text-red-600 shrink-0" />
                            <span className="text-[11px] text-red-700 font-bold">Xóa</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Edit Lecture Metadata Modal */}
      {editingPresentation && (
        <EditLectureModal
          isOpen={true}
          onClose={() => setEditingPresentation(null)}
          presentation={editingPresentation}
          onSave={(updated) => {
            onUpdatePresentationInLibrary(updated);
            setEditingPresentation(null);
          }}
          onDelete={(toDelete) => {
            setDeletingPresentation(toDelete);
            setEditingPresentation(null);
          }}
        />
      )}

      {/* Permanent Delete Confirmation Modal */}
      {deletingPresentation && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-red-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600 mb-3">
              <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Xác Nhận Xóa Vĩnh Viễn</h3>
                <p className="text-xs text-red-600 font-semibold">Dữ liệu không thể khôi phục sau khi xóa</p>
              </div>
            </div>

            <div className="text-sm text-slate-700 mb-4 bg-red-50/70 p-3.5 rounded-xl border border-red-100 space-y-2">
              <p className="text-xs text-slate-600">
                Bạn có chắc chắn muốn xóa bài giảng:
              </p>
              <p className="text-sm text-red-800 font-bold break-words">
                "{deletingPresentation.title}"
              </p>
              <p className="text-[11px] text-red-600 font-medium pt-1 border-t border-red-200">
                ⚠️ Cảnh báo: Bài giảng sẽ bị xóa vĩnh viễn khỏi Đám mây Cloud Firestore và trên mọi thiết bị/tab (kể cả tab ẩn danh). Sau khi xóa sẽ KHÔNG THỂ KHÔI PHỤC!
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                disabled={isDeleting}
                onClick={() => setDeletingPresentation(null)}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer disabled:opacity-50"
              >
                Hủy bỏ
              </button>
              <button
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Đang xóa vĩnh viễn...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Xác nhận xóa vĩnh viễn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
