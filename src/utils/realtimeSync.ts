import { Presentation } from '../types/presentation';

// Real-time BroadcastChannel channel name
const CHANNEL_NAME = 'kho_bai_giang_realtime_sync_v1';

let broadcastChannel: BroadcastChannel | null = null;

try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in current environment', e);
}

export interface RealtimeMessage {
  type: 'SYNC_PRESENTATION' | 'UPDATE_LIBRARY' | 'DELETE_LECTURE';
  payload: any;
  senderId: string;
  timestamp: number;
}

const CLIENT_ID = `client-${Math.random().toString(36).substring(2, 9)}`;

/**
 * Broadcasts presentation changes to all open tabs in real-time
 */
export function broadcastPresentationSync(presentation: Presentation): void {
  if (!broadcastChannel) return;
  try {
    const msg: RealtimeMessage = {
      type: 'SYNC_PRESENTATION',
      payload: presentation,
      senderId: CLIENT_ID,
      timestamp: Date.now()
    };
    broadcastChannel.postMessage(msg);
  } catch (e) {
    console.error('Error broadcasting real-time sync', e);
  }
}

/**
 * Broadcasts saved library updates to all open tabs in real-time
 */
export function broadcastLibrarySync(library: Presentation[]): void {
  if (!broadcastChannel) return;
  try {
    const msg: RealtimeMessage = {
      type: 'UPDATE_LIBRARY',
      payload: library,
      senderId: CLIENT_ID,
      timestamp: Date.now()
    };
    broadcastChannel.postMessage(msg);
  } catch (e) {
    console.error('Error broadcasting library sync', e);
  }
}

/**
 * Subscribes to real-time events from other tabs
 */
export function subscribeToRealtimeSync(
  onPresentationSync: (presentation: Presentation) => void,
  onLibrarySync: (library: Presentation[]) => void
): () => void {
  if (!broadcastChannel) return () => {};

  const handleMessage = (event: MessageEvent<RealtimeMessage>) => {
    if (!event.data || event.data.senderId === CLIENT_ID) return;

    if (event.data.type === 'SYNC_PRESENTATION' && event.data.payload) {
      onPresentationSync(event.data.payload);
    } else if (event.data.type === 'UPDATE_LIBRARY' && event.data.payload) {
      onLibrarySync(event.data.payload);
    }
  };

  broadcastChannel.addEventListener('message', handleMessage);
  return () => {
    broadcastChannel?.removeEventListener('message', handleMessage);
  };
}

/**
 * Format current timestamp in Vietnamese locale
 */
export function getFormattedTimeString(): string {
  const now = new Date();
  return now.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}
