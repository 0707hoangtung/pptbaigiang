import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDoc,
  getDocs,
  limit,
  query
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Presentation } from '../types/presentation';
import { CurrentUser } from '../types/auth';
import { DEFAULT_PRESENTATION, LECTURE_LIBRARY } from '../data/defaultLectures';

export const CLIENT_ID = `client_${Math.random().toString(36).substring(2, 9)}`;

export interface CloudPresentationDoc {
  id: string;
  title: string;
  aspectRatio: '16:9' | '4:3';
  themeId: string;
  author: string;
  subject?: string;
  grade?: string;
  slidesJson: string;
  updatedAt: string;
  createdAt: string;
  lastEditorClientId?: string;
  createdBy?: string;
  creatorPhone?: string;
  creatorName?: string;
  creatorRole?: 'super_admin' | 'member' | 'system';
}

/**
 * Checks whether the current user is allowed to delete a presentation.
 * Security & Data Safety Rule:
 * 1. Super Admin ('super_admin') has ALL permissions to delete any presentation or data in the system.
 * 2. Members ('member') CANNOT delete any presentation or data belonging to others (other members or system/admin);
 *    they can ONLY delete their own lectures uploaded/created by themselves.
 * 3. Guest / Viewer accounts cannot delete any presentation.
 */
export function canDeletePresentation(
  presentation: Presentation,
  currentUser?: CurrentUser | null
): { allowed: boolean; reason?: string } {
  // 1. Quản trị viên cao nhất (super_admin): Toàn quyền xóa mọi dữ liệu
  if (currentUser?.role === 'super_admin') {
    return { allowed: true };
  }

  // 2. Chưa đăng nhập
  if (!currentUser) {
    return {
      allowed: false,
      reason: 'Vui lòng đăng nhập tài khoản để thực hiện thao tác xóa bài giảng.'
    };
  }

  // 3. Tài khoản thành viên chỉ xem (viewer)
  if (currentUser.role === 'member' && currentUser.permission === 'viewer') {
    return {
      allowed: false,
      reason: 'Tài khoản của bạn được cấp quyền "Chỉ xem". Bạn không thể xóa bài giảng trên hệ thống!'
    };
  }

  // 4. Thành viên (member): Chỉ được xóa bài do chính mình tạo
  if (currentUser.role === 'member') {
    // Không thể xóa bài giảng mẫu của hệ thống hoặc của Quản trị viên
    const isSystemOrAdmin = 
      presentation.createdBy === 'system' || 
      presentation.createdBy === 'super_admin' || 
      presentation.creatorRole === 'super_admin' || 
      presentation.creatorRole === 'system';

    if (isSystemOrAdmin) {
      return {
        allowed: false,
        reason: 'Bảo vệ an toàn dữ liệu: Bạn không có quyền xóa bài giảng của Quản trị viên hoặc bài mẫu của hệ thống!'
      };
    }

    // Kiểm tra tính sở hữu của thành viên
    const isOwnerById = Boolean(presentation.createdBy && currentUser.memberId && presentation.createdBy === currentUser.memberId);
    const isOwnerByPhone = Boolean(presentation.creatorPhone && currentUser.phone && presentation.creatorPhone === currentUser.phone);
    const isOwnerByName = Boolean(
      currentUser.fullName && 
      ((presentation.creatorName && presentation.creatorName.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase()) ||
       (presentation.author && presentation.author.trim().toLowerCase() === currentUser.fullName.trim().toLowerCase()))
    );

    if (isOwnerById || isOwnerByPhone || isOwnerByName) {
      return { allowed: true };
    }

    const ownerDesc = presentation.creatorName || presentation.author || 'thành viên khác';
    return {
      allowed: false,
      reason: `Bảo vệ an toàn dữ liệu hệ thống: Bạn không có quyền xóa bài giảng của người khác (${ownerDesc}). Bạn chỉ được phép xóa bài giảng do chính mình đưa lên!`
    };
  }

  return {
    allowed: false,
    reason: 'Bạn không có quyền thực hiện thao tác xóa này.'
  };
}

/**
 * Converts a Presentation object to a cloud-safe Firestore document
 */
