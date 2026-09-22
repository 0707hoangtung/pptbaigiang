import React, { useState } from 'react';
import { 
  X, 
  Table as TableIcon, 
  Shapes, 
  Smile, 
  BarChart3, 
  Network, 
  Image as ImageIcon, 
  Upload, 
  Search, 
  Omega,
  Check
} from 'lucide-react';
import { EDUCATIONAL_STOCK_PHOTOS } from '../data/defaultLectures';

// 1. Table Picker Modal
interface TablePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTable: (rows: number, cols: number) => void;
}

export const TablePickerModal: React.FC<TablePickerModalProps> = ({
  isOpen,
  onClose,
  onInsertTable
}) => {
  const [hoverRows, setHoverRows] = useState(3);
  const [hoverCols, setHoverCols] = useState(4);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-5 w-80 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <TableIcon size={18} className="text-blue-600" />
            <span>Chèn bảng (Insert Table)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="my-4 text-center">
          <div className="text-xs font-semibold text-slate-600 mb-2">
            Bảng kích thước: <span className="text-blue-600 font-bold">{hoverCols} cột x {hoverRows} hàng</span>
          </div>

          {/* Grid selector like PowerPoint */}
          <div className="grid grid-cols-8 gap-1 p-2 bg-slate-50 border border-slate-200 rounded max-w-fit mx-auto">
            {Array.from({ length: 6 }).map((_, rIdx) => (
              <React.Fragment key={rIdx}>
                {Array.from({ length: 8 }).map((_, cIdx) => {
                  const isHighlighted = rIdx < hoverRows && cIdx < hoverCols;
                  return (
                    <div
                      key={cIdx}
                      onMouseEnter={() => {
                        setHoverRows(rIdx + 1);
                        setHoverCols(cIdx + 1);
                      }}
                      onClick={() => {
                        onInsertTable(rIdx + 1, cIdx + 1);
                        onClose();
                      }}
                      className={`w-5 h-5 rounded-xs border cursor-pointer transition ${
                        isHighlighted 
                          ? 'bg-blue-500 border-blue-600' 
                          : 'bg-white border-slate-300 hover:border-slate-400'
                      }`}
                    />
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 text-xs">
          <button onClick={onClose} className="px-3 py-1.5 rounded text-slate-600 hover:bg-slate-100 font-medium">
            Hủy
          </button>
          <button
            onClick={() => {
              onInsertTable(hoverRows, hoverCols);
              onClose();
            }}
            className="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Chèn bảng ngay
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Shape Picker Modal
interface ShapePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertShape: (shapeType: any) => void;
}

export const ShapePickerModal: React.FC<ShapePickerModalProps> = ({
  isOpen,
  onClose,
  onInsertShape
}) => {
  if (!isOpen) return null;

  const shapeCategories = [
    {
      title: 'Hình cơ bản',
      shapes: [
        { type: 'rect', label: 'Chữ nhật', icon: '⬜' },
        { type: 'rounded-rect', label: 'Bo góc', icon: '◻️' },
        { type: 'circle', label: 'Hình tròn', icon: '⚪' },
        { type: 'triangle', label: 'Tam giác', icon: '🔺' },
        { type: 'diamond', label: 'Hình thoi', icon: '🔶' }
      ]
    },
    {
      title: 'Mũi tên & Ngôi sao',
      shapes: [
        { type: 'arrow-right', label: 'Mũi tên phải', icon: '➡️' },
        { type: 'star', label: 'Ngôi sao 5 cánh', icon: '⭐' },
        { type: 'speech-bubble', label: 'Hộp thoại / Chú thích', icon: '💬' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-5 w-96 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Shapes size={18} className="text-cyan-600" />
            <span>Chọn hình dạng (Insert Shape)</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="my-4 space-y-4 max-h-80 overflow-y-auto pr-1">
          {shapeCategories.map((cat, idx) => (
            <div key={idx}>
              <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {cat.title}
              </h5>
              <div className="grid grid-cols-3 gap-2">
                {cat.shapes.map((s) => (
                  <button
                    key={s.type}
                    onClick={() => {
                      onInsertShape(s.type);
                      onClose();
                    }}
                    className="p-2.5 rounded border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center justify-center text-center transition group"
                  >
                    <span className="text-2xl group-hover:scale-110 transition">{s.icon}</span>
                    <span className="text-[11px] font-medium text-slate-700 mt-1">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 3. Image Stock Picker Modal
interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertImage: (src: string) => void;
}

export const ImagePickerModal: React.FC<ImagePickerModalProps> = ({
  isOpen,
  onClose,
  onInsertImage
}) => {
  const [urlInput, setUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'stock' | 'url' | 'upload'>('stock');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onInsertImage(event.target.result as string);
          onClose();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ImageIcon size={18} className="text-emerald-600" />
            <span>Chèn hình ảnh vào bài giảng</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        {/* Tabs: Stock vs URL vs Upload */}
        <div className="flex border-b border-slate-200 mt-3 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('stock')}
            className={`px-4 py-2 border-b-2 transition ${
              activeTab === 'stock' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500'
            }`}
          >
            Kho ảnh học liệu sẵn có
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 border-b-2 transition ${
              activeTab === 'upload' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500'
            }`}
          >
            Tải ảnh từ máy tính
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`px-4 py-2 border-b-2 transition ${
              activeTab === 'url' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500'
            }`}
          >
            Nhập liên kết ảnh (URL)
          </button>
        </div>

        <div className="my-4">
          {activeTab === 'stock' && (
            <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
              {EDUCATIONAL_STOCK_PHOTOS.map((photo, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onInsertImage(photo.url);
                    onClose();
                  }}
                  className="rounded-lg overflow-hidden border border-slate-200 hover:border-emerald-500 cursor-pointer shadow-xs hover:shadow-md transition group"
                >
                  <div className="h-28 overflow-hidden bg-slate-100 relative">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-semibold">
                      {photo.category}
                    </span>
                  </div>
                  <div className="p-2 text-xs font-semibold text-slate-800 truncate">
                    {photo.title}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl text-center flex flex-col items-center justify-center bg-slate-50">
              <Upload size={36} className="text-emerald-600 mb-2" />
              <div className="font-bold text-slate-800 text-sm mb-1">
                Kéo thả hoặc bấm để chọn ảnh từ máy tính
              </div>
              <p className="text-xs text-slate-500 mb-4">Hỗ trợ JPG, PNG, WEBP, GIF</p>
              <label className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs">
                Chọn ảnh từ thiết bị
                <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          )}

          {activeTab === 'url' && (
            <div className="p-4 space-y-3">
              <label className="text-xs font-semibold text-slate-700">Đường dẫn ảnh trực tiếp (URL):</label>
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full p-2 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
              />
              <button
                onClick={() => {
                  if (urlInput.trim()) {
                    onInsertImage(urlInput.trim());
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold"
              >
                Chèn ảnh này
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. SmartArt Picker Modal
interface SmartArtPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSmartArt: (type: 'cards' | 'process') => void;
}

export const SmartArtPickerModal: React.FC<SmartArtPickerModalProps> = ({
  isOpen,
  onClose,
  onInsertSmartArt
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl p-5 w-full max-w-lg border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Network size={18} className="text-emerald-600" />
            <span>Chèn đồ họa SmartArt</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="my-4 grid grid-cols-2 gap-4">
          <button
            onClick={() => {
              onInsertSmartArt('cards');
              onClose();
            }}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition flex flex-col justify-between h-44 group"
          >
            <div>
              <div className="font-bold text-slate-800 text-sm mb-1 group-hover:text-emerald-700">
                1. Thẻ Nội Dung (Content Cards)
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                3 thẻ màu sắc trực quan để phân loại khái niệm, mục tiêu bài học hoặc ý chính.
              </p>
            </div>
            <div className="flex gap-1.5 mt-3">
              <div className="flex-1 h-8 rounded bg-blue-500"></div>
              <div className="flex-1 h-8 rounded bg-teal-500"></div>
              <div className="flex-1 h-8 rounded bg-amber-500"></div>
            </div>
          </button>

          <button
            onClick={() => {
              onInsertSmartArt('process');
              onClose();
            }}
            className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition flex flex-col justify-between h-44 group"
          >
            <div>
              <div className="font-bold text-slate-800 text-sm mb-1 group-hover:text-emerald-700">
                2. Quy Trình / Dòng Thời Gian (Process Flow)
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Các khối kết nối mũi tên biểu diễn các bước thực hiện, giai đoạn lịch sử hoặc thuật toán.
              </p>
            </div>
            <div className="flex items-center gap-1 mt-3">
              <div className="flex-1 h-7 rounded bg-indigo-500"></div>
              <span className="text-xs text-slate-400">➡️</span>
              <div className="flex-1 h-7 rounded bg-teal-500"></div>
              <span className="text-xs text-slate-400">➡️</span>
              <div className="flex-1 h-7 rounded bg-emerald-500"></div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

// 5. Symbol & Equation Picker Modal
interface SymbolPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertSymbol: (symbol: string) => void;
}

export const SymbolPickerModal: React.FC<SymbolPickerModalProps> = ({
  isOpen,
  onClose,
  onInsertSymbol
}) => {
  if (!isOpen) return null;

  const symbols = [
    'π', '∑', '√', '±', '∞', 'α', 'β', 'θ', '∆', '≤', '≥', '≠', '÷', '×', '∫', '≈', '⊥', '∠', '°', '‰', '∈', '∉', '⊂', '∪', '∩'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-5 w-80 border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Omega size={18} className="text-blue-700" />
            <span>Ký hiệu Toán & Khoa học</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
          </button>
        </div>

        <div className="my-4 grid grid-cols-5 gap-2 max-h-60 overflow-y-auto">
          {symbols.map((sym, idx) => (
            <button
              key={idx}
              onClick={() => {
                onInsertSymbol(sym);
                onClose();
              }}
              className="h-10 text-xl font-bold rounded border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition flex items-center justify-center text-slate-800"
            >
              {sym}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
