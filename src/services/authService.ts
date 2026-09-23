import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  Unsubscribe 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Member, CurrentUser, AdminAuthDoc, MemberPermission, AccountStatus } from '../types/auth';

const ADMIN_AUTH_DOC_PATH = 'system/admin_auth';
const MEMBERS_COLLECTION = 'members';
const LOCAL_STORAGE_USER_KEY = 'kho_bai_giang_current_user_v2';
const DEFAULT_INITIAL_ADMIN_PW = 'admin123456';

// Read saved user session from localStorage
export function getSavedCurrentUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// Persist user session
export function saveCurrentUser(user: CurrentUser | null) {
  if (user) {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
  }
}

/**
 * Initialize and get Super Admin password.
 * If not exists in Firestore, initializes with default password.
 */
export async function getOrInitAdminAuth(): Promise<AdminAuthDoc> {
  const adminDocRef = doc(db, 'system', 'admin_auth');
  const snap = await getDoc(adminDocRef);
  
  if (snap.exists()) {
    return snap.data() as AdminAuthDoc;
  }

  // Initial setup with default admin password
  const initialData: AdminAuthDoc = {
    adminPassword: DEFAULT_INITIAL_ADMIN_PW,
    adminName: 'Quản trị viên tối cao',
    adminEmail: '07071987hoangtung@gmail.com',
    updatedAt: new Date().toISOString()
  };

  await setDoc(adminDocRef, initialData, { merge: true });
  return initialData;
}

/**
 * Super Admin Login verification
 */
export async function loginAsSuperAdmin(passwordInput: string): Promise<{ success: boolean; message: string; user?: CurrentUser }> {
  try {
    const adminAuth = await getOrInitAdminAuth();
    if (adminAuth.adminPassword.trim() === passwordInput.trim()) {
      const user: CurrentUser = {
        role: 'super_admin',
        fullName: adminAuth.adminName || 'Quản trị viên tối cao',
        permission: 'editor'
      };
      saveCurrentUser(user);
      return { success: true, message: 'Đăng nhập Quản trị viên cao nhất thành công!', user };
    }
    return { success: false, message: 'Mật khẩu quản trị viên không chính xác. Vui lòng thử lại!' };
  } catch (error) {
    console.error('Super Admin login error:', error);
    return { success: false, message: 'Lỗi kết nối khi xác thực quản trị viên. Vui lòng kiểm tra mạng!' };
  }
}

/**
 * Change Super Admin Password
 */
export async function changeSuperAdminPassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' };
    }

    const adminAuth = await getOrInitAdminAuth();
    if (adminAuth.adminPassword.trim() !== currentPassword.trim()) {
      return { success: false, message: 'Mật khẩu hiện tại không đúng!' };
    }

    const adminDocRef = doc(db, 'system', 'admin_auth');
    await setDoc(adminDocRef, {
      adminPassword: newPassword.trim(),
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return { success: true, message: 'Đổi mật khẩu Quản trị viên thành công!' };
  } catch (error) {
    console.error('Change admin password error:', error);
    return { success: false, message: 'Lỗi khi cập nhật mật khẩu trên đám mây.' };
  }
}

/**
 * Member Login verification (by Phone and Password)
 */
export async function loginAsMember(phoneInput: string, passwordInput: string): Promise<{ success: boolean; message: string; user?: CurrentUser }> {
  try {
    const cleanPhone = phoneInput.trim();
    if (!cleanPhone || !passwordInput) {
      return { success: false, message: 'Vui lòng nhập đầy đủ Số điện thoại và Mật khẩu!' };
    }

    const membersRef = collection(db, MEMBERS_COLLECTION);
    const q = query(membersRef, where('phone', '==', cleanPhone));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: false, message: 'Số điện thoại này chưa được Quản trị viên cấp tài khoản!' };
    }

    const memberData = snapshot.docs[0].data() as Member;

    if (memberData.status === 'locked') {
      return { success: false, message: 'Tài khoản của bạn đang bị TẠM KHÓA. Vui lòng liên hệ Quản trị viên cao nhất để mở lại!' };
    }

    if (memberData.password !== passwordInput.trim()) {
      return { success: false, message: 'Mật khẩu không chính xác. Vui lòng kiểm tra lại!' };
    }

    const user: CurrentUser = {
      role: 'member',
      memberId: memberData.id,
      fullName: memberData.fullName,
      phone: memberData.phone,
      permission: memberData.permission
    };

    saveCurrentUser(user);
    return { success: true, message: `Chào mừng thành viên ${memberData.fullName} đăng nhập thành công!`, user };
  } catch (error) {
    console.error('Member login error:', error);
    try {
      handleFirestoreError(error, OperationType.LIST, MEMBERS_COLLECTION);
    } catch {}
    return { success: false, message: 'Lỗi xác thực thành viên. Vui lòng kiểm tra kết nối mạng!' };
  }
}

/**
 * Member Management for Super Admin
 * CRITICAL: Only Super Admin can call these functions!
 */

