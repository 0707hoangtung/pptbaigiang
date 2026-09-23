import React, { useState } from 'react';
import { 
  Play, 
  Save, 
  RotateCcw, 
  RotateCw, 
  FolderOpen, 
  Download, 
  Printer, 
  Maximize, 
  Minimize, 
  Check, 
  Sparkles,
  Layers,
  FileText,
  Clock,
  RefreshCw,
  Zap,
  FileUp,
  Crown,
  Users,
  User,
  Key,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Lock
} from 'lucide-react';
import { CurrentUser } from '../types/auth';

interface TitleBarProps {
  title: string;
  onUpdateTitle: (title: string) => void;
  onSave: () => void;
  isSaved: boolean;
  isRealtimeSyncing?: boolean;
  isOnline?: boolean;
  lastSavedTime?: string;
  currentTime?: string;
  isRealtimeEnabled?: boolean;
  onToggleRealtime?: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onStartSlideShow: () => void;
  onOpenRepository: () => void;
  onOpenImportPptx?: () => void;
  onExportPPTX?: () => void;
  isExportingPPTX?: boolean;
  onExportJSON: () => void;
  onPrintSlides: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  currentUser?: CurrentUser | null;
  onOpenAuthModal?: () => void;
  onOpenMemberManagement?: () => void;
  onOpenChangeAdminPassword?: () => void;
  onLogout?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  title,
  onUpdateTitle,
  onSave,
  isSaved,
  isRealtimeSyncing,
  isOnline = true,
  lastSavedTime,
  currentTime,
  isRealtimeEnabled = true,
  onToggleRealtime,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onStartSlideShow,
  onOpenRepository,
  onOpenImportPptx,
  onExportPPTX,
  isExportingPPTX = false,
  onExportJSON,
  onPrintSlides,
  onToggleFullscreen,
  isFullscreen,
  currentUser,
  onOpenAuthModal,
  onOpenMemberManagement,
  onOpenChangeAdminPassword,
  onLogout
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(title);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const handleTitleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempTitle.trim()) {
      onUpdateTitle(tempTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="h-10 bg-[#c43e1c] text-white flex items-center justify-between px-3 text-xs select-none border-b border-[#a83214] z-30 shrink-0">
      {/* Left: PPT Brand Icon & Quick Access Toolbar */}
      <div className="flex items-center space-x-2">
        {/* PowerPoint Logo / Bài Giảng Badge */}
        <div className="flex items-center space-x-1.5 font-bold tracking-wider mr-1">
          <div className="w-6 h-6 bg-white text-[#c43e1c] rounded flex items-center justify-center font-black text-sm shadow-sm">
            P
          </div>
          <span className="font-extrabold text-sm tracking-normal flex items-center gap-1">
            BÀI GIẢNG
          </span>
        </div>

        {/* Quick Access Toolbar */}
        <div className="flex items-center space-x-1.5 border-l border-white/20 pl-2">
          <button
            onClick={onSave}
            title={isSaved ? 'Đã lưu bài giảng an toàn (Ctrl + S)' : 'Lưu bài giảng đang soạn (Ctrl + S)'}
            className={`p-1.5 rounded transition flex items-center justify-center shadow-xs cursor-pointer ${
              isSaved 
                ? 'bg-white/15 hover:bg-white/25 text-white' 
                : 'bg-amber-400 hover:bg-amber-300 text-slate-900 animate-pulse'
            }`}
          >
            {isRealtimeSyncing ? (
              <RefreshCw size={13} className="animate-spin text-amber-300" />
            ) : isSaved ? (
              <Check size={13} className="text-emerald-300" />
            ) : (
              <Save size={13} />
            )}
          </button>

          {/* Real-time Cloud & Offline Persistence Indicator Badge */}
          <div 
            onClick={onToggleRealtime}
            className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/20 hover:bg-black/30 cursor-pointer transition text-[10.5px]"
            title={!isOnline ? "Đang lưu trữ ngoại tuyến an toàn (IndexedDB) - Tự động đồng bộ lên đám mây khi có mạng" : "Đồng bộ đám mây thời gian thực - Dữ liệu bảo toàn trên mọi thiết bị"}
          >
            {isRealtimeSyncing ? (
              <>
                <RefreshCw size={11} className="animate-spin text-amber-300" />
                <span className="text-amber-200 font-medium">Đang lưu...</span>
              </>
            ) : !isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span className="text-amber-200 font-medium">Lưu ngoại tuyến</span>
                {lastSavedTime && (
                  <span className="text-white/70 text-[9.5px]">({lastSavedTime})</span>
                )}
              </>
            ) : (
              <>
                <span className={`w-2 h-2 rounded-full ${isRealtimeEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
                <span className="text-white/90 font-medium">
                  {isRealtimeEnabled ? 'Thời gian thực' : 'Đã tắt'}
                </span>
                {lastSavedTime && (
                  <span className="text-white/70 text-[9.5px]">({lastSavedTime})</span>
                )}
              </>
            )}
          </div>

          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Hoàn tác (Ctrl + Z)"
            className={`p-1.5 rounded hover:bg-white/15 transition ${
              !canUndo ? 'opacity-40 cursor-not-allowed' : 'opacity-90 hover:opacity-100'
            }`}
          >
            <RotateCcw size={14} />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Làm lại (Ctrl + Y)"
            className={`p-1.5 rounded hover:bg-white/15 transition ${
              !canRedo ? 'opacity-40 cursor-not-allowed' : 'opacity-90 hover:opacity-100'
            }`}
          >
            <RotateCw size={14} />
          </button>

          <button
            onClick={onStartSlideShow}
            title="Trình chiếu từ đầu (F5)"
            className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-500 font-medium transition flex items-center justify-center shadow-xs ml-0.5"
          >
            <Play size={13} className="fill-current" />
          </button>
        </div>
      </div>

      {/* Center: Editable Presentation Title */}
      <div className="flex-1 max-w-xl mx-4 flex justify-center">
        {isEditingTitle ? (
          <form onSubmit={handleTitleSubmit} className="w-full">
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              autoFocus
              className="w-full bg-white text-slate-900 px-2 py-0.5 rounded text-xs text-center font-medium focus:outline-hidden"
            />
          </form>
        ) : (
          <button
            onClick={() => {
              setTempTitle(title);
              setIsEditingTitle(true);
            }}
            title="Bấm để đổi tên bài giảng"
            className="px-3 py-1 rounded hover:bg-white/15 transition text-xs font-medium truncate max-w-md border border-transparent hover:border-white/20"
          >
            {title} <span className="opacity-70 text-[10px]">✏️</span>
          </button>
        )}
      </div>

      {/* Right: Repository, Export, Fullscreen, Clock */}
      <div className="flex items-center space-x-1.5">
        {/* Real-time live clock */}
        {currentTime && (
          <div 
            className="hidden md:flex items-center gap-1 text-[11px] font-mono bg-black/20 px-2 py-1 rounded text-white/90"
            title="Đồng hồ hệ thống thời gian thực"
          >
            <Clock size={12} className="text-amber-300" />
            <span>{currentTime}</span>
          </div>
        )}

        {onOpenImportPptx && (
          <button
            onClick={onOpenImportPptx}
            title="Nhập file (.pptx, hình ảnh, bài giảng...) từ máy tính để trình chiếu hoặc chỉnh sửa"
            className="px-2.5 py-1 rounded bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <FileUp size={13} className="text-slate-900" />
            <span className="text-[11px]">Nhập File</span>
          </button>
        )}

        <button
          onClick={onOpenRepository}
          title="Mở danh sách Bài Giảng (Các bài học mẫu & đã lưu)"
          className="px-2.5 py-1 rounded bg-white text-[#c43e1c] hover:bg-amber-50 font-bold transition flex items-center gap-1.5 shadow-sm"
        >
          <FolderOpen size={13} />
          <span className="text-[11px]">Bài Giảng</span>
        </button>

        {/* User Account / Role Menu */}
        <div className="relative">
          {currentUser?.role === 'super_admin' ? (
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              title="Quản trị viên cao nhất (Bấm để xem menu quản trị & thành viên)"
              className="px-2.5 py-1 rounded bg-gradient-to-r from-amber-400 to-amber-300 text-slate-900 font-extrabold transition flex items-center gap-1.5 shadow-sm hover:brightness-105 cursor-pointer"
            >
              <Crown size={14} className="text-amber-800" />
              <span className="text-[11px] hidden sm:inline">Quản trị viên cao nhất</span>
              <span className="text-[11px] sm:hidden">Admin</span>
              <ChevronDown size={12} className="opacity-70" />
            </button>
          ) : currentUser?.role === 'member' ? (
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              title={`Thành viên: ${currentUser.fullName} (${currentUser.phone})`}
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <User size={13} />
              <span className="text-[11px] max-w-[100px] truncate">{currentUser.fullName}</span>
              <ChevronDown size={12} className="opacity-70" />
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              title="Đăng nhập tài khoản Quản trị viên hoặc Thành viên"
              className="px-2.5 py-1 rounded bg-black/25 hover:bg-black/40 text-white font-bold transition flex items-center gap-1.5 border border-white/20 cursor-pointer"
            >
              <Lock size={12} />
              <span className="text-[11px]">Đăng nhập</span>
            </button>
          )}

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsUserMenuOpen(false)} 
              />
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                {currentUser?.role === 'super_admin' ? (
                  <>
                    <div className="px-3 py-2 border-b border-slate-100 bg-amber-50/50">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                        <Crown size={14} className="text-amber-600" />
                        <span>Quản trị viên cao nhất</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Toàn quyền quản trị bài giảng & thành viên
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenMemberManagement && onOpenMemberManagement();
                      }}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-slate-100 font-semibold text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Users size={15} className="text-blue-600" />
                      <span>Quản lý thành viên (Cấp / Sửa / Xóa)</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onOpenChangeAdminPassword && onOpenChangeAdminPassword();
                      }}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-slate-100 font-semibold text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Key size={15} className="text-amber-600" />
                      <span>Đổi mật khẩu Quản trị viên</span>
                    </button>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout && onLogout();
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Đăng xuất</span>
                    </button>
                  </>
                ) : currentUser?.role === 'member' ? (
                  <>
                    <div className="px-3 py-2 border-b border-slate-100 bg-blue-50/50">
                      <div className="font-bold text-xs text-slate-800">{currentUser.fullName}</div>
                      <div className="text-[11px] text-slate-500">SĐT: {currentUser.phone}</div>
                      <div className="mt-1">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                          Quyền: {currentUser.permission === 'editor' ? 'Biên tập viên' : 'Chỉ xem'}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        onLogout && onLogout();
                      }}
                      className="w-full px-3 py-1.5 text-left text-xs text-red-600 hover:bg-red-50 font-semibold flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut size={15} />
                      <span>Đăng xuất</span>
                    </button>
                  </>
                ) : null}
              </div>
            </>
          )}
        </div>

        {/* Xuất file PowerPoint (.pptx) & Các tùy chọn */}
        <div className="relative">
          <div className="flex items-center bg-white/10 hover:bg-white/20 rounded transition divide-x divide-white/20">
            <button
              onClick={onExportPPTX || onExportJSON}
              disabled={isExportingPPTX}
              title="Xuất bài giảng ra tệp Microsoft PowerPoint (.pptx) chuẩn Office để chỉnh sửa hoặc trình chiếu"
              className="px-2.5 py-1 text-white font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isExportingPPTX ? (
                <RefreshCw size={13} className="animate-spin text-amber-300" />
              ) : (
                <Download size={13} className="text-amber-300" />
              )}
              <span className="text-[11px] font-semibold">
                {isExportingPPTX ? 'Đang xuất .pptx...' : 'Xuất file'}
              </span>
              <span className="text-[9px] px-1 py-0.2 bg-amber-400 text-slate-900 rounded font-mono font-extrabold uppercase">
                .pptx
              </span>
            </button>

            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              title="Tùy chọn định dạng xuất bài giảng (.pptx, .pdf, .json)"
              className="p-1 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            >
              <ChevronDown size={12} />
            </button>
          </div>

          {/* Export options popup */}
          {isExportMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsExportMenuOpen(false)} 
              />
              <div className="absolute right-0 mt-1 w-68 bg-white rounded-xl shadow-2xl border border-slate-200 text-slate-800 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 border-b border-slate-100 bg-slate-50 font-bold text-[11px] text-slate-600">
                  Chọn định dạng xuất bài giảng:
                </div>
                
                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    if (onExportPPTX) onExportPPTX();
                    else onExportJSON();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-orange-50 flex items-start gap-2.5 cursor-pointer transition"
                >
                  <div className="p-1.5 rounded bg-[#c43e1c] text-white shrink-0 mt-0.5">
                    <Download size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Microsoft PowerPoint</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-red-100 text-red-700 rounded font-mono font-bold">.pptx</span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      Định dạng chuẩn quốc tế, mở và chỉnh sửa trực tiếp trên PowerPoint, Google Slides, Canva
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    onPrintSlides();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-blue-50 flex items-start gap-2.5 cursor-pointer transition border-t border-slate-100"
                >
                  <div className="p-1.5 rounded bg-blue-600 text-white shrink-0 mt-0.5">
                    <Printer size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>In ấn / Xuất tài liệu PDF</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-blue-100 text-blue-700 rounded font-mono font-bold">.pdf</span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      In tài liệu phát tay, giáo án hoặc xuất lưu trữ PDF
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsExportMenuOpen(false);
                    onExportJSON();
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-slate-100 flex items-start gap-2.5 cursor-pointer transition border-t border-slate-100"
                >
                  <div className="p-1.5 rounded bg-slate-700 text-white shrink-0 mt-0.5">
                    <Download size={15} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <span>Sao lưu dự phòng hệ thống</span>
                      <span className="text-[10px] px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded font-mono font-bold">.json</span>
                    </div>
                    <div className="text-[10px] text-slate-500 leading-tight mt-0.5">
                      Tệp cấu trúc dữ liệu thô để nhập lại vào app
                    </div>
                  </div>
                </button>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onToggleFullscreen}
          title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Toàn màn hình'}
          className="p-1.5 rounded hover:bg-white/15 transition"
        >
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      </div>
    </div>
  );
};
