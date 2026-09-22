import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Play, 
  Edit3, 
  Save, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Image as ImageIcon, 
  Ratio,
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { Presentation } from '../types/presentation';
import { parsePowerPointFile, PptxImportResult } from '../utils/pptxImporter';

interface ImportPowerPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenForEdit: (presentation: Presentation) => void;
  onOpenForSlideShow: (presentation: Presentation) => void;
  onSaveToLibrary: (presentation: Presentation) => void;
  initialFile?: File | null;
}

export const ImportPowerPointModal: React.FC<ImportPowerPointModalProps> = ({
  isOpen,
  onClose,
  onOpenForEdit,
  onOpenForSlideShow,
  onSaveToLibrary,
  initialFile = null
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<PptxImportResult | null>(null);
  const [customTitle, setCustomTitle] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleProcessFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pptx') && !file.name.toLowerCase().endsWith('.ppt')) {
      setErrorMsg('Vui lòng chọn tệp PowerPoint có phần mở rộng .pptx (chuẩn PowerPoint 2007-2024, Google Slides, Canva...)');
      return;
    }

    if (file.name.toLowerCase().endsWith('.ppt') && !file.name.toLowerCase().endsWith('.pptx')) {
      setErrorMsg('Tệp .ppt (định dạng nhị phân Office 97-2003 cũ). Khuyến khích bạn lưu dưới định dạng .pptx hiện đại trên PowerPoint trước khi nhập để có trải nghiệm hiển thị tốt nhất.');
    }

    setIsLoading(true);
    setErrorMsg(null);
    setImportResult(null);
    setProgressPercent(10);
    setLoadingStep('Đang khởi tạo trình phân tích...');

    try {
      const result = await parsePowerPointFile(file, (msg, pct) => {
        setLoadingStep(msg);
        setProgressPercent(pct);
      });

      setImportResult(result);
      setCustomTitle(result.presentation.title);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Import PPTX error:', err);
      setErrorMsg(err?.message || 'Có lỗi xảy ra khi đọc tệp PowerPoint. Vui lòng kiểm tra lại tệp.');
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && initialFile) {
      handleProcessFile(initialFile);
    }
  }, [isOpen, initialFile]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const getFinalPresentation = (): Presentation => {
    if (!importResult) throw new Error('No presentation');
    return {
      ...importResult.presentation,
      title: customTitle.trim() || importResult.presentation.title
    };
  };

  const handleEditClick = () => {
    const pres = getFinalPresentation();
    onOpenForEdit(pres);
    onClose();
  };

  const handleSlideShowClick = () => {
    const pres = getFinalPresentation();
    onOpenForSlideShow(pres);
    onClose();
  };

  const handleSaveToLibClick = () => {
    const pres = getFinalPresentation();
    onSaveToLibrary(pres);
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#c43e1c] text-white p-4.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-[#c43e1c] flex items-center justify-center font-black text-lg shadow-sm">
              P
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-wide flex items-center gap-2">
                NHẬP BÀI GIẢNG POWERPOINT TỪ MÁY TÍNH
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 font-bold uppercase tracking-wider">
                  .PPTX
                </span>
              </h2>
              <p className="text-xs text-white/85">
                Tải lên file PowerPoint có sẵn để Trình chiếu ngay hoặc Chỉnh sửa trực tiếp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 text-white/90 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          {/* File Picker / Drop Zone */}
          {!importResult && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center ${
                isDragging
                  ? 'border-[#c43e1c] bg-orange-50 scale-[0.99]'
                  : 'border-slate-300 hover:border-[#c43e1c]/60 bg-white shadow-xs'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-orange-50 text-[#c43e1c] flex items-center justify-center mb-4 shadow-inner">
                {isLoading ? (
                  <Loader2 size={32} className="animate-spin text-[#c43e1c]" />
                ) : (
                  <Upload size={30} className="text-[#c43e1c]" />
                )}
              </div>

              {isLoading ? (
                <div className="w-full max-w-md">
                  <h3 className="font-bold text-slate-800 text-sm mb-1">
                    Đang nhập tệp PowerPoint...
                  </h3>
                  <p className="text-xs text-slate-500 mb-3">{loadingStep}</p>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#c43e1c] h-full transition-all duration-300 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <span className="text-[11px] font-bold text-[#c43e1c] mt-1.5 block">
                    {progressPercent}%
                  </span>
                </div>
              ) : (
                <>
                  <h3 className="font-bold text-slate-800 text-base mb-1">
                    Kéo và thả file PowerPoint (.pptx) vào đây
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mb-4">
                    Hoặc bấm nút bên dưới để duyệt tệp từ máy tính của bạn
                  </p>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                    onChange={handleFileChange}
                    className="hidden"
                    id="pptx-file-input"
                  />

                  <label
                    htmlFor="pptx-file-input"
                    className="px-5 py-2.5 bg-[#c43e1c] hover:bg-[#a83214] text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-md flex items-center gap-2"
                  >
                    <FileText size={15} />
                    <span>Chọn tệp PowerPoint từ máy tính</span>
                  </label>

                  <div className="mt-5 pt-4 border-t border-slate-200 text-slate-500 text-[11px] flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-600" /> Chuẩn PowerPoint .pptx
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-600" /> Giữ nguyên bố cục & hình ảnh
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={12} className="text-emerald-600" /> Xuất từ Canva / Google Slides
                    </span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-4 p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-start gap-2.5">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
              <div>
                <p className="font-bold">Không thể đọc file PowerPoint</p>
                <p className="mt-0.5 text-red-600">{errorMsg}</p>
              </div>
            </div>
          )}

          {/* Result Preview & Action Selection */}
          {importResult && (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Success Banner */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-emerald-900">
                      Đã nhập thành công bài giảng PowerPoint!
                    </h3>
                    <p className="text-xs text-emerald-700">
                      Đã trích xuất hoàn chỉnh văn bản, slide và hình ảnh sẵn sàng phục vụ giảng dạy
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setImportResult(null);
                    setErrorMsg(null);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                >
                  Chọn file khác
                </button>
              </div>

              {/* Title & Stats */}
              <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên bài giảng:
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-[#c43e1c] focus:outline-hidden"
                    placeholder="Nhập tên bài giảng..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-2.5">
                    <Layers size={18} className="text-[#c43e1c]" />
                    <div>
                      <div className="text-[11px] text-slate-500">Số lượng trang</div>
                      <div className="text-sm font-extrabold text-slate-800">
                        {importResult.slideCount} slide
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-2.5">
                    <ImageIcon size={18} className="text-blue-600" />
                    <div>
                      <div className="text-[11px] text-slate-500">Hình ảnh trích xuất</div>
                      <div className="text-sm font-extrabold text-slate-800">
                        {importResult.imageCount} ảnh
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center gap-2.5">
                    <Ratio size={18} className="text-purple-600" />
                    <div>
                      <div className="text-[11px] text-slate-500">Tỷ lệ khung hình</div>
                      <div className="text-sm font-extrabold text-slate-800">
                        {importResult.presentation.aspectRatio}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Slides Preview Grid */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                  <FileText size={14} className="text-[#c43e1c]" />
                  <span>Xem trước danh sách slide ({importResult.presentation.slides.length}):</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-48 overflow-y-auto p-1">
                  {importResult.presentation.slides.map((s, idx) => (
                    <div 
                      key={s.id}
                      className="p-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs hover:border-[#c43e1c] transition text-left"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold mb-1">
                        <span>Trang {idx + 1}</span>
                        <span>{s.elements.length} mục</span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-800 truncate" title={s.title}>
                        {s.title || `Trang ${idx + 1}`}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS (SlideShow or Edit) */}
              <div className="pt-2 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-3 text-center">
                  Bạn muốn làm gì với bài giảng PowerPoint này?
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Option 1: Trình chiếu ngay */}
                  <button
                    onClick={handleSlideShowClick}
                    className="p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition flex flex-col items-center justify-center gap-1.5 shadow-md group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-sm font-extrabold">
                      <Play size={16} className="fill-current" />
                      <span>Trình chiếu ngay</span>
                    </div>
                    <span className="text-[10px] font-normal text-emerald-100 text-center">
                      Mở toàn màn hình (F5) để giảng dạy ngay lập tức
                    </span>
                  </button>

                  {/* Option 2: Chỉnh sửa */}
                  <button
                    onClick={handleEditClick}
                    className="p-3.5 rounded-xl bg-[#c43e1c] hover:bg-[#a83214] text-white font-bold transition flex flex-col items-center justify-center gap-1.5 shadow-md group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-sm font-extrabold">
                      <Edit3 size={16} />
                      <span>Chỉnh sửa bài giảng</span>
                    </div>
                    <span className="text-[10px] font-normal text-orange-100 text-center">
                      Thêm bớt slide, chỉnh sửa chữ, chèn công thức
                    </span>
                  </button>

                  {/* Option 3: Lưu vào Kho bài giảng */}
                  <button
                    onClick={handleSaveToLibClick}
                    className="p-3.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 font-bold transition flex flex-col items-center justify-center gap-1.5 shadow-xs group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-sm font-extrabold text-[#c43e1c]">
                      <Save size={16} />
                      <span>Lưu vào Kho</span>
                    </div>
                    <span className="text-[10px] font-normal text-slate-500 text-center">
                      Lưu trữ vào thư viện để dùng cho các tiết học sau
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