export function subscribeToMembers(
  currentUser: CurrentUser | null,
  onUpdate: (members: Member[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  // STRICT SECURITY GUARD: If not Super Admin, return empty listener and NEVER query members!
  if (!currentUser || currentUser.role !== 'super_admin') {
    onUpdate([]);
    return () => {};
  }

  const membersRef = collection(db, MEMBERS_COLLECTION);
  return onSnapshot(
    membersRef,
    (snapshot) => {
      const list: Member[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Member);
      });
      // Sort by creation date descending
      list.sort((a, b) => new Date(b.createdAt || b.updatedAt).getTime() - new Date(a.createdAt || a.updatedAt).getTime());
      onUpdate(list);
    },
    (error) => {
      console.error('Error fetching members:', error);
      if (onError) onError(error);
      try {
        handleFirestoreError(error, OperationType.LIST, MEMBERS_COLLECTION);
      } catch (errInfo) {
        // Detailed error diagnostic logged
      }
    }
  );
}

/**
 * Add a new member (Super Admin only)
 */
export async function createMember(
  currentUser: CurrentUser | null,
  data: {
    fullName: string;
    phone: string;
    password: string;
    permission: MemberPermission;
  }
): Promise<{ success: boolean; message: string; member?: Member }> {
  if (!currentUser || currentUser.role !== 'super_admin') {
    return { success: false, message: 'Chỉ Quản trị viên cao nhất mới có quyền tạo thành viên!' };
  }

  const cleanPhone = data.phone.trim();
  const cleanName = data.fullName.trim();
  const cleanPassword = data.password.trim();

  if (!cleanName || !cleanPhone || !cleanPassword) {
    return { success: false, message: 'Vui lòng điền đầy đủ Họ tên, Số điện thoại và Mật khẩu!' };
  }

  // Check if phone already exists
  const membersRef = collection(db, MEMBERS_COLLECTION);
  const q = query(membersRef, where('phone', '==', cleanPhone));
  let snap;
  try {
    snap = await getDocs(q);
  } catch (qErr) {
    console.error('Query phone error:', qErr);
    try {
      handleFirestoreError(qErr, OperationType.LIST, MEMBERS_COLLECTION);
    } catch {}
    return { success: false, message: 'Lỗi khi kiểm tra số điện thoại trên hệ thống.' };
  }

  if (!snap.empty) {
    return { success: false, message: `Số điện thoại ${cleanPhone} đã được cấp tài khoản trước đó!` };
  }

  const memberId = 'mem_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const newMember: Member = {
    id: memberId,
    fullName: cleanName,
    phone: cleanPhone,
    password: cleanPassword,
    role: 'member',
    permission: data.permission,
    status: 'active',
    createdAt: now,
    updatedAt: now,
    createdBy: currentUser.fullName
  };

  try {
    await setDoc(doc(db, MEMBERS_COLLECTION, memberId), newMember);
    return { success: true, message: `Đã cấp tài khoản thành công cho thành viên: ${cleanName}`, member: newMember };
  } catch (error) {
    console.error('Create member error:', error);
    try {
      handleFirestoreError(error, OperationType.CREATE, `${MEMBERS_COLLECTION}/${memberId}`);
    } catch {}
    return { success: false, message: 'Lỗi khi lưu tài khoản thành viên lên Firestore.' };
  }
}

/**
 * Update member information or permissions (Super Admin only)
 */
export async function updateMember(
  currentUser: CurrentUser | null,
  memberId: string,
  updates: Partial<Pick<Member, 'fullName' | 'phone' | 'password' | 'permission' | 'status'>>
): Promise<{ success: boolean; message: string }> {
  if (!currentUser || currentUser.role !== 'super_admin') {
    return { success: false, message: 'Chỉ Quản trị viên cao nhất mới có quyền chỉnh sửa thành viên!' };
  }

  try {
    const memberDocRef = doc(db, MEMBERS_COLLECTION, memberId);
    await setDoc(memberDocRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    return { success: true, message: 'Đã cập nhật thông tin thành viên thành công!' };
  } catch (error) {
    console.error('Update member error:', error);
    try {
      handleFirestoreError(error, OperationType.UPDATE, `${MEMBERS_COLLECTION}/${memberId}`);
    } catch {}
    return { success: false, message: 'Lỗi khi cập nhật thành viên.' };
  }
}

/**
 * Delete a member permanently (Super Admin only)
 */
export async function deleteMember(
  currentUser: CurrentUser | null,
  memberId: string
): Promise<{ success: boolean; message: string }> {
  if (!currentUser || currentUser.role !== 'super_admin') {
    return { success: false, message: 'Chỉ Quản trị viên cao nhất mới có quyền xóa thành viên!' };
  }

  try {
    await deleteDoc(doc(db, MEMBERS_COLLECTION, memberId));
    return { success: true, message: 'Đã xóa vĩnh viễn tài khoản thành viên khỏi hệ thống!' };
  } catch (error) {
    console.error('Delete member error:', error);
    try {
      handleFirestoreError(error, OperationType.DELETE, `${MEMBERS_COLLECTION}/${memberId}`);
    } catch {}
    return { success: false, message: 'Lỗi khi xóa tài khoản thành viên.' };
  }
}
