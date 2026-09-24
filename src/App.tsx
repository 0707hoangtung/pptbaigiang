import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Presentation, 
  Slide, 
  SlideElement, 
  ActiveTab, 
  ViewMode, 
  ShapeType, 
  PresentationTheme,
  ElementAnimationType 
} from './types/presentation';
import { DEFAULT_PRESENTATION, PRESENTATION_THEMES, LECTURE_LIBRARY } from './data/defaultLectures';
import { TitleBar } from './components/TitleBar';
import { Ribbon } from './components/Ribbon';
import { SlideSidebar } from './components/SlideSidebar';
import { SlideCanvas } from './components/SlideCanvas';
import { NotesPanel } from './components/NotesPanel';
import { StatusBar } from './components/StatusBar';
import { SlideSorterView } from './components/SlideSorterView';
import { SlideShowModal } from './components/SlideShowModal';
import { LectureRepositoryModal } from './components/LectureRepositoryModal';
import { ImportPowerPointModal } from './components/ImportPowerPointModal';
import { 
  TablePickerModal, 
  ShapePickerModal, 
  ImagePickerModal, 
  SmartArtPickerModal, 
  SymbolPickerModal 
} from './components/InsertDialogs';
import { MathFormulaModal } from './components/MathFormulaModal';
import { MultimediaModal } from './components/MultimediaModal';
import { 
  broadcastPresentationSync, 
  broadcastLibrarySync, 
  subscribeToRealtimeSync, 
  getFormattedTimeString 
} from './utils/realtimeSync';
import {
  savePresentationToCloud,
  setActivePresentationIdInCloud,
  deletePresentationFromCloud,
  canDeletePresentation,
  canEditPresentation,
  subscribeToCloudLibrary,
  subscribeToSinglePresentation,
  subscribeToCloudActiveState,
  fetchPresentationFromCloud,
  fetchActivePresentationFromCloud,
  initCloudRepository,
  restoreDefaultLecturesToCloud,
  CLIENT_ID
} from './services/presentationCloudService';
import { CheckCircle, Info, FileUp, Lock, Copy, Plus } from 'lucide-react';
import { CurrentUser } from './types/auth';
import { getSavedCurrentUser, saveCurrentUser } from './services/authService';
import { AuthModal } from './components/AuthModal';
import { MemberManagementModal } from './components/MemberManagementModal';
import { exportToPowerPoint } from './utils/exportPptx';

