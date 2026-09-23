import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  Phone, 
  User, 
  Key, 
  Lock, 
  Unlock, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  AlertCircle, 
  Crown,
  Eye,
  EyeOff,
  Filter
} from 'lucide-react';
import { Member, CurrentUser, MemberPermission, AccountStatus } from '../types/auth';
import { 
  subscribeToMembers, 
  createMember, 
  updateMember, 
  deleteMember 
} from '../services/authService';

interface MemberManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUser | null;
}

export const MemberManagementModal: React.FC<MemberManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPermission, setFilterPermission] = useState<'all' | 'editor' | 'viewer'>('all');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states for Add / Edit
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    permission: 'editor' as MemberPermission,
    status: 'active' as AccountStatus
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Real-time Firestore sync
  useEffect(() => {
    if (!isOpen || currentUser?.role !== 'super_admin') return;

    const unsubscribe = subscribeToMembers(
      currentUser,
      (list) => {
        setMembers(list);
      },
      (err) => {
        console.error('Member sync error:', err);
      }
    );

    return () => unsubscribe();
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // STRICT ACCESS CONTROL: Only Super Admin can view or manage members
  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock size={28} />
          </div>
          <h3 className="font-bold text-base text-slate-800 mb-1">Truy cập bị từ chối</h3>
          <p className="text-xs text-slate-500 mb-4">
            Chỉ Quản trị viên cao nhất mới có quyền xem danh sách và quản lý thành viên hệ thống!
          </p>
          <button 
            onClick={onClose}
            className="w-full py-2 bg-slate-800 text-white rounded-xl text-xs font-bold"
          >
            Đóng lại
          </button>
        </div>
      </div>
    );
  }

  const handleOpenAdd = () => {
    setEditingMember(null);
    setFormData({
      fullName: '',
      phone: '',
      password: '',
      permission: 'editor',
      status: 'active'
    });
    setFeedback(null);
    setIsAddingMember(true);
  };

  const handleOpenEdit = (m: Member) => {
    setIsAddingMember(false);
    setEditingMember(m);
    setFormData({
      fullName: m.fullName,
      phone: m.phone,
      password: m.password,
      permission: m.permission,
      status: m.status
    });
    setFeedback(null);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    if (editingMember) {
      // Update existing
      const res = await updateMember(currentUser, editingMember.id, {
        fullName: formData.fullName,
        phone: formData.phone,
        password: formData.password,
        permission: formData.permission,
        status: formData.status
      });

      setSubmitting(false);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          setEditingMember(null);
          setFeedback(null);
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    } else {
      // Create new
      const res = await createMember(currentUser, {
        fullName: formData.fullName,
        phone: formData.phone,
        password: formData.password,
        permission: formData.permission
      });

      setSubmitting(false);
      if (res.success) {
        setFeedback({ type: 'success', message: res.message });
        setTimeout(() => {
          setIsAddingMember(false);
          setFeedback(null);
        }, 1200);
      } else {
        setFeedback({ type: 'error', message: res.message });
      }
    }
  };

  const handleToggleStatus = async (m: Member) => {
    const newStatus: AccountStatus = m.status === 'active' ? 'locked' : 'active';
    await updateMember(currentUser, m.id, { status: newStatus });
  };

  const handleDelete = async (m: Member) => {
    const res = await deleteMember(currentUser, m.id);
    setConfirmDeleteId(null);
    if (res.success) {
      setFeedback({ type: 'success', message: res.message });
      setTimeout(() => setFeedback(null), 2500);
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Filtered members list
  const filteredMembers = members.filter((m) => {
    const matchSearch = 
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery);
    const matchPerm = filterPermission === 'all' || m.permission === filterPermission;
    return matchSearch && matchPerm;
  });

  const activeCount = members.filter(m => m.status === 'active').length;
  const lockedCount = members.filter(m => m.status === 'locked').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className="w-full max-w-4xl max-h-[92vh] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/30 flex items-center justify-center">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base leading-tight">Quản lý Thành viên hệ thống</h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-extrabold flex items-center gap-1">
                  <Crown size={12} /> Quản trị viên cao nhất
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Cấp tài khoản (Họ tên + SĐT), chỉnh sửa phân quyền, tạm khóa hoặc xóa thành viên
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Top Action & Stats Bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Quick stats pills */}
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 shadow-2xs">
              Tổng thành viên: <strong className="text-slate-900">{members.length}</strong>
            </span>
            <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg font-semibold shadow-2xs">
              Hoạt động: <strong>{activeCount}</strong>
            </span>
            {lockedCount > 0 && (
              <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg font-semibold shadow-2xs">
                Đang khóa: <strong>{lockedCount}</strong>
              </span>
            )}
          </div>

          {/* Add member button */}
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#c43e1c] hover:bg-[#a83214] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm hover:shadow-md transition cursor-pointer"
          >
            <UserPlus size={15} />
            <span>+ Cấp tài khoản Thành viên mới</span>
          </button>
        </div>

        {/* Feedback message banner */}
        {feedback && (
          <div className={`px-6 py-2.5 text-xs flex items-center gap-2 shrink-0 ${
            feedback.type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span className="font-medium">{feedback.message}</span>
          </div>
        )}

        {/* Main Body: Modal or Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Form for Add or Edit member */}
          {(isAddingMember || editingMember) ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 max-w-xl mx-auto shadow-sm">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  {editingMember ? <Edit3 size={17} className="text-blue-600" /> : <UserPlus size={17} className="text-[#c43e1c]" />}
                  <span>{editingMember ? `Chỉnh sửa thành viên: ${editingMember.fullName}` : 'Cấp tài khoản Thành viên mới'}</span>
                </h3>
                <button 
                  onClick={() => {
                    setIsAddingMember(false);
                    setEditingMember(null);
                  }}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Họ và tên thành viên: <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        placeholder="Ví dụ: Nguyễn Văn A"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#c43e1c]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Số điện thoại (dùng đăng nhập): <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="Ví dụ: 0987654321"
                        required
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#c43e1c]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mật khẩu tài khoản: <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Key size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Nhập mật khẩu cấp cho thành viên"
                        required
                        className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#c43e1c]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phân quyền truy cập:
                    </label>
                    <select
                      value={formData.permission}
                      onChange={(e) => setFormData({ ...formData, permission: e.target.value as MemberPermission })}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:border-[#c43e1c]"
                    >
                      <option value="editor">Biên tập viên (Xem, soạn thảo, trình chiếu, lưu)</option>
                      <option value="viewer">Người xem (Chỉ xem và trình chiếu bài giảng)</option>
                    </select>
                  </div>
                </div>

                {editingMember && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Trạng thái tài khoản:
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="active"
                          checked={formData.status === 'active'}
                          onChange={() => setFormData({ ...formData, status: 'active' })}
                          className="accent-emerald-600"
                        />
                        <span className="font-semibold text-emerald-700">Đang hoạt động (Cho phép đăng nhập)</span>
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="radio"
                          name="status"
                          value="locked"
                          checked={formData.status === 'locked'}
                          onChange={() => setFormData({ ...formData, status: 'locked' })}
                          className="accent-amber-600"
                        />
                        <span className="font-semibold text-amber-700">Tạm khóa (Chặn đăng nhập)</span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingMember(false);
                      setEditingMember(null);
                    }}
                    className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#c43e1c] hover:bg-[#a83214] text-white rounded-xl text-xs font-bold shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {submitting ? 'Đang lưu...' : editingMember ? 'Lưu cập nhật' : 'Xác nhận cấp tài khoản'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <>
              {/* Search & Filter bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                <div className="relative w-full sm:w-72">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm theo họ tên hoặc SĐT..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-[#c43e1c] focus:bg-white transition"
                  />
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                  <Filter size={14} className="text-slate-400" />
                  <span className="text-slate-500">Lọc quyền:</span>
                  <select
                    value={filterPermission}
                    onChange={(e) => setFilterPermission(e.target.value as any)}
                    className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                  >
                    <option value="all">Tất cả ({members.length})</option>
                    <option value="editor">Biên tập viên</option>
                    <option value="viewer">Chỉ xem</option>
                  </select>
                </div>
              </div>

              {/* Members List Table */}
              {filteredMembers.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                  <Users size={36} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-600">
                    {searchQuery ? 'Không tìm thấy thành viên nào phù hợp' : 'Chưa có thành viên nào được cấp tài khoản'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Hãy bấm nút <strong>"+ Cấp tài khoản Thành viên mới"</strong> ở trên để tạo tài khoản cho thành viên.
                  </p>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                        <th className="py-3 px-4">Thành viên</th>
                        <th className="py-3 px-3">Số điện thoại (Login)</th>
                        <th className="py-3 px-3">Mật khẩu</th>
                        <th className="py-3 px-3">Phân quyền</th>
                        <th className="py-3 px-3">Trạng thái</th>
                        <th className="py-3 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredMembers.map((m) => {
                        const isLocked = m.status === 'locked';
                        const isDeleting = confirmDeleteId === m.id;

                        return (
                          <tr key={m.id} className="hover:bg-slate-50/80 transition">
                            {/* Full Name & Avatar */}
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                                  {m.fullName.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-800">{m.fullName}</div>
                                  <div className="text-[10px] text-slate-400">
                                    Tạo: {new Date(m.createdAt || m.updatedAt).toLocaleDateString('vi-VN')}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Phone */}
                            <td className="py-3 px-3">
                              <span className="font-mono font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                                {m.phone}
                              </span>
                            </td>

                            {/* Password display */}
                            <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {m.password}
                              </span>
                            </td>

                            {/* Permission Badge */}
                            <td className="py-3 px-3">
                              {m.permission === 'editor' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold text-[11px]">
                                  <Shield size={12} /> Biên tập viên
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold text-[11px]">
                                  <Eye size={12} /> Chỉ xem
                                </span>
                              )}
                            </td>

                            {/* Status */}
                            <td className="py-3 px-3">
                              {isLocked ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                                  <Lock size={11} /> Tạm khóa
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                  <CheckCircle2 size={11} /> Hoạt động
                                </span>
                              )}
                            </td>

                            {/* Actions */}
                            <td className="py-3 px-4 text-right">
                              {isDeleting ? (
                                <div className="flex items-center justify-end gap-1.5 animate-in fade-in">
                                  <span className="text-[11px] text-red-600 font-semibold mr-1">Xóa vĩnh viễn?</span>
                                  <button
                                    onClick={() => handleDelete(m)}
                                    className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold cursor-pointer"
                                  >
                                    Xóa
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] cursor-pointer"
                                  >
                                    Hủy
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-end gap-1">
                                  {/* Edit button */}
                                  <button
                                    onClick={() => handleOpenEdit(m)}
                                    title="Chỉnh sửa thông tin & phân quyền thành viên"
                                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                  >
                                    <Edit3 size={15} />
                                  </button>

                                  {/* Lock / Unlock button */}
                                  <button
                                    onClick={() => handleToggleStatus(m)}
                                    title={isLocked ? 'Mở khóa cho thành viên đăng nhập' : 'Tạm khóa tài khoản'}
                                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                                      isLocked 
                                        ? 'text-amber-600 hover:bg-amber-100' 
                                        : 'text-slate-500 hover:text-amber-600 hover:bg-amber-50'
                                    }`}
                                  >
                                    {isLocked ? <Unlock size={15} /> : <Lock size={15} />}
                                  </button>

                                  {/* Delete button */}
                                  <button
                                    onClick={() => setConfirmDeleteId(m.id)}
                                    title="Xóa tài khoản thành viên khỏi hệ thống"
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                  >
                                    <Trash2 size={15} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer info notice */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-[11px] flex items-center justify-between shrink-0">
          <span>
            🔒 <strong>Bảo mật riêng tư:</strong> Các thành viên thông thường không có quyền xem danh sách này. Chỉ Quản trị viên cao nhất mới thấy và quản lý.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