export function presentationToCloudDoc(p: Presentation, currentUser?: CurrentUser | null): CloudPresentationDoc {
  // Determine creator metadata if not already present
  let createdBy = p.createdBy;
  let creatorPhone = p.creatorPhone;
  let creatorName = p.creatorName;
  let creatorRole = p.creatorRole;

  if (!createdBy && currentUser) {
    if (currentUser.role === 'super_admin') {
      createdBy = 'super_admin';
      creatorRole = 'super_admin';
      creatorName = currentUser.fullName || 'Quản trị viên';
    } else if (currentUser.role === 'member') {
      createdBy = currentUser.memberId || currentUser.phone || 'member';
      creatorRole = 'member';
      creatorPhone = currentUser.phone;
      creatorName = currentUser.fullName;
    }
  } else if (!createdBy) {
    createdBy = 'system';
    creatorRole = 'system';
    creatorName = p.author || 'Hệ thống';
  }

  const docData: CloudPresentationDoc = {
    id: p.id,
    title: p.title || 'Bài giảng không tên',
    aspectRatio: p.aspectRatio || '16:9',
    themeId: p.themeId || 'modern-red',
    author: p.author || (currentUser?.fullName || 'Giáo viên'),
    subject: p.subject || '',
    grade: p.grade || '',
    slidesJson: JSON.stringify(p.slides || []),
    updatedAt: p.updatedAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
    lastEditorClientId: CLIENT_ID,
    createdBy,
    creatorRole,
    creatorName: creatorName || p.author || 'Giáo viên'
  };

  if (creatorPhone) {
    docData.creatorPhone = creatorPhone;
  }

  return docData;
}

/**
 * Converts a Cloud document back into a Presentation object
 */
export function cloudDocToPresentation(docData: any): Presentation | null {
  try {
    if (!docData || !docData.id) return null;
    let slides = [];
    if (typeof docData.slidesJson === 'string') {
      slides = JSON.parse(docData.slidesJson);
    } else if (Array.isArray(docData.slides)) {
      slides = docData.slides;
    }

    return {
      id: docData.id,
      title: docData.title || 'Bài giảng',
      subject: docData.subject || '',
      grade: docData.grade || '',
      author: docData.author || 'Giáo viên',
      aspectRatio: docData.aspectRatio || '16:9',
      themeId: docData.themeId || docData.theme || 'modern-red',
      slides: slides,
      updatedAt: docData.updatedAt || new Date().toISOString(),
      createdBy: docData.createdBy,
      creatorPhone: docData.creatorPhone,
      creatorName: docData.creatorName,
      creatorRole: docData.creatorRole
    };
  } catch (e) {
    console.error('Error parsing cloud presentation document', e);
    return null;
  }
}

/**
 * Saves a presentation to the shared cloud database (preserves offline & online)
 */
export async function savePresentationToCloud(
  presentation: Presentation, 
  currentUser?: CurrentUser | null
): Promise<void> {
  const docRef = doc(db, 'presentations', presentation.id);
  const data = presentationToCloudDoc(presentation, currentUser);
  try {
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `presentations/${presentation.id}`);
  }
}

/**
 * Saves the global active presentation ID to system state
 */
export async function setActivePresentationIdInCloud(presentationId: string): Promise<void> {
  const docRef = doc(db, 'system', 'state');
  try {
    await setDoc(docRef, {
      activePresentationId: presentationId,
      updatedAt: new Date().toISOString(),
      lastEditorClientId: CLIENT_ID
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'system/state');
  }
}

/**
 * Deletes a presentation permanently from Cloud Firestore.
 * Enforces ownership permission check before deletion.
 */
export async function deletePresentationFromCloud(
  presentationId: string,
  currentUser?: CurrentUser | null
): Promise<{ success: boolean; message?: string }> {
  const docRef = doc(db, 'presentations', presentationId);
  try {
    // If currentUser is specified, verify ownership authorization
    if (currentUser) {
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const pres = cloudDocToPresentation(snap.data());
        if (pres) {
          const authCheck = canDeletePresentation(pres, currentUser);
          if (!authCheck.allowed) {
            return {
              success: false,
              message: authCheck.reason || 'Bạn không có quyền xóa bài giảng của người khác!'
            };
          }
        }
      }
    }

    await deleteDoc(docRef);
    return { success: true };
  } catch (error: any) {
    handleFirestoreError(error, OperationType.DELETE, `presentations/${presentationId}`);
    return { success: false, message: error?.message || 'Lỗi khi xóa bài giảng' };
  }
}

/**
 * Ensures the Cloud repository is initialized once with default lectures.
 * Once initialized, Firestore is the sole single-source-of-truth.
 */
