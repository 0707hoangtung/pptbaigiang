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
}

/**
 * Converts a Presentation object to a cloud-safe Firestore document
 */
export function presentationToCloudDoc(p: Presentation): CloudPresentationDoc {
  return {
    id: p.id,
    title: p.title || 'Bài giảng không tên',
    aspectRatio: p.aspectRatio || '16:9',
    themeId: p.themeId || 'modern-red',
    author: p.author || 'Giáo viên',
    subject: p.subject || '',
    grade: p.grade || '',
    slidesJson: JSON.stringify(p.slides || []),
    updatedAt: p.updatedAt || new Date().toISOString(),
    createdAt: new Date().toISOString(),
    lastEditorClientId: CLIENT_ID
  };
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
      updatedAt: docData.updatedAt || new Date().toISOString()
    };
  } catch (e) {
    console.error('Error parsing cloud presentation document', e);
    return null;
  }
}

/**
 * Saves a presentation to the shared cloud database (preserves offline & online)
 */
export async function savePresentationToCloud(presentation: Presentation): Promise<void> {
  const docRef = doc(db, 'presentations', presentation.id);
  const data = presentationToCloudDoc(presentation);
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
 * When deleted, it is completely removed and will never resurrect on any device or tab.
 */
export async function deletePresentationFromCloud(presentationId: string): Promise<void> {
  const docRef = doc(db, 'presentations', presentationId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `presentations/${presentationId}`);
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

