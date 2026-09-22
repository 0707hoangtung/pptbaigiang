import React, { useState, useEffect } from 'react';
import { X, Sparkles, Check, Calculator, Copy, BookOpen } from 'lucide-react';
import { renderLatexToHtml } from '../utils/mathRenderer';

interface MathFormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertFormula: (formula: string) => void;
  initialFormula?: string;
}

const FORMULA_TEMPLATES = [
  {
    category: 'Cơ bản & Đại số',
    items: [
      { label: 'Phân số', latex: '\\frac{a}{b}' },
      { label: 'Căn bậc hai', latex: '\\sqrt{x}' },
      { label: 'Căn bậc n', latex: '\\sqrt[n]{x}' },
      { label: 'Số mũ x²', latex: 'x^{2}' },
      { label: 'Chỉ số dưới a_n', latex: 'a_{n}' },
      { label: 'Cộng trừ ±', latex: '\\pm' },
      { label: 'Nhân ×', latex: '\\times' },
      { label: 'Chia ÷', latex: '\\div' }
    ]
  },
  {
    category: 'Giải tích & Giới hạn',
    items: [
      { label: 'Tích phân xác định', latex: '\\int_{a}^{b} f(x) \\, dx' },
      { label: 'Tổng Sigma', latex: '\\sum_{i=1}^{n} a_i' },
      { label: 'Giới hạn Lim', latex: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1' },
      { label: 'Đạo hàm bậc 1', latex: 'f\'(x) = \\frac{df}{dx}' }
    ]
  },
  {
    category: 'Hệ phương trình & Hình học',
    items: [
      { label: 'Hệ 2 phương trình', latex: '\\begin{cases} 2x + y = 5 \\\\ x - 3y = 2 \\end{cases}' },
      { label: 'Vectơ AB', latex: '\\vec{AB}' },
      { label: 'Góc vuông', latex: '\\angle ABC = 90^\\circ' },
      { label: 'Tam giác ABC', latex: '\\Delta ABC' }
    ]
  },
  {
    category: 'Ký hiệu Hy Lạp & Tập hợp',
    items: [
      { label: 'Số Pi π', latex: '\\pi' },
      { label: 'Delta Δ', latex: '\\Delta' },
      { label: 'Alpha α', latex: '\\alpha' },
      { label: 'Beta β', latex: '\\beta' },
      { label: 'Theta θ', latex: '\\theta' },
      { label: 'Vô cực ∞', latex: '\\infty' },
      { label: 'Thuộc ∈', latex: '\\in' },
      { label: 'Tương đương ⇔', latex: '\\Leftrightarrow' }
    ]
  },
  {
    category: 'Công thức toán học kinh điển',
    items: [
      { label: 'Định lý Pytago', latex: 'a^2 + b^2 = c^2' },
      { label: 'Nghiệm PT bậc hai', latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
      { label: 'Hằng đẳng thức', latex: '(a + b)^2 = a^2 + 2ab + b^2' },
      { label: 'Lượng giác cơ bản', latex: '\\sin^2(x) + \\cos^2(x) = 1' },
      { label: 'Công thức Einstein', latex: 'E = m c^2' }
    ]
  }
];

export const MathFormulaModal: React.FC<MathFormulaModalProps> = ({
  isOpen,
  onClose,
  onInsertFormula,
  initialFormula = 'v'
}) => {
  const [latexInput, setLatexInput] = useState(initialFormula);
  const [isBlockMode, setIsBlockMode] = useState(false);

  useEffect(() => {
    if (initialFormula) {
      // Strip outer $ if present
      let clean = initialFormula.trim();
      if (clean.startsWith('$$') && clean.endsWith('$$')) {
        clean = clean.slice(2, -2).trim();
        setIsBlockMode(true);
      } else if (clean.startsWith('$') && clean.endsWith('$')) {
        clean = clean.slice(1, -1).trim();
        setIsBlockMode(false);
      } else if (clean.includes('\\begin{cases}') || clean.length > 30) {
        setIsBlockMode(true);
      } else {
        setIsBlockMode(false);
      }
      setLatexInput(clean);
    }
  }, [initialFormula, isOpen]);

  if (!isOpen) return null;

  const insertToken = (token: string) => {
    setLatexInput(prev => `${prev} ${token}`.trim());
  };

  const handleApply = () => {
    if (!latexInput.trim()) return;
    const finalResult = isBlockMode 
      ? `$$${latexInput.trim()}$$` 
      : `$${latexInput.trim()}$`;
    onInsertFormula(finalResult);
    onClose();
  };

  const previewHtml = renderLatexToHtml(latexInput || 'f(x)', isBlockMode);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-lg">
              ∑
            </div>
            <div>
              <h3 className="font-bold text-base">Soạn Thảo Công Thức Toán (LaTeX)</h3>
              <p className="text-xs text-blue-100">
                Hỗ trợ cú pháp chuẩn LaTeX ($...$ hoặc $$...$$) hiển thị sắc nét trên slide
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Live Preview Box */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                <span>Xem trước kết quả hiển thị thực tế:</span>
              </span>
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setIsBlockMode(false)}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1 ${
                    !isBlockMode
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Công thức nằm cùng dòng với văn bản, không nhảy dòng (Ví dụ: giả sử v là vận tốc)"
                >
                  <span>Cùng dòng ($ ... $)</span>
                  {!isBlockMode && <span className="text-[10px] bg-blue-500 px-1 rounded text-white">Liền chữ</span>}
                </button>
                <button
                  type="button"
                  onClick={() => setIsBlockMode(true)}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer flex items-center gap-1 ${
                    isBlockMode
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Công thức tách thành dòng riêng căn giữa"
                >
                  <span>Khối riêng ($$ ... $$)</span>
                  {isBlockMode && <span className="text-[10px] bg-blue-500 px-1 rounded text-white">Xuống dòng</span>}
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 mb-1.5 flex items-center gap-1">
              <span>💡</span>
              {!isBlockMode ? (
                <span>Chế độ <b>Cùng dòng ($...$)</b>: Thích hợp cho biến số, công thức ngắn nằm chung trong câu văn (ví dụ: <i>giả sử $v$ là vận tốc</i>).</span>
              ) : (
                <span>Chế độ <b>Khối riêng ($$...$$)</b>: Công thức sẽ tự động xuống dòng và căn giữa như phương trình độc lập.</span>
              )}
            </div>

            {/* Rendered KaTeX Box */}
            <div className="min-h-24 p-4 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-inner border border-slate-800 text-2xl overflow-x-auto">
              <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
            </div>
          </div>

          {/* LaTeX Input Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Mã nguồn LaTeX:
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {isBlockMode ? `$$ ${latexInput} $$` : `$ ${latexInput} $`}
              </span>
            </div>
            <textarea
              value={latexInput}
              onChange={(e) => setLatexInput(e.target.value)}
              placeholder="Nhập mã LaTeX, ví dụ: \frac{-b \pm \sqrt{\Delta}}{2a}"
              rows={3}
              className="w-full p-2.5 font-mono text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden leading-relaxed text-slate-800"
            />
          </div>

          {/* Quick Insert Templates */}
          <div className="space-y-3 pt-1 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Calculator size={14} className="text-blue-600" />
              <span>Mẫu công thức & Ký hiệu nhanh (Bấm để chèn):</span>
            </h4>

            {FORMULA_TEMPLATES.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider">
                  {cat.category}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cat.items.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => insertToken(item.latex)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition flex items-center gap-1"
                      title={item.latex}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({item.latex})</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={() => setLatexInput('')}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium"
          >
            Xóa trắng
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              Hủy
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Chèn công thức vào Slide</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