export async function initCloudRepository(): Promise<void> {
  try {
    const stateDocRef = doc(db, 'system', 'state');
    const stateSnap = await getDoc(stateDocRef);

    if (stateSnap.exists() && stateSnap.data()?.initialized) {
      // Cloud database is already initialized
      return;
    }

    // Check if there are already any presentations in the collection
    const presColl = collection(db, 'presentations');
    const existingSnap = await getDocs(query(presColl, limit(1)));

    if (existingSnap.empty) {
      // Seed default lectures into Firestore
      for (const sample of LECTURE_LIBRARY) {
        await savePresentationToCloud(sample);
      }
    }

    await setDoc(stateDocRef, {
      activePresentationId: DEFAULT_PRESENTATION.id,
      initialized: true,
      updatedAt: new Date().toISOString(),
      lastEditorClientId: CLIENT_ID
    }, { merge: true });
  } catch (error) {
    console.warn('initCloudRepository note:', error);
  }
}

/**
 * Explicitly restores default sample lectures into Cloud Firestore
 */
export async function restoreDefaultLecturesToCloud(): Promise<void> {
  for (const sample of LECTURE_LIBRARY) {
    await savePresentationToCloud(sample);
  }
  await setActivePresentationIdInCloud(DEFAULT_PRESENTATION.id);
}

/**
 * Listens to the entire library of presentations in real-time.
 * Synchronizes unified presentations across any device, anywhere (incognito, mobile, desktop).
 */
export function subscribeToCloudLibrary(
  onLibraryUpdate: (presentations: Presentation[]) => void
): () => void {
  const collRef = collection(db, 'presentations');

  const unsubscribe = onSnapshot(
    collRef,
    (snapshot) => {
      const list: Presentation[] = [];
      snapshot.forEach((docSnap) => {
        const item = cloudDocToPresentation(docSnap.data());
        if (item) list.push(item);
      });

      // Sort by updatedAt descending (newest first)
      list.sort((a, b) => {
        const timeA = new Date(a.updatedAt || 0).getTime();
        const timeB = new Date(b.updatedAt || 0).getTime();
        return timeB - timeA;
      });

      onLibraryUpdate(list);
    },
    (error) => {
      console.warn('Realtime cloud library listener error:', error.message);
    }
  );

  return unsubscribe;
}

/**
 * Listens to global system state (which presentation is currently active)
 */
export function subscribeToCloudActiveState(
  onActiveStateUpdate: (activeId: string, lastEditorClientId?: string) => void
): () => void {
  const docRef = doc(db, 'system', 'state');

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data?.activePresentationId) {
          onActiveStateUpdate(data.activePresentationId, data.lastEditorClientId);
        }
      }
    },
    (error) => {
      console.warn('Realtime cloud active state listener error:', error.message);
    }
  );

  return unsubscribe;
}

/**
 * Subscribes to real-time updates for a single presentation by ID
 */
export function subscribeToSinglePresentation(
  presentationId: string,
  onUpdate: (presentation: Presentation, isLocalChange: boolean) => void
): () => void {
  const docRef = doc(db, 'presentations', presentationId);

  const unsubscribe = onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const p = cloudDocToPresentation(data);
        if (p) {
          const isLocal = data.lastEditorClientId === CLIENT_ID;
          onUpdate(p, isLocal);
        }
      }
    },
    (error) => {
      console.warn(`Realtime presentation listener error for ${presentationId}:`, error.message);
    }
  );

  return unsubscribe;
}

/**
 * Fetches a single presentation directly from Firestore
 */
export async function fetchPresentationFromCloud(presentationId: string): Promise<Presentation | null> {
  try {
    const docRef = doc(db, 'presentations', presentationId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return cloudDocToPresentation(snap.data());
    }
    return null;
  } catch (error) {
    console.warn(`Error fetching presentation ${presentationId} from cloud:`, error);
    return null;
  }
}

/**
 * Fetches the currently active presentation from cloud system state
 */
export async function fetchActivePresentationFromCloud(): Promise<Presentation | null> {
  try {
    const stateDocRef = doc(db, 'system', 'state');
    const stateSnap = await getDoc(stateDocRef);
    if (stateSnap.exists()) {
      const activeId = stateSnap.data()?.activePresentationId;
      if (activeId && activeId !== 'test-123') {
        return await fetchPresentationFromCloud(activeId);
      }
    }
    return null;
  } catch (error) {
    console.warn('Error fetching active presentation from cloud state:', error);
    return null;
  }
}

