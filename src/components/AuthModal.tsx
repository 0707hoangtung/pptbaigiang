import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  User, 
  Key, 
  Phone, 
  Lock, 
  Crown, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { CurrentUser } from '../types/auth';
import { loginAsSuperAdmin, loginAsMember, changeSuperAdminPassword } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser | null;
  onLoginSuccess: (user: CurrentUser) => void;
  initialMode?: 'login' | 'change_admin_pw';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  initialMode = 'login'
}) => {
  const [tab, setTab] = useState<'super_admin' | 'member'>('super_admin');
  const [mode, setMode] = useState<'login' | 'change_admin_pw'>(initialMode);
  
  // Super Admin Login fields
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPw, setShowAdminPw] = useState(false);

  // Member Login fields
  const [memberPhone, setMemberPhone] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [showMemberPw, setShowMemberPw] = useState(false);

  // Change Admin PW fields
  const [currentAdminPw, setCurrentAdminPw] = useState('');
  const [newAdminPw, setNewAdminPw] = useState('');
  const [confirmAdminPw, setConfirmAdminPw] = useState('');

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!adminPassword.trim()) {
      setErrorMsg('Vui lòng nhập mật khẩu Quản trị viên!');
      return;
    }

    setLoading(true);
    const res = await loginAsSuperAdmin(adminPassword);
    setLoading(false);

    if (res.success && res.user) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onLoginSuccess(res.user!);
        onClose();
      }, 500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleMemberLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!memberPhone.trim() || !memberPassword.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ Số điện thoại và Mật khẩu!');
      return;
    }

    setLoading(true);
    const res = await loginAsMember(memberPhone, memberPassword);
    setLoading(false);

    if (res.success && res.user) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onLoginSuccess(res.user!);
        onClose();
      }, 500);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleChangeAdminPw = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentAdminPw || !newAdminPw) {
      setErrorMsg('Vui lòng điền đầy đủ mật khẩu hiện tại và mật khẩu mới!');
      return;
    }

    if (newAdminPw.length < 6) {
      setErrorMsg('Mật khẩu mới phải có tối thiểu 6 ký tự!');
      return;
    }

    if (newAdminPw !== confirmAdminPw) {
      setErrorMsg('Mật khẩu mới xác nhận không khớp nhau!');
      return;
    }

    setLoading(true);
    const res = await changeSuperAdminPassword(currentAdminPw, newAdminPw);
    setLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        setMode('login');
        setCurrentAdminPw('');
        setNewAdminPw('');
        setConfirmAdminPw('');
        onClose();
      }, 1000);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#c43e1c] to-[#992d11] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner">
              {mode === 'change_admin_pw' ? (
                <Key size={22} className="text-amber-300" />
              ) : tab === 'super_admin' ? (
                <Crown size={22} className="text-amber-300" />
              ) : (
                <User size={22} className="text-white" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {mode === 'change_admin_pw' 
                  ? 'Đổi mật khẩu Quản trị viên cao nhất' 
                  : 'Đăng nhập hệ thống Bài Giảng'}
              </h3>
              <p className="text-xs text-white/80 mt-0.5">
                {mode === 'change_admin_pw' 
                  ? 'Cập nhật mật khẩu bảo mật riêng của bạn'
                  : 'Xác thực tài khoản và phân quyền sử dụng'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Change Mode Switch / Tabs */}
        {mode === 'login' && (
          <div className="flex border-b border-slate-200 bg-slate-50">
            <button
              onClick={() => {
                setTab('super_admin');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
                tab === 'super_admin'
                  ? 'border-[#c43e1c] text-[#c43e1c] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Crown size={15} className={tab === 'super_admin' ? 'text-amber-500' : 'text-slate-400'} />
              <span>Quản trị viên cao nhất</span>
            </button>
            <button
              onClick={() => {
                setTab('member');
                setErrorMsg('');
                setSuccessMsg('');
              }}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
                tab === 'member'
                  ? 'border-[#c43e1c] text-[#c43e1c] bg-white'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User size={15} className={tab === 'member' ? 'text-blue-500' : 'text-slate-400'} />
              <span>Thành viên (SĐT)</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6">
          {/* Alerts */}
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mode: Change Admin Password */}
          {mode === 'change_admin_pw' && (
            <form onSubmit={handleChangeAdminPw} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu hiện tại:
                </label>
                <div className="relative">
                  <Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={currentAdminPw}
                    onChange={(e) => setCurrentAdminPw(e.target.value)}
                    placeholder="Nhập mật khẩu quản trị hiện tại"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#c43e1c] focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu mới (tối thiểu 6 ký tự):
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={newAdminPw}
                    onChange={(e) => setNewAdminPw(e.target.value)}
                    placeholder="Nhập mật khẩu mới"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#c43e1c] focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Xác nhận lại mật khẩu mới:
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={confirmAdminPw}
                    onChange={(e) => setConfirmAdminPw(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#c43e1c] focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition cursor-pointer"
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-[#c43e1c] hover:bg-[#a83214] text-white text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Đang lưu...' : 'Lưu mật khẩu mới'}
                </button>
              </div>
            </form>
          )}

          {/* Mode: Super Admin Login */}
          {mode === 'login' && tab === 'super_admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 text-[11px] leading-relaxed">
                👑 <strong>Quyền hạn tối cao:</strong> Quản lý toàn quyền hệ thống, xem và cấp tài khoản thành viên, chỉnh sửa/xóa thành viên và cấu hình kho bài giảng.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu Quản trị viên riêng:
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showAdminPw ? 'text' : 'password'}
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Nhập mật khẩu quản trị..."
                    autoFocus
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#c43e1c] focus:bg-white transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPw(!showAdminPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showAdminPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Mật khẩu ban đầu mặc định: <code className="bg-slate-100 text-slate-700 px-1 rounded font-mono">admin123456</code></span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#c43e1c] to-[#a83214] text-white text-xs font-bold shadow-lg hover:shadow-xl transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ShieldCheck size={16} />
                <span>{loading ? 'Đang xác thực...' : 'Đăng nhập Quản trị viên'}</span>
              </button>

              {currentUser?.role === 'super_admin' && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => setMode('change_admin_pw')}
                    className="text-xs text-[#c43e1c] hover:underline font-semibold cursor-pointer"
                  >
                    🔑 Đổi mật khẩu Quản trị viên
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Mode: Member Login */}
          {mode === 'login' && tab === 'member' && (
            <form onSubmit={handleMemberLogin} className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200/80 rounded-xl text-blue-800 text-[11px] leading-relaxed">
                👤 <strong>Dành cho Thành viên:</strong> Đăng nhập bằng <strong>Số điện thoại</strong> và <strong>Mật khẩu</strong> do Quản trị viên cao nhất cấp.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số điện thoại đăng nhập:
                </label>
                <div className="relative">
                  <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    placeholder="Ví dụ: 0912345678"
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#c43e1c] focus:bg-white transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật khẩu tài khoản:
                </label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showMemberPw ? 'text' : 'password'}
                    value={memberPassword}
                    onChange={(e) => setMemberPassword(e.target.value)}
                    placeholder="Nhập mật khẩu được cấp..."
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#c43e1c] focus:bg-white transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowMemberPw(!showMemberPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showMemberPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <User size={16} />
                <span>{loading ? 'Đang đăng nhập...' : 'Đăng nhập Thành viên'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
