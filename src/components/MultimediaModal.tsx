import React, { useState, useRef } from 'react';
import {
  X,
  Film,
  Video,
  Mic,
  Link2,
  Upload,
  Globe,
  Play,
  Volume2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  FileAudio,
  Sparkles,
  Music
} from 'lucide-react';

interface MultimediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'video-file' | 'video-online' | 'audio' | 'link';
  onInsertVideo: (videoData: {
    url: string;
    title: string;
    sourceType: 'file' | 'youtube' | 'facebook' | 'url';
  }) => void;
  onInsertAudio: (audioData: {
    url: string;
    title: string;
    sourceType: 'file' | 'url';
  }) => void;
  onInsertLink: (linkData: {
    url: string;
    title: string;
    description?: string;
  }) => void;
}

// Helper to extract YouTube embed URL
export const getYouTubeEmbedUrl = (rawUrl: string): string | null => {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  
  // Standard watch URL: youtube.com/watch?v=ID
  const watchMatch = trimmed.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  // YouTube Shorts: youtube.com/shorts/ID
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([^"&?\/\s]{11})/i);
  if (shortsMatch && shortsMatch[1]) {
    return `https://www.youtube.com/embed/${shortsMatch[1]}`;
  }

  if (trimmed.includes('youtube.com/embed/')) {
    return trimmed;
  }

  return null;
};

// Helper to extract Facebook video embed URL
export const getFacebookEmbedUrl = (rawUrl: string): string | null => {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (trimmed.includes('facebook.com') || trimmed.includes('fb.watch')) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(trimmed)}&show_text=0`;
  }
  return null;
};

export const MultimediaModal: React.FC<MultimediaModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'video-online',
  onInsertVideo,
  onInsertAudio,
  onInsertLink
}) => {
  const [activeTab, setActiveTab] = useState<'video-file' | 'video-online' | 'audio' | 'link'>(initialTab);

  // Tab 1: Video File
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoFileUrl, setVideoFileUrl] = useState<string>('');
  const [videoFileTitle, setVideoFileTitle] = useState<string>('');
  const [videoFileLoading, setVideoFileLoading] = useState<boolean>(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Tab 2: Online Video
  const [onlineVideoUrl, setOnlineVideoUrl] = useState<string>('');
  const [onlineVideoTitle, setOnlineVideoTitle] = useState<string>('');
  const [detectedPlatform, setDetectedPlatform] = useState<'youtube' | 'facebook' | 'direct' | 'unknown'>('unknown');

  // Tab 3: Audio File
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [audioTitle, setAudioTitle] = useState<string>('');
  const [audioLoading, setAudioLoading] = useState<boolean>(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Tab 4: Web Link
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [linkTitle, setLinkTitle] = useState<string>('');
  const [linkDesc, setLinkDesc] = useState<string>('');

  if (!isOpen) return null;

  // Handle Video File Selection
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoFile(file);
    const defaultName = file.name.replace(/\.[^/.]+$/, '');
    setVideoFileTitle(defaultName);
    setVideoFileLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setVideoFileUrl(result);
      setVideoFileLoading(false);
    };
    reader.onerror = () => {
      // Fallback to object URL if FileReader fails
      const objUrl = URL.createObjectURL(file);
      setVideoFileUrl(objUrl);
      setVideoFileLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle Online Video URL Change
  const handleOnlineUrlChange = (url: string) => {
    setOnlineVideoUrl(url);
    if (!url.trim()) {
      setDetectedPlatform('unknown');
      return;
    }

    if (getYouTubeEmbedUrl(url)) {
      setDetectedPlatform('youtube');
      if (!onlineVideoTitle) setOnlineVideoTitle('Video YouTube minh họa');
    } else if (getFacebookEmbedUrl(url)) {
      setDetectedPlatform('facebook');
      if (!onlineVideoTitle) setOnlineVideoTitle('Video Facebook bài giảng');
    } else if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
      setDetectedPlatform('direct');
      if (!onlineVideoTitle) setOnlineVideoTitle('Video bài giảng');
    } else {
      setDetectedPlatform('unknown');
    }
  };

  // Handle Audio File Selection
  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    const defaultName = file.name.replace(/\.[^/.]+$/, '');
    setAudioTitle(defaultName);
    setAudioLoading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAudioUrl(result);
      setAudioLoading(false);
    };
    reader.onerror = () => {
      const objUrl = URL.createObjectURL(file);
      setAudioUrl(objUrl);
      setAudioLoading(false);
    };
    reader.readAsDataURL(file);
  };

  // Submission Handlers
  const handleSubmitVideoFile = () => {
    if (!videoFileUrl) return;
    onInsertVideo({
      url: videoFileUrl,
      title: videoFileTitle || 'Video bài giảng từ máy tính',
      sourceType: 'file'
    });
    onClose();
  };

  const handleSubmitOnlineVideo = () => {
    if (!onlineVideoUrl.trim()) return;

    let finalUrl = onlineVideoUrl.trim();
    let sourceType: 'youtube' | 'facebook' | 'url' = 'url';

    const ytEmbed = getYouTubeEmbedUrl(finalUrl);
    if (ytEmbed) {
      finalUrl = ytEmbed;
      sourceType = 'youtube';
    } else {
      const fbEmbed = getFacebookEmbedUrl(finalUrl);
      if (fbEmbed) {
        finalUrl = fbEmbed;
        sourceType = 'facebook';
      }
    }

    onInsertVideo({
      url: finalUrl,
      title: onlineVideoTitle || (sourceType === 'youtube' ? 'Video YouTube' : 'Video trực tuyến'),
      sourceType
    });
    onClose();
  };

  const handleSubmitAudio = () => {
    if (!audioUrl.trim()) return;
    onInsertAudio({
      url: audioUrl.trim(),
      title: audioTitle.trim() || 'Âm thanh bài giảng',
      sourceType: audioFile ? 'file' : 'url'
    });
    onClose();
  };

  const handleSubmitLink = () => {
    if (!linkUrl.trim()) return;
    let validUrl = linkUrl.trim();
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
      validUrl = `https://${validUrl}`;
    }

    onInsertLink({
      url: validUrl,
      title: linkTitle.trim() || validUrl,
      description: linkDesc.trim() || undefined
    });
    onClose();
  };

  // Sample Online Videos for quick testing
  const sampleVideos = [
    {
      title: 'Hệ Mặt Trời & Các Hành Tinh',
      url: 'https://www.youtube.com/watch?v=libKVRa01L8',
      desc: 'Khoa học Tự nhiên / Địa lý'
    },
    {
      title: 'Thí nghiệm Núi Lửa Phun Trào',
      url: 'https://www.youtube.com/watch?v=01ZgK6_d2vM',
      desc: 'Hóa học / Khoa học vui'
    },
    {
      title: 'Luyện nghe & Phát âm Tiếng Anh chuẩn',
      url: 'https://www.youtube.com/watch?v=g2bNmVZy1yY',
      desc: 'Tiếng Anh giao tiếp'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-500 flex items-center justify-center text-white shadow-md">
              <Film size={22} />
            </div>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <span>Chèn Đa phương tiện</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-amber-300 font-semibold">
                  Multimedia
                </span>
              </h2>
              <p className="text-xs text-slate-300">
                Tải file video, âm thanh từ máy tính hoặc chèn link YouTube, Facebook, liên kết web
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-2 shrink-0 gap-2 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('video-online')}
            className={`pb-2.5 px-3 font-semibold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'video-online'
                ? 'border-[#c43e1c] text-[#c43e1c]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe size={15} />
            <span>Link Video (YouTube, Facebook...)</span>
          </button>

          <button
            onClick={() => setActiveTab('video-file')}
            className={`pb-2.5 px-3 font-semibold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'video-file'
                ? 'border-[#c43e1c] text-[#c43e1c]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileVideo size={15} />
            <span>Video từ máy tính</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`pb-2.5 px-3 font-semibold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'audio'
                ? 'border-[#c43e1c] text-[#c43e1c]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileAudio size={15} />
            <span>Âm thanh từ máy tính</span>
          </button>

          <button
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 px-3 font-semibold transition flex items-center gap-1.5 border-b-2 cursor-pointer ${
              activeTab === 'link'
                ? 'border-[#c43e1c] text-[#c43e1c]'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Link2 size={15} />
            <span>Liên kết web</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: ONLINE VIDEO (YouTube, Facebook, etc.) */}
          {activeTab === 'video-online' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Đường dẫn Video (URL YouTube, Facebook, Vimeo hoặc file MP4 trực tuyến):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={onlineVideoUrl}
                    onChange={(e) => handleOnlineUrlChange(e.target.value)}
                    placeholder="Dán link tại đây: https://www.youtube.com/watch?v=... hoặc https://fb.watch/..."
                    className="w-full pl-3.5 pr-24 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#c43e1c] focus:outline-hidden"
                    autoFocus
                  />
                  {detectedPlatform !== 'unknown' && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {detectedPlatform === 'youtube' && '✓ YouTube'}
                      {detectedPlatform === 'facebook' && '✓ Facebook'}
                      {detectedPlatform === 'direct' && '✓ File MP4'}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề hiển thị cho video:
                </label>
                <input
                  type="text"
                  value={onlineVideoTitle}
                  onChange={(e) => setOnlineVideoTitle(e.target.value)}
                  placeholder="Ví dụ: Video giới thiệu bài học..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-[#c43e1c] focus:outline-hidden"
                />
              </div>

              {/* Live Preview of Online Video */}
              {onlineVideoUrl.trim() && (
                <div className="p-3 bg-slate-900 rounded-xl text-white">
                  <div className="text-[11px] font-bold text-slate-300 mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Play size={13} className="text-amber-400" />
                      <span>Xem trước video:</span>
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {detectedPlatform === 'youtube' ? 'Phát trực tiếp từ YouTube' : 'Trình phát video'}
                    </span>
                  </div>

                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-black flex items-center justify-center">
                    {getYouTubeEmbedUrl(onlineVideoUrl) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(onlineVideoUrl)!}
                        title="YouTube video player"
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : getFacebookEmbedUrl(onlineVideoUrl) ? (
                      <iframe
                        src={getFacebookEmbedUrl(onlineVideoUrl)!}
                        title="Facebook video player"
                        className="w-full h-full border-0"
                        allow="encrypted-media"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={onlineVideoUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Sample Videos Shortcut */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Hoặc thử nhanh với video bài giảng mẫu:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {sampleVideos.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        handleOnlineUrlChange(sample.url);
                        setOnlineVideoTitle(sample.title);
                      }}
                      className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-[#c43e1c] hover:bg-orange-50/50 transition cursor-pointer group"
                    >
                      <span className="font-bold text-xs text-slate-800 group-hover:text-[#c43e1c] block truncate">
                        {sample.title}
                      </span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        {sample.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VIDEO FILE FROM COMPUTER */}
          {activeTab === 'video-file' && (
            <div className="space-y-4">
              <input
                ref={videoInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mov"
                onChange={handleVideoFileChange}
                className="hidden"
              />

              <div
                onClick={() => videoInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#c43e1c] bg-slate-50 hover:bg-orange-50/30 rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <Upload size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Bấm để chọn file video từ máy tính của bạn
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Hỗ trợ định dạng .MP4, .WEBM, .MOV, .OGG
                  </span>
                </div>
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 shadow-xs text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Chọn tệp từ máy...
                </button>
              </div>

              {videoFileLoading && (
                <div className="text-center py-4 text-xs text-slate-500 animate-pulse">
                  Đang tải video từ máy tính, vui lòng chờ trong giây lát...
                </div>
              )}

              {videoFileUrl && !videoFileLoading && (
                <div className="space-y-3 p-4 bg-slate-100 rounded-xl">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tên video trên slide:
                    </label>
                    <input
                      type="text"
                      value={videoFileTitle}
                      onChange={(e) => setVideoFileTitle(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1">
                      Xem trước video đã chọn:
                    </span>
                    <video
                      src={videoFileUrl}
                      controls
                      className="w-full max-h-52 rounded-lg bg-black object-contain mx-auto"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUDIO FILE FROM COMPUTER / URL */}
          {activeTab === 'audio' && (
            <div className="space-y-4">
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/m4a,audio/ogg,audio/aac,.mp3,.wav,.m4a,.ogg"
                onChange={handleAudioFileChange}
                className="hidden"
              />

              <div
                onClick={() => audioInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/30 rounded-2xl p-6 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <Music size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Bấm để chọn file âm thanh từ máy tính của bạn
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Hỗ trợ định dạng .MP3, .WAV, .M4A, .OGG (Lời giảng, bài hát, phát âm mẫu)
                  </span>
                </div>
                <button
                  type="button"
                  className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 shadow-xs text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Chọn tệp âm thanh...
                </button>
              </div>

              {/* Or paste online audio URL */}
              <div className="relative flex py-1 items-center">
                <div className="grow border-t border-slate-200"></div>
                <span className="shrink mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Hoặc dán URL file âm thanh
                </span>
                <div className="grow border-t border-slate-200"></div>
              </div>

              <div>
                <input
                  type="text"
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://example.com/audio.mp3"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              {audioUrl && (
                <div className="p-4 bg-slate-100 rounded-xl space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Tiêu đề âm thanh / bài nghe:
                    </label>
                    <input
                      type="text"
                      value={audioTitle}
                      onChange={(e) => setAudioTitle(e.target.value)}
                      placeholder="Ví dụ: Bài nghe Track 1 - Unit 5"
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <span className="text-xs font-bold text-slate-700 block mb-1">
                      Nghe thử âm thanh:
                    </span>
                    <audio src={audioUrl} controls className="w-full" />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WEB LINK */}
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Địa chỉ liên kết web (URL):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="https://giaoduc.net.vn hoặc https://moet.gov.vn..."
                    className="w-full pl-3.5 pr-10 py-2.5 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    autoFocus
                  />
                  <Link2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Văn bản hiển thị của liên kết:
                </label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Ví dụ: Cổng thông tin Bộ Giáo dục và Đào tạo"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mô tả phụ (tùy chọn):
                </label>
                <input
                  type="text"
                  value={linkDesc}
                  onChange={(e) => setLinkDesc(e.target.value)}
                  placeholder="Ví dụ: Nhấn vào đây để xem tài liệu chi tiết..."
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Link Preview Card */}
              {linkUrl.trim() && (
                <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                      <ExternalLink size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-blue-900">
                        {linkTitle || linkUrl}
                      </h4>
                      <p className="text-[11px] text-blue-700 truncate max-w-sm">
                        {linkUrl}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-900">
                    Thẻ liên kết
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            {activeTab === 'video-online' && 'Video sẽ được nhúng trực tiếp và phát mượt mà trên bài giảng.'}
            {activeTab === 'video-file' && 'File video được lưu trữ an toàn trong bài giảng.'}
            {activeTab === 'audio' && 'Âm thanh có thể phát trực tiếp trong cả chế độ soạn thảo và trình chiếu.'}
            {activeTab === 'link' && 'Liên kết sẽ mở trong tab mới khi người xem bấm vào.'}
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
            >
              Hủy
            </button>

            {activeTab === 'video-online' && (
              <button
                onClick={handleSubmitOnlineVideo}
                disabled={!onlineVideoUrl.trim()}
                className="px-5 py-2 rounded-xl bg-[#c43e1c] hover:bg-[#a83214] disabled:opacity-50 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 size={15} />
                <span>Chèn Video vào bài</span>
              </button>
            )}

            {activeTab === 'video-file' && (
              <button
                onClick={handleSubmitVideoFile}
                disabled={!videoFileUrl}
                className="px-5 py-2 rounded-xl bg-[#c43e1c] hover:bg-[#a83214] disabled:opacity-50 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 size={15} />
                <span>Chèn Video vào bài</span>
              </button>
            )}

            {activeTab === 'audio' && (
              <button
                onClick={handleSubmitAudio}
                disabled={!audioUrl.trim()}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 size={15} />
                <span>Chèn Âm thanh vào bài</span>
              </button>
            )}

            {activeTab === 'link' && (
              <button
                onClick={handleSubmitLink}
                disabled={!linkUrl.trim()}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 size={15} />
                <span>Chèn Liên kết vào bài</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