export default function App() {
  // Load presentation from localStorage or default
  const [presentation, setPresentation] = useState<Presentation>(() => {
    try {
      const saved = localStorage.getItem('kho_bai_giang_active');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved presentation', e);
    }
    return DEFAULT_PRESENTATION;
  });

  const [savedLibrary, setSavedLibrary] = useState<Presentation[]>(() => {
    try {
      const saved = localStorage.getItem('kho_bai_giang_user_saved');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading user saved library', e);
    }
    return [];
  });

  // Real-time synchronization states
  const [currentTime, setCurrentTime] = useState<string>(() => getFormattedTimeString());
  const [lastSavedTime, setLastSavedTime] = useState<string>(() => getFormattedTimeString());
  const [isRealtimeSyncing, setIsRealtimeSyncing] = useState<boolean>(false);
  const [isRealtimeEnabled, setIsRealtimeEnabled] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(() => typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Cloud synchronization refs to prevent race conditions on initial mount
  const [isCloudHydrated, setIsCloudHydrated] = useState<boolean>(false);
  const isUserModifiedRef = React.useRef<boolean>(false);
  const currentPresentationIdRef = React.useRef<string>(presentation.id);
  currentPresentationIdRef.current = presentation.id;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Network connection monitor for offline/online persistence awareness
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Đã kết nối Internet! Dữ liệu đang đồng bộ với đám mây Firebase.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('Đang chạy ở chế độ ngoại tuyến (Offline). Dữ liệu được bảo toàn trong IndexedDB!');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Live system clock ticker (ticks every second)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getFormattedTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 1. Initial Cloud State Hydration: on startup (phone, incognito tab, or new browser),
  // ensure repository initialization, then pull the latest active presentation directly from Firestore
  useEffect(() => {
    let isMounted = true;
    async function initCloudState() {
      try {
        await initCloudRepository();
        const cloudActive = await fetchActivePresentationFromCloud();
        if (cloudActive && isMounted) {
          currentPresentationIdRef.current = cloudActive.id;
          setPresentation(cloudActive);
          localStorage.setItem('kho_bai_giang_active', JSON.stringify(cloudActive));
        }
      } catch (err) {
        console.warn('Initial cloud hydration check note:', err);
      } finally {
        if (isMounted) {
          setIsCloudHydrated(true);
        }
      }
    }
    initCloudState();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Global Active Presentation sync listener across all devices/tabs
  useEffect(() => {
    const unsubscribeActive = subscribeToCloudActiveState(async (activeId, lastEditor) => {
      // If another device (e.g. phone, other browser, other user) activated or created another presentation
      if (lastEditor !== CLIENT_ID && activeId && activeId !== currentPresentationIdRef.current) {
        const remotePres = await fetchPresentationFromCloud(activeId);
        if (remotePres) {
          currentPresentationIdRef.current = remotePres.id;
          setPresentation(remotePres);
          setActiveSlideIndex(0);
          setSelectedElementId(null);
          localStorage.setItem('kho_bai_giang_active', JSON.stringify(remotePres));
          isUserModifiedRef.current = false;
          showToast(`Đã đồng bộ bài giảng "${remotePres.title}" từ thiết bị khác!`);
        }
      }
    });

    return () => {
      unsubscribeActive();
    };
  }, []);

  // 3. Multi-device Cloud Firestore Library Listener (Real-time single source of truth)
  useEffect(() => {
    const unsubscribeCloudLib = subscribeToCloudLibrary((cloudList) => {
      if (Array.isArray(cloudList)) {
        setSavedLibrary(cloudList);
        localStorage.setItem('kho_bai_giang_user_saved', JSON.stringify(cloudList));
      }
    });

    return () => {
      unsubscribeCloudLib();
    };
  }, []);

  // 4. Multi-device Cloud Firestore Active Presentation Live Content Listener
  useEffect(() => {
    if (!presentation.id) return;

    const unsubscribeSingle = subscribeToSinglePresentation(presentation.id, (cloudP, isLocalChange) => {
      if (!isLocalChange && cloudP && cloudP.id === currentPresentationIdRef.current) {
        setPresentation((current) => {
          // Compare JSON to avoid resetting cursor or unneeded re-render
          if (JSON.stringify(current) !== JSON.stringify(cloudP)) {
            localStorage.setItem('kho_bai_giang_active', JSON.stringify(cloudP));
            return cloudP;
          }
          return current;
        });
      }
    });

    return () => {
      unsubscribeSingle();
    };
  }, [presentation.id]);

  // Multi-tab real-time sync listener via BroadcastChannel
  useEffect(() => {
    const unsubscribe = subscribeToRealtimeSync(
      (syncedPresentation) => {
        setPresentation((curr) => {
          if (curr.id === syncedPresentation.id) {
            return syncedPresentation;
          }
          return curr;
        });
      },
      (syncedLibrary) => {
        setSavedLibrary(syncedLibrary);
      }
    );
    return () => unsubscribe();
  }, []);

  // History for Undo / Redo
  const [history, setHistory] = useState<Presentation[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Active UI states
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  // Default to 'insert' tab to match user screenshot!
  const [activeTab, setActiveTab] = useState<ActiveTab>('insert');
  const [viewMode, setViewMode] = useState<ViewMode>('normal');
  // Default zoom 67% matching user screenshot!
  const [zoomLevel, setZoomLevel] = useState<number>(67);
  const [isNotesOpen, setIsNotesOpen] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isExportingPPTX, setIsExportingPPTX] = useState<boolean>(false);

  // Dialog states
  const [isRepositoryOpen, setIsRepositoryOpen] = useState<boolean>(false);
  const [isImportPptxOpen, setIsImportPptxOpen] = useState<boolean>(false);
  const [pptxInitialFile, setPptxInitialFile] = useState<File | null>(null);
  const [isGlobalDraggingPptx, setIsGlobalDraggingPptx] = useState<boolean>(false);
  const [isTablePickerOpen, setIsTablePickerOpen] = useState<boolean>(false);
  const [isShapePickerOpen, setIsShapePickerOpen] = useState<boolean>(false);
  const [isImagePickerOpen, setIsImagePickerOpen] = useState<boolean>(false);
  const [isSmartArtPickerOpen, setIsSmartArtPickerOpen] = useState<boolean>(false);
  const [isSymbolPickerOpen, setIsSymbolPickerOpen] = useState<boolean>(false);
  const [isMathModalOpen, setIsMathModalOpen] = useState<boolean>(false);
  const [mathModalInitialFormula, setMathModalInitialFormula] = useState<string>('x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
  const [isMultimediaOpen, setIsMultimediaOpen] = useState<boolean>(false);
  const [multimediaInitialTab, setMultimediaInitialTab] = useState<'video-file' | 'video-online' | 'audio' | 'link'>('video-online');

  // User Authentication & Roles state
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(() => getSavedCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'change_admin_pw'>('login');
  const [isMemberManagementOpen, setIsMemberManagementOpen] = useState<boolean>(false);

  // Permissions & Editability computation for current presentation & current user
  const isReadOnly = useMemo(() => {
    const check = canEditPresentation(presentation, currentUser);
    return !check.allowed;
  }, [presentation, currentUser]);

  const checkEditPermission = useCallback((): boolean => {
    // 1. Phải đăng nhập tài khoản trước
    if (!currentUser) {
      showToast('⚠️ Vui lòng đăng nhập tài khoản để thực hiện thao tác này!');
      handleOpenAuthModal();
      return false;
    }

    // 2. Kiểm tra quyền của người dùng đối với bài giảng hiện tại
    const check = canEditPresentation(presentation, currentUser);
    if (!check.allowed) {
      showToast(`⛔ ${check.reason || 'Bạn chỉ có quyền xem và trình chiếu bài giảng này, không được chỉnh sửa hoặc xóa slide!'}`);
      return false;
    }
    return true;
  }, [currentUser, presentation]);

  const checkSlideShowPermission = useCallback((): boolean => {
    if (!currentUser) {
      showToast('🔒 Vui lòng đăng nhập tài khoản để sử dụng tính năng trình chiếu bài giảng!');
      handleOpenAuthModal();
      return false;
    }
    return true;
  }, [currentUser]);

  const handleStartSlideShow = useCallback((fromIndex?: number) => {
    if (!checkSlideShowPermission()) return;
    if (typeof fromIndex === 'number') {
      setActiveSlideIndex(fromIndex);
    }
    setViewMode('slideshow');
  }, [checkSlideShowPermission]);

  // Guard against unauthenticated users in slideshow mode
  useEffect(() => {
    if (!currentUser && viewMode === 'slideshow') {
      setViewMode('normal');
      showToast('🔒 Vui lòng đăng nhập tài khoản để sử dụng tính năng trình chiếu bài giảng!');
      handleOpenAuthModal();
    }
  }, [currentUser, viewMode]);

  const handleOpenAuthModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleOpenChangeAdminPassword = () => {
    setAuthModalMode('change_admin_pw');
    setIsAuthModalOpen(true);
  };

  const handleLogout = () => {
    saveCurrentUser(null);
    setCurrentUser(null);
    showToast('Đã đăng xuất tài khoản an toàn.');
  };

  // Global Drag-and-drop listener for PowerPoint files (.pptx, .ppt)
  useEffect(() => {
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer && Array.from(e.dataTransfer.types).includes('Files')) {
        setIsGlobalDraggingPptx(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      if (!e.relatedTarget) {
        setIsGlobalDraggingPptx(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      setIsGlobalDraggingPptx(false);
      const file = e.dataTransfer?.files?.[0];
      if (file && (file.name.toLowerCase().endsWith('.pptx') || file.name.toLowerCase().endsWith('.ppt'))) {
        setPptxInitialFile(file);
        setIsImportPptxOpen(true);
      }
    };

    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  // Record history when presentation changes
  const updatePresentationWithHistory = useCallback((updater: (prev: Presentation) => Presentation) => {
    if (!checkEditPermission()) return;
    isUserModifiedRef.current = true;
    setPresentation((prev) => {
      const next = updater(prev);
      setHistory(h => [...h.slice(0, historyIndex + 1), prev]);
      setHistoryIndex(i => i + 1);
      setIsSaved(false);
      return next;
    });
  }, [historyIndex, checkEditPermission]);

  // Real-time debounced auto-save & cloud synchronization engine
  useEffect(() => {
    if (!isRealtimeEnabled) return;
    if (!isCloudHydrated) return; // Prevent overwriting cloud data during initial hydration
    if (!isUserModifiedRef.current) return; // Only sync to cloud if local changes were made
    if (isReadOnly) return; // BẢO VỆ TUYỆT ĐỐI: Không bao giờ tự động lưu nếu bài giảng đang ở chế độ Chỉ xem!

    setIsRealtimeSyncing(true);
    const timer = setTimeout(() => {
      try {
        // 1. Save active presentation to localStorage (instant zero-delay local fallback)
        localStorage.setItem('kho_bai_giang_active', JSON.stringify(presentation));

        // 2. Persist to Cloud Firestore (offline IndexedDB persistent cache + multi-device cloud sync)
        savePresentationToCloud(presentation, currentUser).catch((err) => {
          console.warn('Auto-save queued in persistent cache:', err);
        });
        setActivePresentationIdInCloud(presentation.id).catch((err) => {
          console.warn('Active state save note:', err);
        });

        // 3. Synchronize in real-time to user saved library if this lecture was saved
        setSavedLibrary((prevLib) => {
          const index = prevLib.findIndex(p => p.id === presentation.id);
          if (index !== -1) {
            const updated = [...prevLib];
            updated[index] = { 
              ...presentation, 
              updatedAt: new Date().toISOString()
            };
            localStorage.setItem('kho_bai_giang_user_saved', JSON.stringify(updated));
            broadcastLibrarySync(updated);
            return updated;
          }
          return prevLib;
        });

        // 4. Broadcast real-time change to other open browser tabs
        broadcastPresentationSync(presentation);

        setLastSavedTime(getFormattedTimeString());
        setIsSaved(true);
        isUserModifiedRef.current = false;
      } catch (e) {
        console.error('Real-time sync error', e);
      } finally {
        setIsRealtimeSyncing(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [presentation, isRealtimeEnabled, isCloudHydrated, isReadOnly, currentUser]);

  // Current slide
  const currentSlide = presentation.slides[activeSlideIndex] || presentation.slides[0];
  const currentTheme = PRESENTATION_THEMES.find(t => t.id === presentation.themeId) || PRESENTATION_THEMES[0];
  const selectedElement = currentSlide?.elements.find(el => el.id === selectedElementId) || null;
  const hasCameo = currentSlide?.elements.some(el => el.type === 'cameo') || false;

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex >= 0) {
      isUserModifiedRef.current = true;
      const prevPresentation = history[historyIndex];
      setHistoryIndex(i => i - 1);
      setPresentation(prevPresentation);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      isUserModifiedRef.current = true;
      const nextPresentation = history[historyIndex + 1];
      setHistoryIndex(i => i + 1);
      setPresentation(nextPresentation);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'F5') {
        e.preventDefault();
        handleStartSlideShow(0);
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleManualSave();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElementId) {
          e.preventDefault();
          handleDeleteElement();
        }
      } else if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        if (activeSlideIndex < presentation.slides.length - 1) {
          e.preventDefault();
          setActiveSlideIndex(i => i + 1);
          setSelectedElementId(null);
        }
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        if (activeSlideIndex > 0) {
          e.preventDefault();
          setActiveSlideIndex(i => i - 1);
          setSelectedElementId(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeSlideIndex, presentation.slides.length, selectedElementId, historyIndex, history, handleStartSlideShow]);

  // Global Paste listener for pasting image into Text Box (Hộp chữ) or slide canvas
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      // If typing in input, ignore
      if (target && target.tagName === 'INPUT') return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.indexOf('image') !== -1) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            if (!checkEditPermission()) return;

            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              if (!dataUrl) return;

              const currentSlide = presentation.slides[activeSlideIndex];
              const currentEl = currentSlide?.elements.find(el => el.id === selectedElementId);

              if (currentEl && currentEl.type === 'text') {
                handleUpdateElement({
                  imageUrl: dataUrl,
                  imagePosition: (currentEl as any).imagePosition || 'top',
                  height: Math.max(currentEl.height, 35)
                } as any);
                showToast('📷 Đã dán ảnh vào Hộp chữ thành công!');
              } else {
                handleInsertImage(dataUrl);
                showToast('📷 Đã dán ảnh mới vào trang chiếu!');
              }
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [presentation.slides, activeSlideIndex, selectedElementId, checkEditPermission]);

  // Slide CRUD Actions
  const handleAddSlide = (layout: string = 'title-content') => {
    if (!checkEditPermission()) return;
    const newSlideId = `slide-${Date.now()}`;
    let newElements: SlideElement[] = [];

    if (layout === 'title') {
      newElements = [
        {
          id: `el-${Date.now()}-t`,
          type: 'text',
          text: 'TIÊU ĐỀ BÀI GIẢNG',
          fontSize: 42,
          fontFamily: 'Segoe UI',
          color: '#ffffff',
          fontWeight: '700',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center',
          x: 10,
          y: 30,
          width: 80,
          height: 25,
          zIndex: 1
        },
        {
          id: `el-${Date.now()}-sub`,
          type: 'text',
          text: 'Nhập phụ đề hoặc tên giáo viên tại đây',
          fontSize: 20,
          fontFamily: 'Segoe UI',
          color: '#93c5fd',
          fontWeight: 'normal',
          fontStyle: 'italic',
          textDecoration: 'none',
          textAlign: 'center',
          x: 20,
          y: 58,
          width: 60,
          height: 10,
          zIndex: 2
        }
      ];
    } else if (layout === 'title-content') {
      newElements = [
        {
          id: `el-${Date.now()}-hdr`,
          type: 'text',
          text: 'TIÊU ĐỀ NỘI DUNG TRANG',
          fontSize: 32,
          fontFamily: 'Segoe UI',
          color: '#fbbf24',
          fontWeight: '700',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          x: 8,
          y: 8,
          width: 84,
          height: 12,
          zIndex: 1
        },
        {
          id: `el-${Date.now()}-body`,
          type: 'text',
          text: '• Ý chính thứ nhất của bài giảng\n• Ý chính thứ hai kèm ví dụ minh họa\n• Các lưu ý quan trọng cần ghi nhớ',
          fontSize: 22,
          fontFamily: 'Segoe UI',
          color: '#ffffff',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          backgroundColor: 'rgba(255,255,255,0.08)',
          borderRadius: 8,
          padding: 16,
          x: 8,
          y: 24,
          width: 84,
          height: 60,
          zIndex: 2
        }
      ];
    } else if (layout === 'two-column') {
      newElements = [
        {
          id: `el-${Date.now()}-hdr`,
          type: 'text',
          text: 'SO SÁNH HAI KHÁI NIỆM',
          fontSize: 30,
          fontFamily: 'Segoe UI',
          color: '#ffffff',
          fontWeight: '700',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          x: 8,
          y: 8,
          width: 84,
          height: 10,
          zIndex: 1
        },
        {
          id: `el-${Date.now()}-col1`,
          type: 'text',
          text: '1. Khái niệm A:\n- Đặc điểm nổi bật\n- Ưu điểm\n- Ứng dụng',
          fontSize: 18,
          fontFamily: 'Segoe UI',
          color: '#ffffff',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: 14,
          x: 8,
          y: 22,
          width: 40,
          height: 64,
          zIndex: 2
        },
        {
          id: `el-${Date.now()}-col2`,
          type: 'text',
          text: '2. Khái niệm B:\n- Đặc điểm đối chiếu\n- Nhược điểm\n- Khác biệt cốt lõi',
          fontSize: 18,
          fontFamily: 'Segoe UI',
          color: '#ffffff',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: 8,
          padding: 14,
          x: 52,
          y: 22,
          width: 40,
          height: 64,
          zIndex: 3
        }
      ];
    }

    const newSlide: Slide = {
      id: newSlideId,
      title: `Trang chiếu ${presentation.slides.length + 1}`,
      notes: '',
      backgroundColor: currentTheme.slideBg,
      elements: newElements,
      transition: 'fade'
    };

    updatePresentationWithHistory(prev => ({
      ...prev,
      slides: [...prev.slides, newSlide]
    }));
    setActiveSlideIndex(presentation.slides.length);
    setSelectedElementId(null);
  };

  const handleDuplicateSlide = (index: number) => {
    if (!checkEditPermission()) return;
    const slideToCopy = presentation.slides[index];
    const newSlide: Slide = {
      ...slideToCopy,
      id: `slide-${Date.now()}`,
      title: `${slideToCopy.title} (Bản sao)`,
      elements: slideToCopy.elements.map(el => ({ ...el, id: `el-${Date.now()}-${Math.random()}` }))
    };

    const newSlides = [...presentation.slides];
    newSlides.splice(index + 1, 0, newSlide);

    updatePresentationWithHistory(prev => ({
      ...prev,
      slides: newSlides
    }));
    setActiveSlideIndex(index + 1);
  };

  const handleDeleteSlide = (index: number) => {
    if (!checkEditPermission()) return;
    if (presentation.slides.length <= 1) {
      showToast('Bài giảng phải có ít nhất 1 trang chiếu.');
      return;
    }
    const newSlides = presentation.slides.filter((_, i) => i !== index);
    const nextIndex = Math.min(index, newSlides.length - 1);

    updatePresentationWithHistory(prev => ({
      ...prev,
      slides: newSlides
    }));
    setActiveSlideIndex(nextIndex);
    setSelectedElementId(null);
    showToast('Đã xóa trang chiếu thành công.');
  };

  const handleMoveSlide = (fromIndex: number, toIndex: number) => {
    if (!checkEditPermission()) return;
    const newSlides = [...presentation.slides];
    const [moved] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, moved);

    updatePresentationWithHistory(prev => ({
      ...prev,
      slides: newSlides
    }));
    setActiveSlideIndex(toIndex);
  };

  // Element CRUD Actions
  const handleUpdateElement = (updated: Partial<SlideElement>) => {
    if (!checkEditPermission()) return;
    if (!selectedElementId) return;

    updatePresentationWithHistory(prev => {
      const slides = [...prev.slides];
      const slide = { ...slides[activeSlideIndex] };
      slide.elements = slide.elements.map(el => {
        if (el.id === selectedElementId) {
          return { ...el, ...updated } as SlideElement;
        }
        return el;
      });
      slides[activeSlideIndex] = slide;
      return { ...prev, slides };
    });
  };

  const handleDeleteElement = () => {
    if (!checkEditPermission()) return;
    if (!selectedElementId) return;

    updatePresentationWithHistory(prev => {
      const slides = [...prev.slides];
      const slide = { ...slides[activeSlideIndex] };
      slide.elements = slide.elements.filter(el => el.id !== selectedElementId);
      slides[activeSlideIndex] = slide;
      return { ...prev, slides };
    });
    setSelectedElementId(null);
  };

  const handleDuplicateElement = () => {
    if (!checkEditPermission()) return;
    if (!selectedElement) return;

    const newElement: SlideElement = {
      ...selectedElement,
      id: `el-${Date.now()}`,
      x: Math.min(85, selectedElement.x + 4),
      y: Math.min(85, selectedElement.y + 4),
      zIndex: (selectedElement.zIndex || 1) + 1
    };

    updatePresentationWithHistory(prev => {
      const slides = [...prev.slides];
      const slide = { ...slides[activeSlideIndex] };
      slide.elements = [...slide.elements, newElement];
      slides[activeSlideIndex] = slide;
      return { ...prev, slides };
    });
    setSelectedElementId(newElement.id);
  };

  const handleBringForward = () => {
    if (!selectedElementId) return;
    handleUpdateElement({ zIndex: (selectedElement?.zIndex || 1) + 1 });
  };

  const handleSendBackward = () => {
    if (!selectedElementId) return;
    handleUpdateElement({ zIndex: Math.max(1, (selectedElement?.zIndex || 1) - 1) });
  };

  // Element Animation Handlers
  const [previewAnimationElementId, setPreviewAnimationElementId] = useState<string | null>(null);

  const handlePreviewAnimation = (elementId?: string) => {
    const targetId = elementId || selectedElementId || 'ALL';
    setPreviewAnimationElementId(targetId);
    setTimeout(() => {
      setPreviewAnimationElementId(null);
    }, 900);
  };

  const handleApplyToAllAnimations = (anim: ElementAnimationType) => {
    updatePresentationWithHistory(prev => {
      const slides = [...prev.slides];
      const curSlide = slides[activeSlideIndex];
      if (!curSlide) return prev;

      // Sort elements from top to bottom (Y position) so animations play in natural reading order
      const sortedElements = [...curSlide.elements].sort((a, b) => a.y - b.y);
      const orderMap = new Map<string, number>();
      sortedElements.forEach((el, index) => {
        orderMap.set(el.id, index + 1);
      });

      const updatedElements = curSlide.elements.map(el => ({
        ...el,
        animation: anim,
        animationOrder: orderMap.get(el.id) || 1
      }));

      slides[activeSlideIndex] = { ...curSlide, elements: updatedElements };
      return { ...prev, slides };
    });

    handlePreviewAnimation('ALL');
    showToast(`Đã gán hiệu ứng "${anim.toUpperCase()}" cho tất cả khối trong slide!`);
  };

  const handleClearAllAnimations = () => {
    updatePresentationWithHistory(prev => {
      const slides = [...prev.slides];
      const curSlide = slides[activeSlideIndex];
      if (!curSlide) return prev;

      const updatedElements = curSlide.elements.map(el => ({
        ...el,
        animation: 'none' as ElementAnimationType,
        animationOrder: undefined
      }));

      slides[activeSlideIndex] = { ...curSlide, elements: updatedElements };
      return { ...prev, slides };
    });
    showToast('Đã xóa tất cả hiệu ứng của các khối trong slide này!');
  };

  const handleMoveAnimationOrder = (elementId: string, direction: 'earlier' | 'later') => {
    updatePresentationWithHistory(prev => {
      const slides = [...prev.slides];
      const curSlide = slides[activeSlideIndex];
      if (!curSlide) return prev;

      const animated = curSlide.elements
        .filter(el => el.animation && el.animation !== 'none')
        .sort((a, b) => (a.animationOrder ?? 999) - (b.animationOrder ?? 999));

      const idx = animated.findIndex(el => el.id === elementId);
      if (idx === -1) return prev;

      const targetIdx = direction === 'earlier' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= animated.length) return prev;

      const elA = animated[idx];
      const elB = animated[targetIdx];

      const orderA = idx + 1;
      const orderB = targetIdx + 1;

      const updatedElements = curSlide.elements.map(el => {
        if (el.id === elA.id) return { ...el, animationOrder: orderB };
        if (el.id === elB.id) return { ...el, animationOrder: orderA };
        return el;
      });

      slides[activeSlideIndex] = { ...curSlide, elements: updatedElements };
      return { ...prev, slides };
    });
  };

  // Insert Helpers
  const addElementToCurrentSlide = (newElement: SlideElement) => {
    if (!checkEditPermission()) return;
    updatePresentationWithHistory(prev => {
      const slides = [...prev.slides];
      const slide = { ...slides[activeSlideIndex] };
      slide.elements = [...slide.elements, newElement];
      slides[activeSlideIndex] = slide;
      return { ...prev, slides };
    });
    setSelectedElementId(newElement.id);
  };

  const handleAddTextBox = () => {
    const textEl: SlideElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'Nhập nội dung văn bản tại đây...',
      fontSize: 22,
      fontFamily: 'Segoe UI',
      color: '#ffffff',
      fontWeight: 'normal',
      fontStyle: 'normal',
      textDecoration: 'none',
      textAlign: 'left',
      x: 30,
      y: 40,
      width: 40,
      height: 18,
      zIndex: 10
    };
    addElementToCurrentSlide(textEl);
  };

  const handleAddWordArt = () => {
    const waEl: SlideElement = {
      id: `wa-${Date.now()}`,
      type: 'wordart',
      text: 'TIÊU ĐỀ NGHỆ THUẬT',
      stylePreset: 'golden',
      fontSize: 38,
      x: 20,
      y: 38,
      width: 60,
      height: 20,
      zIndex: 10
    };
    addElementToCurrentSlide(waEl);
  };

  const handleInsertTable = (rows: number, cols: number) => {
    const tableData: string[][] = [];
    const headerRow: string[] = [];
    for (let c = 0; c < cols; c++) {
      headerRow.push(`Cột ${c + 1}`);
    }
    tableData.push(headerRow);

    for (let r = 1; r < rows; r++) {
      const row: string[] = [];
      for (let c = 0; c < cols; c++) {
        row.push(`Ô (${r}, ${c + 1})`);
      }
      tableData.push(row);
    }

    const tblEl: SlideElement = {
      id: `table-${Date.now()}`,
      type: 'table',
      rows,
      cols,
      data: tableData,
      headerBgColor: '#0284c7',
      headerTextColor: '#ffffff',
      rowAltColor: 'rgba(255, 255, 255, 0.08)',
      borderColor: '#38bdf8',
      fontSize: 16,
      x: 15,
      y: 25,
      width: 70,
      height: 50,
      zIndex: 10
    };
    addElementToCurrentSlide(tblEl);
  };

  const handleInsertShape = (shapeType: ShapeType) => {
    const shapeEl: SlideElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType,
      fillColor: '#0284c7',
      strokeColor: '#38bdf8',
      strokeWidth: 2,
      text: shapeType === 'speech-bubble' ? 'Lời thoại...' : '',
      textColor: '#ffffff',
      fontSize: 16,
      x: 35,
      y: 35,
      width: 30,
      height: 25,
      zIndex: 10
    };
    addElementToCurrentSlide(shapeEl);
  };

  const handleInsertImage = (src: string) => {
    const imgEl: SlideElement = {
      id: `img-${Date.now()}`,
      type: 'image',
      src,
      alt: 'Hình ảnh học liệu',
      objectFit: 'cover',
      borderRadius: 8,
      x: 25,
      y: 22,
      width: 50,
      height: 56,
      zIndex: 10
    };
    addElementToCurrentSlide(imgEl);
  };

  const handleInsertSmartArt = (type: 'cards' | 'process') => {
    const smEl: SlideElement = {
      id: `smartart-${Date.now()}`,
      type: 'smartart',
      smartArtType: type,
      items: type === 'cards' ? [
        { id: '1', title: 'Ý chính 1', desc: 'Mô tả chi tiết nội dung 1', color: '#0284c7' },
        { id: '2', title: 'Ý chính 2', desc: 'Mô tả chi tiết nội dung 2', color: '#0d9488' },
        { id: '3', title: 'Ý chính 3', desc: 'Mô tả chi tiết nội dung 3', color: '#d97706' }
      ] : [
        { id: '1', title: 'Bước 1', desc: 'Khởi động', color: '#6366f1' },
        { id: '2', title: 'Bước 2', desc: 'Hình thành kiến thức', color: '#0d9488' },
        { id: '3', title: 'Bước 3', desc: 'Luyện tập', color: '#eab308' },
        { id: '4', title: 'Bước 4', desc: 'Vận dụng', color: '#16a34a' }
      ],
      x: 10,
      y: 26,
      width: 80,
      height: 48,
      zIndex: 10
    };
    addElementToCurrentSlide(smEl);
  };

  const handleInsertChart = () => {
    const chartEl: SlideElement = {
      id: `chart-${Date.now()}`,
      type: 'chart',
      chartType: 'bar',
      title: 'Biểu đồ số liệu khảo sát',
      data: [
        { label: 'Nhóm A', value: 35, color: '#38bdf8' },
        { label: 'Nhóm B', value: 58, color: '#fb923c' },
        { label: 'Nhóm C', value: 82, color: '#34d399' },
        { label: 'Nhóm D', value: 44, color: '#f43f5e' }
      ],
      x: 15,
      y: 22,
      width: 70,
      height: 58,
      zIndex: 10
    };
    addElementToCurrentSlide(chartEl);
  };

  const handleInsertSymbol = (symbol: string) => {
    if (selectedElement && selectedElement.type === 'text') {
      handleUpdateElement({ text: `${selectedElement.text} ${symbol}` });
    } else {
      const symEl: SlideElement = {
        id: `sym-${Date.now()}`,
        type: 'text',
        text: symbol,
        fontSize: 44,
        fontFamily: 'Segoe UI',
        color: '#fbbf24',
        fontWeight: 'bold',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'center',
        x: 45,
        y: 40,
        width: 15,
        height: 18,
        zIndex: 10
      };
      addElementToCurrentSlide(symEl);
    }
  };

  const handleToggleCameo = () => {
    if (hasCameo) {
      updatePresentationWithHistory(prev => {
        const slides = [...prev.slides];
        const slide = { ...slides[activeSlideIndex] };
        slide.elements = slide.elements.filter(el => el.type !== 'cameo');
        slides[activeSlideIndex] = slide;
        return { ...prev, slides };
      });
    } else {
      const cameoEl: SlideElement = {
        id: `cameo-${Date.now()}`,
        type: 'cameo',
        shape: 'circle',
        showMirror: true,
        x: 76,
        y: 62,
        width: 20,
        height: 32,
        zIndex: 50
      };
      addElementToCurrentSlide(cameoEl);
    }
  };

  const handleAddComment = () => {
    const commentEl: SlideElement = {
      id: `comment-${Date.now()}`,
      type: 'shape',
      shapeType: 'speech-bubble',
      fillColor: '#0f766e',
      strokeColor: '#5eead4',
      strokeWidth: 2,
      text: '💬 Nhận xét: Các em chú ý ghi lại phần này vào vở ghi bài!',
      textColor: '#ffffff',
      fontSize: 16,
      x: 25,
      y: 65,
      width: 50,
      height: 22,
      zIndex: 40
    };
    addElementToCurrentSlide(commentEl);
  };

  const handleOpenMultimedia = (tab: 'video-file' | 'video-online' | 'audio' | 'link' = 'video-online') => {
    setMultimediaInitialTab(tab);
    setIsMultimediaOpen(true);
  };

  const handleInsertVideoElement = (videoData: {
    url: string;
    title: string;
    sourceType: 'file' | 'youtube' | 'facebook' | 'url';
  }) => {
    const videoEl: SlideElement = {
      id: `video-${Date.now()}`,
      type: 'video',
      url: videoData.url,
      title: videoData.title,
      sourceType: videoData.sourceType,
      x: 20,
      y: 18,
      width: 60,
      height: 64,
      zIndex: 10
    };
    addElementToCurrentSlide(videoEl);
    showToast(`Đã chèn video "${videoData.title}" vào bài giảng.`);
  };

  const handleInsertAudioElement = (audioData: {
    url: string;
    title: string;
    sourceType: 'file' | 'url';
  }) => {
    const audioEl: SlideElement = {
      id: `audio-${Date.now()}`,
      type: 'audio',
      url: audioData.url,
      title: audioData.title,
      sourceType: audioData.sourceType,
      x: 25,
      y: 40,
      width: 50,
      height: 18,
      zIndex: 10
    };
    addElementToCurrentSlide(audioEl);
    showToast(`Đã chèn âm thanh "${audioData.title}" vào bài giảng.`);
  };

  const handleInsertLinkElement = (linkData: {
    url: string;
    title: string;
    description?: string;
  }) => {
    const linkEl: SlideElement = {
      id: `link-${Date.now()}`,
      type: 'link',
      url: linkData.url,
      title: linkData.title,
      description: linkData.description,
      x: 25,
      y: 40,
      width: 50,
      height: 18,
      zIndex: 10
    };
    addElementToCurrentSlide(linkEl);
    showToast(`Đã chèn liên kết "${linkData.title}" vào bài giảng.`);
  };

  const handleAddVideo = () => {
    handleOpenMultimedia('video-online');
  };

  const handleAddAudio = () => {
    handleOpenMultimedia('audio');
  };

  // Math Formula (LaTeX) Handlers
  const handleOpenMathModal = (formula?: string) => {
    if (formula) {
      setMathModalInitialFormula(formula);
    } else if (selectedElement && selectedElement.type === 'text') {
      const match = selectedElement.text.match(/\$\$[\s\S]+?\$\$|\$[^\$]+?\$/);
      if (match) {
        setMathModalInitialFormula(match[0]);
      } else {
        setMathModalInitialFormula('v');
      }
    } else {
      setMathModalInitialFormula('x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}');
    }
    setIsMathModalOpen(true);
  };

  const handleInsertMathFormula = (formula: string) => {
    const isInline = formula.startsWith('$') && !formula.startsWith('$$');

    if (selectedElement && selectedElement.type === 'text') {
      const existing = selectedElement.text;

      if (existing === 'BẤM ĐỂ NHẬP TIÊU ĐỀ BÀI HỌC' || existing === 'Bấm để thêm văn bản') {
        handleUpdateElement({ text: formula });
      } else if (existing.trim()) {
        // Inline math ($...$) stays on the same line with space; block math ($$...$$) separates with newline
        const separator = isInline ? ' ' : '\n';
        handleUpdateElement({ text: `${existing.trim()}${separator}${formula} ` });
      } else {
        handleUpdateElement({ text: formula });
      }
      showToast(isInline ? 'Đã chèn công thức cùng dòng (không nhảy dòng).' : 'Đã chèn khối công thức LaTeX.');
    } else {
      // Create new clean formula block
      const mathEl: SlideElement = {
        id: `math-${Date.now()}`,
        type: 'text',
        text: formula,
        fontSize: isInline ? 28 : 30,
        fontFamily: 'Segoe UI',
        color: '#ffffff',
        fontWeight: 'normal',
        fontStyle: 'normal',
        textDecoration: 'none',
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: 12,
        padding: 16,
        x: 20,
        y: 38,
        width: 60,
        height: 22,
        zIndex: 10
      };
      addElementToCurrentSlide(mathEl);
      showToast(isInline ? 'Đã chèn công thức cùng dòng.' : 'Đã chèn khối công thức LaTeX.');
    }
  };

  // Presentation Management & Library Persistence
  const handleSaveCurrentToLibrary = (asNewCopy: boolean = false) => {
    try {
      // 1. Phải đăng nhập
      if (!currentUser) {
        showToast('⚠️ Vui lòng đăng nhập tài khoản để lưu bài giảng lên hệ thống!');
        handleOpenAuthModal();
        return;
      }

      // 2. Nếu là thành viên nhưng không sở hữu bài giảng này và chưa chọn lưu bản sao, tự động chuyển sang lưu bản sao
      const editCheck = canEditPresentation(presentation, currentUser);
      if (!editCheck.allowed && !asNewCopy) {
        showToast('ℹ️ Bài giảng này của Quản trị viên/người khác. Hệ thống đã lưu thành bản sao mới do bạn làm chủ!');
        handleSaveCurrentToLibrary(true);
        return;
      }

      let lectureToSave: Presentation = {
        ...presentation,
        updatedAt: new Date().toISOString()
      };

      // Set or inherit creator credentials
      if (currentUser.role === 'super_admin') {
        if (!lectureToSave.createdBy || asNewCopy) {
          lectureToSave.createdBy = 'super_admin';
          lectureToSave.creatorRole = 'super_admin';
          lectureToSave.creatorName = currentUser.fullName || 'Quản trị viên';
        }
      } else if (currentUser.role === 'member') {
        if (!lectureToSave.createdBy || asNewCopy) {
          lectureToSave.createdBy = currentUser.memberId || currentUser.phone || 'member';
          lectureToSave.creatorPhone = currentUser.phone;
          lectureToSave.creatorName = currentUser.fullName;
          lectureToSave.creatorRole = 'member';
          lectureToSave.author = currentUser.fullName;
        }
      }

      if (asNewCopy) {
        lectureToSave = {
          ...lectureToSave,
          id: `lec-user-${Date.now()}`,
          title: `${lectureToSave.title} (Bản sao mới)`
        };
        setPresentation(lectureToSave);
      }

      // 1. Add / Update in user saved library (at beginning of list)
      setSavedLibrary(prev => {
        const filtered = prev.filter(s => s.id !== lectureToSave.id);
        const updated = [lectureToSave, ...filtered];
        localStorage.setItem('kho_bai_giang_user_saved', JSON.stringify(updated));
        broadcastLibrarySync(updated);
        return updated;
      });

      // 2. Save active scratchpad locally and to Cloud Firestore
      currentPresentationIdRef.current = lectureToSave.id;
      isUserModifiedRef.current = false;
      localStorage.setItem('kho_bai_giang_active', JSON.stringify(lectureToSave));
      savePresentationToCloud(lectureToSave, currentUser).catch((err) => {
        console.warn('Saved to persistent cache (pending cloud upload):', err);
      });
      setActivePresentationIdInCloud(lectureToSave.id).catch(console.warn);

      setIsSaved(true);
      setLastSavedTime(getFormattedTimeString());
      showToast(`Đã lưu bài giảng "${lectureToSave.title}" đồng bộ thời gian thực trên mọi thiết bị!`);
    } catch (e) {
      console.error('Save error', e);
      showToast('Có lỗi xảy ra khi lưu bài giảng vào Kho');
    }
  };

  const handleManualSave = () => {
    handleSaveCurrentToLibrary(false);
  };

  const handleUpdatePresentationInLibrary = (updated: Presentation) => {
    // 1. Update in saved library
    const exists = savedLibrary.some(s => s.id === updated.id);
    let updatedLib: Presentation[];
    if (exists) {
      updatedLib = savedLibrary.map(s => s.id === updated.id ? updated : s);
    } else {
      updatedLib = [updated, ...savedLibrary];
    }
    setSavedLibrary(updatedLib);
    localStorage.setItem('kho_bai_giang_user_saved', JSON.stringify(updatedLib));
    broadcastLibrarySync(updatedLib);

    // 2. Persist to Cloud Firestore
    savePresentationToCloud(updated, currentUser).catch(console.warn);

    // 3. If currently editing this presentation, update active presentation as well!
    if (presentation.id === updated.id) {
      setPresentation(updated);
      localStorage.setItem('kho_bai_giang_active', JSON.stringify(updated));
    }

    showToast(`Đã lưu cập nhật cho bài giảng "${updated.title}"!`);
  };

  const handleDuplicatePresentation = (target: Presentation) => {
    if (!currentUser) {
      showToast('⚠️ Vui lòng đăng nhập tài khoản để tạo bản sao bài giảng!');
      handleOpenAuthModal();
      return;
    }

    let creatorProps: Partial<Presentation> = {};
    if (currentUser.role === 'super_admin') {
      creatorProps = {
        createdBy: 'super_admin',
        creatorRole: 'super_admin',
        creatorName: currentUser.fullName || 'Quản trị viên'
      };
    } else if (currentUser.role === 'member') {
      creatorProps = {
        createdBy: currentUser.memberId || currentUser.phone || 'member',
        creatorPhone: currentUser.phone,
        creatorName: currentUser.fullName,
        creatorRole: 'member',
        author: currentUser.fullName
      };
    }

    const cloned: Presentation = {
      ...target,
      id: `lec-user-${Date.now()}`,
      title: `${target.title} (Bản sao)`,
      updatedAt: new Date().toISOString(),
      ...creatorProps
    };
    const updatedLib = [cloned, ...savedLibrary];
    setSavedLibrary(updatedLib);
    localStorage.setItem('kho_bai_giang_user_saved', JSON.stringify(updatedLib));
    broadcastLibrarySync(updatedLib);
    savePresentationToCloud(cloned, currentUser).catch(console.warn);
    showToast(`Đã nhân bản bài giảng "${cloned.title}" vào Kho bài giảng đám mây!`);
  };

  const handleDeleteSavedPresentation = async (id: string) => {
    const target = savedLibrary.find(s => s.id === id);
    if (!target) return;

    // Check data security authorization: Super Admin can delete anything; Members can only delete their own
    const check = canDeletePresentation(target, currentUser);
    if (!check.allowed) {
      showToast(`⛔ ${check.reason || 'Bạn không có quyền xóa bài giảng của người khác!'}`);
      return;
    }

    // 1. Delete permanently from Cloud Firestore (never resurrects on any device/tab)
    try {
      const res = await deletePresentationFromCloud(id, currentUser);
      if (!res.success) {
        showToast(`❌ ${res.message || 'Lỗi khi xóa bài giảng khỏi đám mây'}`);
        return;
      }
    } catch (err: any) {
      console.error('Error deleting presentation from cloud:', err);
      showToast(`❌ ${err?.message || 'Lỗi khi xóa bài giảng'}`);
      return;
    }

    // 2. Remove from local savedLibrary
    const updatedLib = savedLibrary.filter(s => s.id !== id);
    setSavedLibrary(updatedLib);
    localStorage.setItem('kho_bai_giang_user_saved', JSON.stringify(updatedLib));
    broadcastLibrarySync(updatedLib);

    // 3. If active presentation is the one deleted, safely fallback to next available
    if (presentation.id === id) {
      const fallback = updatedLib[0] || DEFAULT_PRESENTATION;
      setPresentation(fallback);
      currentPresentationIdRef.current = fallback.id;
      setActiveSlideIndex(0);
      setSelectedElementId(null);
      setActivePresentationIdInCloud(fallback.id).catch(console.warn);
      localStorage.setItem('kho_bai_giang_active', JSON.stringify(fallback));
    }

    showToast(`Đã xóa bài giảng "${target?.title || ''}" khỏi hệ thống thành công.`);
  };

  const handleRestoreDefaultSamples = async () => {
    if (currentUser?.role !== 'super_admin') {
      showToast('⛔ Chỉ Quản trị viên mới có quyền khôi phục bài giảng mẫu hệ thống.');
      return;
    }
    try {
      await restoreDefaultLecturesToCloud();
      showToast('Đã khôi phục các bài mẫu GDPT vào Kho bài giảng đám mây!');
    } catch (err) {
      console.error('Error restoring default samples:', err);
      showToast('Lỗi khi khôi phục bài mẫu GDPT.');
    }
  };

  const handleNewPresentation = () => {
    if (!currentUser) {
      showToast('⚠️ Vui lòng đăng nhập tài khoản để soạn bài giảng mới!');
      handleOpenAuthModal();
      return;
    }

    let creatorProps: Partial<Presentation> = {};
    if (currentUser.role === 'super_admin') {
      creatorProps = {
        createdBy: 'super_admin',
        creatorRole: 'super_admin',
        creatorName: currentUser.fullName || 'Quản trị viên'
      };
    } else if (currentUser.role === 'member') {
      creatorProps = {
        createdBy: currentUser.memberId || currentUser.phone || 'member',
        creatorPhone: currentUser.phone,
        creatorName: currentUser.fullName,
        creatorRole: 'member',
        author: currentUser.fullName
      };
    }

    const blankPresentation: Presentation = {
      id: `lec-user-${Date.now()}`,
      title: 'Bài Giảng Mới Chưa Đặt Tên',
      subject: 'Môn học',
      grade: 'Khối lớp',
      author: currentUser.fullName || 'Giáo viên',
      updatedAt: new Date().toISOString(),
      aspectRatio: '16:9',
      themeId: 'ocean-blue',
      ...creatorProps,
      slides: [
        {
          id: `slide-${Date.now()}`,
          title: 'Trang Tiêu Đề',
          notes: '',
          backgroundColor: '#1e5385',
          elements: [
            {
              id: `el-title-${Date.now()}`,
              type: 'text',
              text: 'BẤM ĐỂ NHẬP TIÊU ĐỀ BÀI HỌC',
              fontSize: 44,
              fontFamily: 'Segoe UI',
              color: '#ffffff',
              fontWeight: '700',
              fontStyle: 'normal',
              textDecoration: 'none',
              textAlign: 'center',
              x: 10,
              y: 35,
              width: 80,
              height: 25,
              zIndex: 1
            }
          ]
        }
      ]
    };
    setPresentation(blankPresentation);
    currentPresentationIdRef.current = blankPresentation.id;
    isUserModifiedRef.current = false;
    setActiveSlideIndex(0);
    setSelectedElementId(null);
    savePresentationToCloud(blankPresentation, currentUser).catch(console.warn);
    setActivePresentationIdInCloud(blankPresentation.id).catch(console.warn);
    setIsRepositoryOpen(false);
    showToast('✨ Đã tạo bài giảng mới! Bạn có thể thoải mái soạn và lưu lên hệ thống.');
  };

  const handleExportPPTX = async () => {
    if (isExportingPPTX) return;
    setIsExportingPPTX(true);
    showToast('⏳ Đang tạo và đóng gói tệp PowerPoint (.pptx)...');
    try {
      await exportToPowerPoint(presentation);
      showToast(`🎉 Đã xuất thành công bài giảng sang file PowerPoint (.pptx)!`);
    } catch (err) {
      console.error('Lỗi khi xuất file PowerPoint:', err);
      showToast('❌ Có lỗi xảy ra khi tạo tệp PowerPoint. Vui lòng kiểm tra lại!');
    } finally {
      setIsExportingPPTX(false);
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(presentation, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${presentation.title.replace(/\s+/g, '_')}.pptx-json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser) {
      showToast('⚠️ Vui lòng đăng nhập tài khoản để nhập tệp bài giảng vào hệ thống!');
      handleOpenAuthModal();
      return;
    }
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (imported.slides && Array.isArray(imported.slides)) {
            let creatorProps: Partial<Presentation> = {};
            if (currentUser.role === 'super_admin') {
              creatorProps = {
                createdBy: 'super_admin',
                creatorRole: 'super_admin',
                creatorName: currentUser.fullName || 'Quản trị viên'
              };
            } else if (currentUser.role === 'member') {
              creatorProps = {
                createdBy: currentUser.memberId || currentUser.phone || 'member',
                creatorPhone: currentUser.phone,
                creatorName: currentUser.fullName,
                creatorRole: 'member',
                author: currentUser.fullName
              };
            }

            const presentationWithOwnership: Presentation = {
              ...imported,
              ...creatorProps
            };

            setPresentation(presentationWithOwnership);
            currentPresentationIdRef.current = presentationWithOwnership.id;
            isUserModifiedRef.current = false;
            setActiveSlideIndex(0);
            setSelectedElementId(null);
            savePresentationToCloud(presentationWithOwnership, currentUser).catch(console.warn);
            setActivePresentationIdInCloud(presentationWithOwnership.id).catch(console.warn);
            setIsRepositoryOpen(false);
            showToast(`Đã tải bài giảng "${presentationWithOwnership.title}" thành công!`);
          }
        } catch (err) {
          showToast('Tệp không đúng định dạng bài giảng.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePrintSlides = () => {
    window.print();
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // PowerPoint Import Handlers
  const handleOpenPptxForEdit = (importedPresentation: Presentation) => {
    if (!currentUser) {
      showToast('⚠️ Vui lòng đăng nhập tài khoản để chỉnh sửa bài giảng PowerPoint!');
      handleOpenAuthModal();
      return;
    }

    let creatorProps: Partial<Presentation> = {};
    if (currentUser.role === 'super_admin') {
      creatorProps = {
        createdBy: 'super_admin',
        creatorRole: 'super_admin',
        creatorName: currentUser.fullName || 'Quản trị viên'
      };
    } else if (currentUser.role === 'member') {
      creatorProps = {
        createdBy: currentUser.memberId || currentUser.phone || 'member',
        creatorPhone: currentUser.phone,
        creatorName: currentUser.fullName,
        creatorRole: 'member',
        author: currentUser.fullName
      };
    }

    const pptxDoc: Presentation = {
      ...importedPresentation,
      ...creatorProps
    };

    setPresentation(pptxDoc);
    currentPresentationIdRef.current = pptxDoc.id;
    isUserModifiedRef.current = false;
    setActiveSlideIndex(0);
    setSelectedElementId(null);
    setViewMode('normal');
    setIsImportPptxOpen(false);
    setPptxInitialFile(null);
    savePresentationToCloud(pptxDoc, currentUser).catch(console.warn);
    setActivePresentationIdInCloud(pptxDoc.id).catch(console.warn);
    showToast(`Đã mở bài giảng PowerPoint "${pptxDoc.title}" (${pptxDoc.slides.length} trang) để chỉnh sửa!`);
  };

  const handleOpenPptxForSlideShow = (importedPresentation: Presentation) => {
    if (!checkSlideShowPermission()) return;
    let creatorProps: Partial<Presentation> = {};
    if (currentUser?.role === 'super_admin') {
      creatorProps = {
        createdBy: 'super_admin',
        creatorRole: 'super_admin',
        creatorName: currentUser.fullName || 'Quản trị viên'
      };
    } else if (currentUser?.role === 'member') {
      creatorProps = {
        createdBy: currentUser.memberId || currentUser.phone || 'member',
        creatorPhone: currentUser.phone,
        creatorName: currentUser.fullName,
        creatorRole: 'member',
        author: currentUser.fullName
      };
    }

    const pptxDoc: Presentation = {
      ...importedPresentation,
      ...creatorProps
    };

    setPresentation(pptxDoc);
    currentPresentationIdRef.current = pptxDoc.id;
    isUserModifiedRef.current = false;
    setActiveSlideIndex(0);
    setSelectedElementId(null);
    setViewMode('slideshow');
    setIsImportPptxOpen(false);
    setPptxInitialFile(null);
    savePresentationToCloud(pptxDoc, currentUser).catch(console.warn);
    setActivePresentationIdInCloud(pptxDoc.id).catch(console.warn);
    showToast(`Đang trình chiếu bài giảng PowerPoint "${pptxDoc.title}"!`);
  };

  const handleSavePptxToLibrary = (importedPresentation: Presentation) => {
    if (!currentUser) {
      showToast('⚠️ Vui lòng đăng nhập tài khoản để lưu bài giảng PowerPoint lên hệ thống!');
      handleOpenAuthModal();
      return;
    }

    let creatorProps: Partial<Presentation> = {};
    if (currentUser.role === 'super_admin') {
      creatorProps = {
        createdBy: 'super_admin',
        creatorRole: 'super_admin',
        creatorName: currentUser.fullName || 'Quản trị viên'
      };
    } else if (currentUser.role === 'member') {
      creatorProps = {
        createdBy: currentUser.memberId || currentUser.phone || 'member',
        creatorPhone: currentUser.phone,
        creatorName: currentUser.fullName,
        creatorRole: 'member',
        author: currentUser.fullName
      };
    }

    const pptxDoc: Presentation = {
      ...importedPresentation,
      ...creatorProps
    };

    setSavedLibrary((prev) => {
      const filtered = prev.filter(p => p.id !== pptxDoc.id);
      const updated = [pptxDoc, ...filtered];
      localStorage.setItem('kho_bai_giang_user_saved', JSON.stringify(updated));
      broadcastLibrarySync(updated);
      return updated;
    });
    savePresentationToCloud(pptxDoc, currentUser).catch(console.warn);
    setIsImportPptxOpen(false);
    setPptxInitialFile(null);
    showToast(`Đã lưu bài giảng "${pptxDoc.title}" vào Kho bài giảng và đồng bộ đám mây!`);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#f0f2f5]">
      {/* 1. Top Title Bar */}
      <TitleBar
        title={presentation.title}
        onUpdateTitle={(title) => updatePresentationWithHistory(prev => ({ ...prev, title }))}
        onSave={handleManualSave}
        isSaved={isSaved}
        isRealtimeSyncing={isRealtimeSyncing}
        isOnline={isOnline}
        lastSavedTime={lastSavedTime}
        currentTime={currentTime}
        isRealtimeEnabled={isRealtimeEnabled}
        onToggleRealtime={() => {
          setIsRealtimeEnabled(prev => !prev);
          showToast(!isRealtimeEnabled ? 'Đã BẬT đồng bộ thời gian thực' : 'Đã TẮT đồng bộ thời gian thực');
        }}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historyIndex >= 0}
        canRedo={historyIndex < history.length - 1}
        onStartSlideShow={() => handleStartSlideShow(0)}
        onOpenRepository={() => setIsRepositoryOpen(true)}
        onOpenImportPptx={() => setIsImportPptxOpen(true)}
        onExportPPTX={handleExportPPTX}
        isExportingPPTX={isExportingPPTX}
        onExportJSON={handleExportJSON}
        onPrintSlides={handlePrintSlides}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
        onOpenMemberManagement={() => setIsMemberManagementOpen(true)}
        onOpenChangeAdminPassword={handleOpenChangeAdminPassword}
        onLogout={handleLogout}
        readOnly={isReadOnly}
      />

      {/* 2. Ribbon Menu Tabs and Toolbars */}
      <Ribbon
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        readOnly={isReadOnly}
        // Home tab
        selectedElement={selectedElement}
        onUpdateElement={handleUpdateElement}
        onDeleteElement={handleDeleteElement}
        onDuplicateElement={handleDuplicateElement}
        onBringForward={handleBringForward}
        onSendBackward={handleSendBackward}
        onAddSlide={handleAddSlide}
        onOpenImportPptx={() => setIsImportPptxOpen(true)}
        onExportPPTX={handleExportPPTX}
        onSave={handleManualSave}
        // Insert tab (matching user screenshot)
        onOpenTablePicker={() => setIsTablePickerOpen(true)}
        onOpenImagePicker={() => setIsImagePickerOpen(true)}
        onAddCameo={handleToggleCameo}
        onOpenShapePicker={() => setIsShapePickerOpen(true)}
        onOpenIconPicker={() => setIsShapePickerOpen(true)}
        onOpenSmartArtPicker={() => setIsSmartArtPickerOpen(true)}
        onOpenChartPicker={handleInsertChart}
        onAddTextBox={handleAddTextBox}
        onAddWordArt={handleAddWordArt}
        onOpenMathFormula={() => handleOpenMathModal()}
        onOpenSymbolPicker={() => setIsSymbolPickerOpen(true)}
        onOpenMultimedia={handleOpenMultimedia}
        onAddVideo={handleAddVideo}
        onAddAudio={handleAddAudio}
        onAddComment={handleAddComment}
        onToggleCameo={handleToggleCameo}
        hasCameo={hasCameo}
        // Design tab
        currentThemeId={presentation.themeId}
        onSelectTheme={(theme) => updatePresentationWithHistory(prev => ({
          ...prev,
          themeId: theme.id,
          slides: prev.slides.map(s => ({ ...s, backgroundColor: theme.slideBg }))
        }))}
        aspectRatio={presentation.aspectRatio}
        onChangeAspectRatio={(aspectRatio) => updatePresentationWithHistory(prev => ({ ...prev, aspectRatio }))}
        currentSlideBg={currentSlide?.backgroundColor}
        onChangeSlideBg={(color) => {
          updatePresentationWithHistory(prev => {
            const slides = [...prev.slides];
            slides[activeSlideIndex] = { ...slides[activeSlideIndex], backgroundColor: color };
            return { ...prev, slides };
          });
        }}
        // Transitions tab
        currentTransition={currentSlide?.transition}
        onChangeTransition={(trans) => {
          updatePresentationWithHistory(prev => {
            const slides = [...prev.slides];
            slides[activeSlideIndex] = { ...slides[activeSlideIndex], transition: trans };
            return { ...prev, slides };
          });
        }}
        onApplyToAllTransitions={() => {
          const trans = currentSlide?.transition || 'fade';
          updatePresentationWithHistory(prev => ({
            ...prev,
            slides: prev.slides.map(s => ({ ...s, transition: trans }))
          }));
          alert(`Đã áp dụng hiệu ứng "${trans.toUpperCase()}" cho tất cả các trang chiếu!`);
        }}
        // Animations tab
        slideElements={currentSlide?.elements || []}
        onApplyToAllAnimations={handleApplyToAllAnimations}
        onClearAllAnimations={handleClearAllAnimations}
        onPreviewAnimation={handlePreviewAnimation}
        onMoveAnimationOrder={handleMoveAnimationOrder}
        // Slide Show tab
        onStartFromBeginning={() => handleStartSlideShow(0)}
        onStartFromCurrent={() => handleStartSlideShow(activeSlideIndex)}
        onPresenterMode={() => handleStartSlideShow(activeSlideIndex)}
        onTriggerConfetti={() => handleStartSlideShow(activeSlideIndex)}
        onOpenRepository={() => setIsRepositoryOpen(true)}
        isLoggedIn={Boolean(currentUser)}
      />

      {/* 3. Main Body View (Normal Editor or Slide Sorter) */}
      <div className="flex-1 flex overflow-hidden relative">
        {viewMode === 'sorter' ? (
          <SlideSorterView
            slides={presentation.slides}
            activeSlideIndex={activeSlideIndex}
            onSelectSlide={(idx) => setActiveSlideIndex(idx)}
            onAddSlide={() => handleAddSlide()}
            onDuplicateSlide={handleDuplicateSlide}
            onDeleteSlide={handleDeleteSlide}
            onCloseSorter={() => setViewMode('normal')}
            defaultSlideBg={currentTheme.slideBg}
            readOnly={isReadOnly}
          />
        ) : (
          <>
            {/* Left Sidebar: Slide Thumbnails */}
            <SlideSidebar
              slides={presentation.slides}
              activeSlideIndex={activeSlideIndex}
              onSelectSlide={(idx) => {
                setActiveSlideIndex(idx);
                setSelectedElementId(null);
              }}
              onAddSlide={() => handleAddSlide()}
              onDuplicateSlide={handleDuplicateSlide}
              onDeleteSlide={handleDeleteSlide}
              onMoveSlide={handleMoveSlide}
              aspectRatio={presentation.aspectRatio}
              defaultSlideBg={currentTheme.slideBg}
              readOnly={isReadOnly}
            />

            {/* Central Work Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Read-Only Informative Notice Banner */}
              {isReadOnly && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between text-xs text-amber-900 shrink-0 select-none shadow-xs">
                  <div className="flex items-center gap-2">
                    <Lock size={15} className="text-amber-700 shrink-0" />
                    <span>
                      {!currentUser ? (
                        <span>
                          <strong>Chế độ khóa an toàn:</strong> Bạn chưa đăng nhập. Mọi chế độ trình chiếu (F5), chỉnh sửa, thêm hoặc xóa slide đều bị khóa. Vui lòng đăng nhập tài khoản để sử dụng!
                        </span>
                      ) : (
                        <span>
                          <strong>Chế độ xem & trình chiếu:</strong> Bài giảng của {presentation.creatorName || presentation.author || 'Quản trị viên / Hệ thống'}. Thành viên chỉ được xem và trình chiếu, không được sửa hoặc xóa slide của bài này.
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {!currentUser ? (
                      <button
                        onClick={handleOpenAuthModal}
                        className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow-xs transition cursor-pointer"
                      >
                        Đăng nhập ngay
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleSaveCurrentToLibrary(true)}
                          className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded shadow-xs transition flex items-center gap-1 cursor-pointer"
                          title="Nhân bản bài này thành bài giảng của bạn để tự do chỉnh sửa"
                        >
                          <Copy size={12} />
                          <span>Tạo bản sao để sửa</span>
                        </button>
                        <button
                          onClick={handleNewPresentation}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold rounded shadow-xs transition flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={12} />
                          <span>Soạn bài mới</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              <SlideCanvas
                slide={currentSlide}
                defaultSlideBg={currentTheme.slideBg}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                onUpdateElement={handleUpdateElement}
                onDeleteElement={handleDeleteElement}
                onDuplicateElement={handleDuplicateElement}
                onBringForward={handleBringForward}
                onSendBackward={handleSendBackward}
                onEditFormula={(currentText) => handleOpenMathModal(currentText)}
                onOpenAnimationsTab={() => setActiveTab('animations')}
                previewAnimationElementId={previewAnimationElementId}
                aspectRatio={presentation.aspectRatio}
                zoomLevel={zoomLevel}
                readOnly={isReadOnly}
              />

              {/* Bottom Speaker Notes Bar */}
              <NotesPanel
                notes={currentSlide?.notes || ''}
                onChangeNotes={(notes) => {
                  updatePresentationWithHistory(prev => {
                    const slides = [...prev.slides];
                    slides[activeSlideIndex] = { ...slides[activeSlideIndex], notes };
                    return { ...prev, slides };
                  });
                }}
                isOpen={isNotesOpen}
                onToggle={() => setIsNotesOpen(!isNotesOpen)}
                readOnly={isReadOnly}
              />
            </div>
          </>
        )}
      </div>

      {/* 4. Bottom Status Bar */}
      <StatusBar
        currentSlideIndex={activeSlideIndex}
        totalSlides={presentation.slides.length}
        isNotesOpen={isNotesOpen}
        onToggleNotes={() => setIsNotesOpen(!isNotesOpen)}
        viewMode={viewMode}
        onChangeViewMode={(mode) => {
          if (mode === 'slideshow') {
            handleStartSlideShow();
          } else {
            setViewMode(mode);
          }
        }}
        zoomLevel={zoomLevel}
        onChangeZoom={setZoomLevel}
        onFitToWindow={() => setZoomLevel(67)}
        currentTime={currentTime}
        lastSavedTime={lastSavedTime}
        isRealtimeSyncing={isRealtimeSyncing}
        isOnline={isOnline}
        isLoggedIn={Boolean(currentUser)}
      />

      {/* 5. Fullscreen Presentation Mode Modal - Locked if not logged in */}
      {currentUser && (
        <SlideShowModal
          isOpen={viewMode === 'slideshow'}
          onClose={() => setViewMode('normal')}
          slides={presentation.slides}
          initialSlideIndex={activeSlideIndex}
          aspectRatio={presentation.aspectRatio}
          defaultSlideBg={currentTheme.slideBg}
        />
      )}

      {/* 6. Kho Bài Giảng (Repository) Modal with Full Edit & Delete Permissions */}
      <LectureRepositoryModal
        isOpen={isRepositoryOpen}
        onClose={() => setIsRepositoryOpen(false)}
        currentPresentation={presentation}
        currentUser={currentUser}
        onLoadPresentation={(p) => {
          setPresentation(p);
          currentPresentationIdRef.current = p.id;
          isUserModifiedRef.current = false;
          setActiveSlideIndex(0);
          setSelectedElementId(null);
          localStorage.setItem('kho_bai_giang_active', JSON.stringify(p));
          setActivePresentationIdInCloud(p.id).catch(console.warn);
          showToast(`Đã mở bài giảng "${p.title}"`);
        }}
        onSaveCurrentToLibrary={() => handleSaveCurrentToLibrary(false)}
        onSaveCurrentAsNewCopy={() => handleSaveCurrentToLibrary(true)}
        onNewPresentation={handleNewPresentation}
        onImportJSON={handleImportJSON}
        onOpenImportPptx={() => {
          setIsRepositoryOpen(false);
          setIsImportPptxOpen(true);
        }}
        savedPresentations={savedLibrary}
        onDeleteSavedPresentation={handleDeleteSavedPresentation}
        onUpdatePresentationInLibrary={handleUpdatePresentationInLibrary}
        onDuplicatePresentation={handleDuplicatePresentation}
        onRestoreDefaultSamples={handleRestoreDefaultSamples}
      />

      {/* 6.5. Nhập bài giảng từ PowerPoint (.pptx, .ppt) Modal */}
      <ImportPowerPointModal
        isOpen={isImportPptxOpen}
        onClose={() => {
          setIsImportPptxOpen(false);
          setPptxInitialFile(null);
        }}
        onOpenForEdit={handleOpenPptxForEdit}
        onOpenForSlideShow={handleOpenPptxForSlideShow}
        onSaveToLibrary={handleSavePptxToLibrary}
        initialFile={pptxInitialFile}
        isLoggedIn={Boolean(currentUser)}
        onRequireLogin={handleOpenAuthModal}
      />

      {/* Global Drag-and-drop Overlay */}
      {isGlobalDraggingPptx && (
        <div className="fixed inset-0 z-[999] bg-[#c43e1c]/80 backdrop-blur-xs flex flex-col items-center justify-center text-white pointer-events-none transition-all">
          <div className="bg-white text-slate-800 p-8 rounded-2xl shadow-2xl border-4 border-dashed border-[#c43e1c] flex flex-col items-center max-w-md text-center">
            <div className="w-20 h-20 rounded-2xl bg-orange-100 flex items-center justify-center mb-4 text-[#c43e1c]">
              <FileUp size={40} className="animate-bounce" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-1">Thả tệp PowerPoint vào đây</h3>
            <p className="text-xs text-slate-500">Hỗ trợ tệp .pptx (chuẩn Office 2007-2024, Google Slides, Canva) để mở, trình chiếu hoặc chỉnh sửa ngay</p>
          </div>
        </div>
      )}

      {/* 7. Dialogs for Insert Ribbon */}
      <TablePickerModal
        isOpen={isTablePickerOpen}
        onClose={() => setIsTablePickerOpen(false)}
        onInsertTable={handleInsertTable}
      />

      <ShapePickerModal
        isOpen={isShapePickerOpen}
        onClose={() => setIsShapePickerOpen(false)}
        onInsertShape={handleInsertShape}
      />

      <ImagePickerModal
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        onInsertImage={handleInsertImage}
      />

      <SmartArtPickerModal
        isOpen={isSmartArtPickerOpen}
        onClose={() => setIsSmartArtPickerOpen(false)}
        onInsertSmartArt={handleInsertSmartArt}
      />

      <SymbolPickerModal
        isOpen={isSymbolPickerOpen}
        onClose={() => setIsSymbolPickerOpen(false)}
        onInsertSymbol={handleInsertSymbol}
      />

      {/* 8. Math Formula (LaTeX) Modal */}
      <MathFormulaModal
        isOpen={isMathModalOpen}
        onClose={() => setIsMathModalOpen(false)}
        onInsertFormula={handleInsertMathFormula}
        initialFormula={mathModalInitialFormula}
      />

      {/* 8.5. Multimedia (Đa phương tiện) Modal */}
      <MultimediaModal
        isOpen={isMultimediaOpen}
        onClose={() => setIsMultimediaOpen(false)}
        initialTab={multimediaInitialTab}
        onInsertVideo={handleInsertVideoElement}
        onInsertAudio={handleInsertAudioElement}
        onInsertLink={handleInsertLinkElement}
      />

      {/* 8.8. Authentication Modal (Login / Change Admin Password) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        initialMode={authModalMode}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Đăng nhập thành công! Chào mừng ${user.fullName} (${user.role === 'super_admin' ? 'Quản trị viên cao nhất' : 'Thành viên'})`);
        }}
      />

      {/* 8.9. Member Management Modal (Super Admin Only) */}
      <MemberManagementModal
        isOpen={isMemberManagementOpen}
        onClose={() => setIsMemberManagementOpen(false)}
        currentUser={currentUser}
      />

      {/* 9. Real-time Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-[100] bg-slate-900/95 text-white border border-slate-700/80 px-4 py-2.5 rounded-lg shadow-2xl flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle size={16} className="text-emerald-400 shrink-0" />
          <span className="font-medium text-slate-100">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
