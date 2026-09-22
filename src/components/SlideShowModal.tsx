import React, { useState, useEffect, useRef } from 'react';
import { Slide, SlideElement } from '../types/presentation';
import { SlideElementRenderer } from './SlideElementRenderer';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  PenTool, 
  Eraser, 
  Sparkles, 
  Clock, 
  FileText, 
  Maximize2, 
  Minimize2, 
  Radio,
  Tv,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SlideShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  slides: Slide[];
  initialSlideIndex: number;
  aspectRatio: '16:9' | '4:3';
  defaultSlideBg: string;
}

export const SlideShowModal: React.FC<SlideShowModalProps> = ({
  isOpen,
  onClose,
  slides,
  initialSlideIndex,
  aspectRatio,
  defaultSlideBg
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlideIndex);
  const [revealedStep, setRevealedStep] = useState(0);
  const [isLaserPointer, setIsLaserPointer] = useState(false);
  const [laserPos, setLaserPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPenActive, setIsPenActive] = useState(false);
  const [penColor, setPenColor] = useState<string>('#ef4444');
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [lessonSeconds, setLessonSeconds] = useState(0);
  const [currentTime, setCurrentTime] = useState(() => new Date().toLocaleTimeString('vi-VN'));
  const [isBlackScreen, setIsBlackScreen] = useState(false);

  const canvasDrawRef = useRef<HTMLCanvasElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const currentSlide = slides[currentIndex];
  const slideBg = currentSlide?.backgroundColor || defaultSlideBg;

  // Sorted animated elements for the current slide
  const animatedElements = (currentSlide?.elements || [])
    .filter(el => el.animation && el.animation !== 'none')
    .sort((a, b) => (a.animationOrder ?? 999) - (b.animationOrder ?? 999));

  useEffect(() => {
    setCurrentIndex(initialSlideIndex);
    setRevealedStep(0);
  }, [initialSlideIndex]);

  // Reset revealedStep whenever slide changes
  useEffect(() => {
    setRevealedStep(0);
  }, [currentIndex]);

  // Lesson timer and real-time clock
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setLessonSeconds(prev => prev + 1);
      setCurrentTime(new Date().toLocaleTimeString('vi-VN'));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  const goToNextSlide = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setRevealedStep(0);
      clearDrawings();
    }
  };

  const goToPrevSlide = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      const prevAnimatedCount = (slides[prevIdx]?.elements || [])
        .filter(el => el.animation && el.animation !== 'none').length;
      setCurrentIndex(prevIdx);
      setRevealedStep(prevAnimatedCount);
      clearDrawings();
    }
  };

  const handleNext = () => {
    if (revealedStep < animatedElements.length) {
      setRevealedStep(prev => prev + 1);
    } else {
      goToNextSlide();
    }
  };

  const handlePrev = () => {
    if (revealedStep > 0) {
      setRevealedStep(prev => prev - 1);
    } else {
      goToPrevSlide();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') {
        e.preventDefault();
        handlePrev();
      } else if (e.key.toLowerCase() === 'b') {
        setIsBlackScreen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, slides.length, revealedStep, animatedElements.length]);

  if (!isOpen) return null;

  const clearDrawings = () => {
    const canvas = canvasDrawRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleTriggerConfetti = () => {
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  // Drawing Canvas logic
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPenActive) return;
    const canvas = canvasDrawRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    isDrawingRef.current = true;
    lastPointRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const drawMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // update laser pointer position if laser active
    if (isLaserPointer) {
      setLaserPos({ x: e.clientX, y: e.clientY });
    }

    if (!isPenActive || !isDrawingRef.current) return;
    const canvas = canvasDrawRef.current;
    if (!canvas || !lastPointRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(currentX, currentY);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastPointRef.current = { x: currentX, y: currentY };
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  };

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center select-none overflow-hidden"
      onMouseMove={(e) => {
        if (isLaserPointer) setLaserPos({ x: e.clientX, y: e.clientY });
      }}
    >
      {/* Black screen cover mode */}
      {isBlackScreen && (
        <div 
          onClick={() => setIsBlackScreen(false)}
          className="absolute inset-0 bg-black z-40 flex items-center justify-center text-slate-600 text-xs cursor-pointer"
        >
          Nhấn phím 'B' hoặc nhấp chuột để tiếp tục bài giảng
        </div>
      )}

      {/* Slide Presentation Screen */}
      <div
        className={`relative shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer ${
          aspectRatio === '16:9' ? 'w-full max-w-[96vw] max-h-[92vh] aspect-video' : 'w-full max-w-[85vw] max-h-[92vh] aspect-4/3'
        }`}
        style={{
          background: currentSlide?.backgroundGradient || slideBg
        }}
        onClick={() => {
          if (!isPenActive) {
            handleNext();
          }
        }}
      >
        {/* Render elements in presenter mode with PowerPoint Animation sequence */}
        {currentSlide?.elements.map((element) => {
          const animIndex = animatedElements.findIndex(e => e.id === element.id);
          const hasAnimation = animIndex !== -1;
          const isRevealed = !hasAnimation || animIndex < revealedStep;
          const isCurrentStep = hasAnimation && animIndex === revealedStep - 1;

          let animClass = '';
          if (hasAnimation) {
            if (!isRevealed) {
              animClass = 'opacity-0 pointer-events-none';
            } else if (isCurrentStep) {
              animClass = element.animation === 'appear'
                ? 'animate-ppt-appear'
                : element.animation === 'fade-in'
                ? 'animate-ppt-fade-in'
                : element.animation === 'fly-in'
                ? 'animate-ppt-fly-in'
                : element.animation === 'zoom-in'
                ? 'animate-ppt-zoom-in'
                : '';
            } else {
              animClass = 'opacity-100';
            }
          }

          return (
            <div
              key={element.id}
              className={`absolute transition-none ${animClass}`}
              style={{
                left: `${element.x}%`,
                top: `${element.y}%`,
                width: `${element.width}%`,
                height: `${element.height}%`,
                zIndex: element.zIndex || 1
              }}
            >
              <SlideElementRenderer
                element={element}
                isSelected={false}
                isPresenterMode={true}
              />
            </div>
          );
        })}

        {/* Real-time Drawing Canvas layer */}
        <canvas
          ref={canvasDrawRef}
          width={1920}
          height={1080}
          onMouseDown={startDrawing}
          onMouseMove={drawMove}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          className={`absolute inset-0 w-full h-full z-30 ${
            isPenActive ? 'cursor-crosshair pointer-events-auto' : 'pointer-events-none'
          }`}
        />

        {/* Laser Pointer Red Glowing Dot */}
        {isLaserPointer && (
          <div
            className="fixed pointer-events-none z-50 -translate-x-1/2 -translate-y-1/2"
            style={{ left: laserPos.x, top: laserPos.y }}
          >
            <div className="w-5 h-5 rounded-full bg-red-500 shadow-[0_0_15px_6px_rgba(239,68,68,0.9)] animate-pulse border border-white"></div>
          </div>
        )}
      </div>

      {/* Floating Presenter Notes Box */}
      {isNotesOpen && (
        <div className="absolute top-4 right-4 w-96 bg-slate-900/90 backdrop-blur-md border border-white/20 rounded-xl p-4 text-white z-50 shadow-2xl animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-white/20 mb-2">
            <span className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
              <FileText size={14} />
              <span>Ghi chú diễn giả (Slide {currentIndex + 1})</span>
            </span>
            <button onClick={() => setIsNotesOpen(false)} className="text-slate-400 hover:text-white">
              <X size={14} />
            </button>
          </div>
          <p className="text-xs leading-relaxed text-slate-200 whitespace-pre-line max-h-48 overflow-y-auto">
            {currentSlide?.notes || 'Không có ghi chú nào cho trang này.'}
          </p>
        </div>
      )}

      {/* Presenter Bottom Control Bar */}
      <div 
        className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-950/85 backdrop-blur-md border border-white/20 rounded-full px-4 py-1.5 flex items-center space-x-3 text-white text-xs z-50 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Slide / Step */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0 && revealedStep === 0}
          className="p-1 rounded-full hover:bg-white/20 disabled:opacity-30 transition"
          title="Lùi bước / Trang trước (Mũi tên trái / Backspace)"
        >
          <ChevronLeft size={18} />
        </button>

        {/* Slide Counter Indicator */}
        <span className="font-bold tracking-wider text-[11px] px-2 py-0.5 bg-white/10 rounded-full">
          {currentIndex + 1} / {slides.length}
        </span>

        {/* Next Slide / Step */}
        <button
          onClick={handleNext}
          disabled={currentIndex === slides.length - 1 && revealedStep >= animatedElements.length}
          className="p-1 rounded-full hover:bg-white/20 disabled:opacity-30 transition"
          title="Tiếp tục: Chạy hiệu ứng / Sang trang (Mũi tên phải / Space / Click)"
        >
          <ChevronRight size={18} />
        </button>

        {/* Animated Elements Step Indicator */}
        {animatedElements.length > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/20 border border-amber-400/40 rounded-full text-amber-300 text-[11px] font-semibold">
            <Zap size={12} className="text-amber-400 fill-amber-400" />
            <span>Hiệu ứng: {revealedStep}/{animatedElements.length}</span>
            {revealedStep < animatedElements.length && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setRevealedStep(animatedElements.length);
                }}
                className="ml-1 text-[10px] text-amber-200 hover:text-white underline cursor-pointer"
                title="Bỏ qua hiệu ứng và hiện toàn bộ nội dung slide ngay"
              >
                Hiện tất
              </button>
            )}
          </div>
        )}

        <div className="h-4 w-px bg-white/20"></div>

        {/* Laser Pointer Toggle */}
        <button
          onClick={() => {
            setIsLaserPointer(!isLaserPointer);
            if (!isLaserPointer) setIsPenActive(false);
          }}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ${
            isLaserPointer ? 'bg-red-600 text-white shadow-lg' : 'hover:bg-white/20 text-slate-300'
          }`}
          title="Bật/tắt con trỏ laser chỉ bài"
        >
          <Radio size={13} className="text-red-400" />
          <span>Laser</span>
        </button>

        {/* Pen Annotation Tool */}
        <button
          onClick={() => {
            setIsPenActive(!isPenActive);
            if (!isPenActive) setIsLaserPointer(false);
          }}
          className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition ${
            isPenActive ? 'bg-blue-600 text-white' : 'hover:bg-white/20 text-slate-300'
          }`}
          title="Bật bút vẽ chú thích trực tiếp lên màn hình"
        >
          <PenTool size={13} />
          <span>Bút vẽ</span>
        </button>

        {isPenActive && (
          <div className="flex items-center space-x-1 pl-1 border-l border-white/20">
            {['#ef4444', '#eab308', '#ffffff', '#38bdf8'].map((c) => (
              <button
                key={c}
                onClick={() => setPenColor(c)}
                className={`w-3.5 h-3.5 rounded-full border border-white/40 ${penColor === c ? 'scale-125 ring-2 ring-white' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
            <button
              onClick={clearDrawings}
              className="p-1 hover:bg-white/20 rounded-full text-slate-300"
              title="Xóa nét vẽ"
            >
              <Eraser size={13} />
            </button>
          </div>
        )}

        <div className="h-4 w-px bg-white/20"></div>

        {/* Teacher Notes Toggle */}
        <button
          onClick={() => setIsNotesOpen(!isNotesOpen)}
          className={`p-1.5 rounded-full transition ${isNotesOpen ? 'bg-amber-500 text-slate-900 font-bold' : 'hover:bg-white/20 text-slate-300'}`}
          title="Mở ghi chú lời giảng"
        >
          <FileText size={15} />
        </button>

        {/* Confetti Celebration for Students */}
        <button
          onClick={handleTriggerConfetti}
          className="p-1.5 rounded-full hover:bg-amber-500/30 text-amber-300 hover:text-amber-200 transition"
          title="Bắn pháo hoa khen ngợi học sinh trả lời đúng!"
        >
          <Sparkles size={15} />
        </button>

        {/* Real-time system clock and Lesson Timer */}
        <div className="flex items-center gap-2 text-[11px] font-mono bg-white/10 px-2.5 py-0.5 rounded-full">
          <div className="flex items-center gap-1 text-amber-300" title="Thời gian thực hệ thống">
            <Clock size={12} />
            <span>{currentTime}</span>
          </div>
          <span className="text-white/30">|</span>
          <div className="flex items-center gap-1 text-emerald-400" title="Thời gian tiết học đã trình chiếu">
            <span>⏱ {formatTimer(lessonSeconds)}</span>
          </div>
        </div>

        {/* Exit Presentation */}
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-red-600 text-slate-300 hover:text-white transition ml-1"
          title="Thoát trình chiếu (Esc)"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
