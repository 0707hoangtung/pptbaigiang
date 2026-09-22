import { Presentation, PresentationTheme } from '../types/presentation';

export const PRESENTATION_THEMES: PresentationTheme[] = [
  {
    id: 'ocean-blue',
    name: 'Xanh Đại Dương (PowerPoint Classic)',
    slideBg: '#1e5385', // Matches user screenshot blue!
    slideGradient: 'linear-gradient(135deg, #1b4b79 0%, #1e5385 50%, #24639e 100%)',
    textColor: '#ffffff',
    accentColor: '#fbbf24',
    secondaryColor: '#38bdf8',
    fontFamily: 'Segoe UI, sans-serif'
  },
  {
    id: 'emerald-green',
    name: 'Xanh Lá Tươi Sáng',
    slideBg: '#0f4c3a',
    slideGradient: 'linear-gradient(135deg, #093327 0%, #0f4c3a 50%, #16654e 100%)',
    textColor: '#ffffff',
    accentColor: '#34d399',
    secondaryColor: '#a7f3d0',
    fontFamily: 'Plus Jakarta Sans, sans-serif'
  },
  {
    id: 'dark-slate',
    name: 'Xám Đen Hiện Đại',
    slideBg: '#1e293b',
    slideGradient: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
    textColor: '#f8fafc',
    accentColor: '#6366f1',
    secondaryColor: '#38bdf8',
    fontFamily: 'Segoe UI, sans-serif'
  },
  {
    id: 'sunset-amber',
    name: 'Hoàng Hôn Ấm Áp',
    slideBg: '#7c2d12',
    slideGradient: 'linear-gradient(135deg, #7c2d12 0%, #9a3412 60%, #c2410c 100%)',
    textColor: '#ffffff',
    accentColor: '#fde047',
    secondaryColor: '#fdba74',
    fontFamily: 'Merriweather, serif'
  },
  {
    id: 'clean-white',
    name: 'Trắng Thanh Lịch',
    slideBg: '#ffffff',
    textColor: '#0f172a',
    accentColor: '#2563eb',
    secondaryColor: '#64748b',
    fontFamily: 'Segoe UI, sans-serif'
  }
];

export const DEFAULT_PRESENTATION: Presentation = {
  id: 'lec-solarsystem-01',
  title: 'Bài 28: Khám phá Hệ Mặt Trời và Các Hành Tinh',
  subject: 'Khoa học Tự nhiên 6',
  grade: 'Lớp 6',
  author: 'Thầy Giáo Nguyễn Văn An',
  updatedAt: '2026-09-21',
  aspectRatio: '16:9',
  themeId: 'ocean-blue',
  slides: [
    {
      id: 'slide-1',
      title: 'Trang Bìa - Khám Phá Vũ Trụ',
      notes: 'Chào cả lớp! Hôm nay chúng ta sẽ bắt đầu một hành trình kỳ thú du hành vào không gian bao la để khám phá Hệ Mặt Trời của chúng ta.',
      backgroundColor: '#1e5385',
      transition: 'fade',
      elements: [
        {
          id: 's1-tag',
          type: 'shape',
          shapeType: 'rounded-rect',
          x: 35,
          y: 16,
          width: 30,
          height: 7,
          fillColor: 'rgba(255, 255, 255, 0.15)',
          strokeColor: '#38bdf8',
          strokeWidth: 1.5,
          text: '🚀 BÀI GIẢNG ĐIỆN TỬ - KHOA HỌC TỰ NHIÊN 6',
          textColor: '#e0f2fe',
          fontSize: 14,
          zIndex: 1
        },
        {
          id: 's1-title',
          type: 'text',
          text: 'KHÁM PHÁ HỆ MẶT TRỜI\nVÀ CÁC HÀNH TINH',
          fontSize: 44,
          fontFamily: 'Segoe UI',
          color: '#ffffff',
          fontWeight: '700',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center',
          x: 10,
          y: 28,
          width: 80,
          height: 26,
          zIndex: 2
        },
        {
          id: 's1-subtitle',
          type: 'text',
          text: 'Bộ sách: Cánh Diều & Kết nối Tri thức | Năm học 2026 - 2027',
          fontSize: 18,
          fontFamily: 'Segoe UI',
          color: '#93c5fd',
          fontWeight: 'normal',
          fontStyle: 'italic',
          textDecoration: 'none',
          textAlign: 'center',
          x: 20,
          y: 56,
          width: 60,
          height: 8,
          zIndex: 3
        },
        {
          id: 's1-author-box',
          type: 'shape',
          shapeType: 'rounded-rect',
          x: 28,
          y: 68,
          width: 44,
          height: 14,
          fillColor: 'rgba(15, 23, 42, 0.4)',
          strokeColor: 'rgba(255, 255, 255, 0.2)',
          strokeWidth: 1,
          text: '👨‍🏫 Giáo viên thực hiện: Thầy Nguyễn Văn An\nTrường THCS Lê Quý Đôn',
          textColor: '#ffffff',
          fontSize: 15,
          zIndex: 4
        }
      ]
    },
    {
      id: 'slide-2',
      title: 'Mục Tiêu Bài Học',
      notes: 'Nhấn mạnh 3 mục tiêu cốt lõi: Nêu được cấu trúc hệ mặt trời, gọi tên đúng thứ tự 8 hành tinh, và phân biệt được hành tinh đất đá với hành tinh khí.',
      backgroundColor: '#1e5385',
      transition: 'push',
      elements: [
        {
          id: 's2-header',
          type: 'text',
          text: 'I. MỤC TIÊU BÀI HỌC',
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
          height: 10,
          zIndex: 1
        },
        {
          id: 's2-smartart',
          type: 'smartart',
          smartArtType: 'cards',
          x: 8,
          y: 24,
          width: 84,
          height: 60,
          zIndex: 2,
          items: [
            {
              id: 'c1',
              title: '1. Kiến thức',
              desc: 'Hiểu rõ vị trí của Mặt Trời ở trung tâm và thứ tự 8 hành tinh quay quanh quỹ đạo.',
              color: '#0284c7'
            },
            {
              id: 'c2',
              title: '2. Kỹ năng',
              desc: 'Quan sát sơ đồ không gian, so sánh kích thước và khoảng cách giữa các thiên thể.',
              color: '#0d9488'
            },
            {
              id: 'c3',
              title: '3. Phẩm chất',
              desc: 'Khơi dậy niềm đam mê khám phá thiên văn học và trân trọng hành tinh Trái Đất.',
              color: '#d97706'
            }
          ]
        }
      ]
    },
    {
      id: 'slide-3',
      title: 'Cấu Trúc Hệ Mặt Trời',
      notes: 'Hệ Mặt Trời có tuổi đời khoảng 4.6 tỷ năm, Mặt Trời chiếm 99.86% tổng khối lượng toàn hệ.',
      backgroundColor: '#1e5385',
      transition: 'fade',
      elements: [
        {
          id: 's3-header',
          type: 'text',
          text: 'II. MẶT TRỜI VÀ CÁC THÀNH PHẦN CHÍNH',
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
          id: 's3-img',
          type: 'image',
          src: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=900&auto=format&fit=crop&q=80',
          alt: 'Vũ trụ và Hệ Mặt Trời',
          objectFit: 'cover',
          borderRadius: 12,
          x: 8,
          y: 22,
          width: 44,
          height: 64,
          zIndex: 2
        },
        {
          id: 's3-desc',
          type: 'text',
          text: '🌟 Mặt Trời: Ngôi sao ở trung tâm\n\n• Mặt Trời là một khối cầu khí nóng sáng rực rỡ.\n• Lực hấp dẫn cực lớn giữ các hành tinh quay trên quỹ đạo elip gần tròn.\n• Nguồn cung cấp ánh sáng và nhiệt năng cho sự sống Trái Đất.\n• 8 hành tinh chính thức được chia thành 2 nhóm:\n   - Nhóm hành tinh đất đá (bên trong)\n   - Nhóm hành tinh khí khổng lồ (bên ngoài)',
          fontSize: 18,
          fontFamily: 'Segoe UI',
          color: '#ffffff',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'left',
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          borderRadius: 12,
          padding: 16,
          x: 54,
          y: 22,
          width: 38,
          height: 64,
          zIndex: 3
        }
      ]
    },
    {
      id: 'slide-4',
      title: 'Thứ Tự 8 Hành Tinh',
      notes: 'Cho học sinh mẹo ghi nhớ câu vè: Thủy - Kim - Trái - Hỏa | Mộc - Thổ - Thiên - Hải.',
      backgroundColor: '#1e5385',
      transition: 'wipe',
      elements: [
        {
          id: 's4-header',
          type: 'text',
          text: 'III. THỨ TỰ 8 HÀNH TINH TỪ GẦN ĐẾN XA MẶT TRỜI',
          fontSize: 28,
          fontFamily: 'Segoe UI',
          color: '#fbbf24',
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
          id: 's4-flow',
          type: 'smartart',
          smartArtType: 'process',
          x: 6,
          y: 24,
          width: 88,
          height: 38,
          zIndex: 2,
          items: [
            { id: 'p1', title: '1. Sao Thủy', desc: 'Gần nhất, nóng nhất', color: '#64748b' },
            { id: 'p2', title: '2. Sao Kim', desc: 'Hành tinh sáng nhất', color: '#ea580c' },
            { id: 'p3', title: '3. Trái Đất', desc: 'Có sự sống duy nhất', color: '#0284c7' },
            { id: 'p4', title: '4. Sao Hỏa', desc: 'Hành tinh đỏ', color: '#dc2626' }
          ]
        },
        {
          id: 's4-flow-2',
          type: 'smartart',
          smartArtType: 'process',
          x: 6,
          y: 56,
          width: 88,
          height: 38,
          zIndex: 3,
          items: [
            { id: 'p5', title: '5. Sao Mộc', desc: 'Lớn nhất hệ mặt trời', color: '#b45309' },
            { id: 'p6', title: '6. Sao Thổ', desc: 'Vành đai tráng lệ', color: '#ca8a04' },
            { id: 'p7', title: '7. Thiên Vương', desc: 'Băng giá nghiêng trục', color: '#06b6d4' },
            { id: 'p8', title: '8. Hải Vương', desc: 'Xa nhất, gió bão lớn', color: '#2563eb' }
          ]
        }
      ]
    },
    {
      id: 'slide-5',
      title: 'Bảng So Sánh Các Hành Tinh',
      notes: 'Bảng thông số chi tiết để các nhóm thảo luận và trả lời phiếu học tập.',
      backgroundColor: '#1e5385',
      transition: 'fade',
      elements: [
        {
          id: 's5-header',
          type: 'text',
          text: 'IV. BẢNG DỮ LIỆU THÔNG SỐ ĐẶC TRƯNG',
          fontSize: 28,
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
          id: 's5-table',
          type: 'table',
          rows: 5,
          cols: 4,
          headerBgColor: '#0369a1',
          headerTextColor: '#ffffff',
          rowAltColor: 'rgba(255, 255, 255, 0.08)',
          borderColor: '#38bdf8',
          fontSize: 16,
          data: [
            ['Hành Tinh', 'Loại', 'Đường Kính (km)', 'Thời Gian Quay 1 Vòng'],
            ['Sao Thủy (Mercury)', 'Đất đá', '4.879 km', '88 ngày Trái Đất'],
            ['Sao Kim (Venus)', 'Đất đá', '12.104 km', '225 ngày Trái Đất'],
            ['Trái Đất (Earth)', 'Đất đá có nước', '12.742 km', '365.25 ngày (1 năm)'],
            ['Sao Mộc (Jupiter)', 'Khí khổng lồ', '139.820 km', '11.86 năm Trái Đất']
          ],
          x: 8,
          y: 22,
          width: 84,
          height: 68,
          zIndex: 2
        }
      ]
    },
    {
      id: 'slide-6',
      title: 'Biểu Đồ Kích Thước Tương Quan',
      notes: 'Minh họa trực quan sự chênh lệch kích cỡ cực lớn giữa Sao Mộc và các hành tinh đất đá.',
      backgroundColor: '#1e5385',
      transition: 'zoom',
      elements: [
        {
          id: 's6-header',
          type: 'text',
          text: 'V. BIỂU ĐỒ BÁN KÍNH SO VỚI TRÁI ĐẤT (Đơn vị: lần Trái Đất = 1)',
          fontSize: 26,
          fontFamily: 'Segoe UI',
          color: '#fbbf24',
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
          id: 's6-chart',
          type: 'chart',
          chartType: 'bar',
          title: 'Độ lớn bán kính tương đối so với Trái Đất',
          data: [
            { label: 'Sao Thủy', value: 0.38, color: '#94a3b8' },
            { label: 'Sao Kim', value: 0.95, color: '#fb923c' },
            { label: 'Trái Đất', value: 1.0, color: '#38bdf8' },
            { label: 'Sao Hỏa', value: 0.53, color: '#ef4444' },
            { label: 'Sao Mộc', value: 11.2, color: '#f59e0b' },
            { label: 'Sao Thổ', value: 9.45, color: '#eab308' },
            { label: 'Thiên Vương', value: 4.0, color: '#06b6d4' },
            { label: 'Hải Vương', value: 3.88, color: '#3b82f6' }
          ],
          x: 8,
          y: 22,
          width: 84,
          height: 68,
          zIndex: 2
        }
      ]
    },
    {
      id: 'slide-7',
      title: 'Câu Hỏi Củng Cố - Thảo Luận Nhóm',
      notes: 'Mời đại diện 2 nhóm đứng dậy trả lời và nhận điểm thi đua.',
      backgroundColor: '#1e5385',
      transition: 'push',
      elements: [
        {
          id: 's7-header',
          type: 'text',
          text: 'VI. BÀI TẬP VẬN DỤNG & CỦNG CỐ KIẾN THỨC',
          fontSize: 28,
          fontFamily: 'Segoe UI',
          color: '#38bdf8',
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
          id: 's7-q1',
          type: 'shape',
          shapeType: 'rounded-rect',
          fillColor: 'rgba(255, 255, 255, 0.12)',
          strokeColor: '#fde047',
          strokeWidth: 2,
          text: '❓ Câu 1: Hành tinh nào lớn nhất và hành tinh nào nhỏ nhất trong Hệ Mặt Trời?\n👉 Gợi ý: So sánh Sao Mộc và Sao Thủy',
          textColor: '#ffffff',
          fontSize: 18,
          x: 8,
          y: 22,
          width: 84,
          height: 20,
          zIndex: 2
        },
        {
          id: 's7-q2',
          type: 'shape',
          shapeType: 'rounded-rect',
          fillColor: 'rgba(255, 255, 255, 0.12)',
          strokeColor: '#34d399',
          strokeWidth: 2,
          text: '❓ Câu 2: Tại sao Trái Đất là hành tinh duy nhất có sự sống phong phú phát triển?\n👉 Gợi ý: Nước lỏng, khoảng cách vừa phải tới Mặt Trời, bầu khí quyển bảo vệ',
          textColor: '#ffffff',
          fontSize: 18,
          x: 8,
          y: 46,
          width: 84,
          height: 20,
          zIndex: 3
        },
        {
          id: 's7-tip',
          type: 'shape',
          shapeType: 'speech-bubble',
          fillColor: '#0369a1',
          strokeColor: '#ffffff',
          strokeWidth: 1.5,
          text: '💡 Thời gian thảo luận: 3 phút. Các nhóm thảo luận và ghi vào bảng nhóm!',
          textColor: '#ffffff',
          fontSize: 16,
          x: 18,
          y: 70,
          width: 64,
          height: 18,
          zIndex: 4
        }
      ]
    },
    {
      id: 'slide-8',
      title: 'Tổng Kết & Dặn Dò',
      notes: 'Khen ngợi tinh thần học tập của cả lớp, nhắc nhở bài tập về nhà trong SGK trang 112.',
      backgroundColor: '#1e5385',
      transition: 'fade',
      elements: [
        {
          id: 's8-star',
          type: 'shape',
          shapeType: 'star',
          fillColor: '#fbbf24',
          strokeColor: '#ffffff',
          strokeWidth: 2,
          x: 42,
          y: 12,
          width: 16,
          height: 18,
          zIndex: 1
        },
        {
          id: 's8-wordart',
          type: 'wordart',
          text: 'XIN CHÂN THÀNH CẢM ƠN!',
          stylePreset: 'golden',
          fontSize: 42,
          x: 15,
          y: 34,
          width: 70,
          height: 16,
          zIndex: 2
        },
        {
          id: 's8-task',
          type: 'text',
          text: '📌 Nhiệm vụ về nhà:\n1. Học thuộc tên và thứ tự 8 hành tinh trong Hệ Mặt Trời\n2. Làm bài tập 1, 2, 3 trang 112 Sách Giáo Khoa\n3. Sưu tầm hình ảnh về trạm vũ trụ quốc tế ISS cho tiết sau',
          fontSize: 18,
          fontFamily: 'Segoe UI',
          color: '#e2e8f0',
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          borderRadius: 12,
          padding: 16,
          x: 20,
          y: 54,
          width: 60,
          height: 34,
          zIndex: 3
        }
      ]
    }
  ]
};

export const LECTURE_LIBRARY: Presentation[] = [
  DEFAULT_PRESENTATION,
  {
    id: 'lec-math-pythagore',
    title: 'Định Lý Pytago và Ứng Dụng Thực Tiễn',
    subject: 'Toán học 8',
    grade: 'Lớp 8',
    author: 'Cô Trần Thị Mai',
    updatedAt: '2026-09-18',
    aspectRatio: '16:9',
    themeId: 'dark-slate',
    slides: [
      {
        id: 'pyt-1',
        title: 'Trang Bìa - Định lý Pytago',
        notes: 'Giới thiệu nhà toán học vĩ đại Pytago và phát minh làm thay đổi nền hình học thế giới.',
        backgroundColor: '#1e293b',
        elements: [
          {
            id: 'p1-t',
            type: 'text',
            text: 'HÌNH HỌC 8 - CHƯƠNG III\nĐỊNH LÝ PYTAGO\nVÀ ỨNG DỤNG ĐO ĐẠC THỰC TẾ',
            fontSize: 40,
            fontFamily: 'Segoe UI',
            color: '#f8fafc',
            fontWeight: '700',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'center',
            x: 10,
            y: 25,
            width: 80,
            height: 30,
            zIndex: 1
          },
          {
            id: 'p1-formula',
            type: 'shape',
            shapeType: 'rounded-rect',
            fillColor: '#3b82f6',
            strokeColor: '#93c5fd',
            strokeWidth: 2,
            text: '$$a^2 + b^2 = c^2 \\quad (\\Delta ABC \\text{ vuông tại } A)$$',
            textColor: '#ffffff',
            fontSize: 24,
            x: 20,
            y: 58,
            width: 60,
            height: 18,
            zIndex: 2
          }
        ]
      },
      {
        id: 'pyt-2',
        title: 'Nội Dung Định Lý',
        notes: 'Cho học sinh chứng minh bằng hình học ghép 4 tam giác vuông bằng nhau.',
        backgroundColor: '#1e293b',
        elements: [
          {
            id: 'p2-t',
            type: 'text',
            text: 'I. PHÁT BIỂU ĐỊNH LÝ PYTAGO THUẬN',
            fontSize: 30,
            fontFamily: 'Segoe UI',
            color: '#38bdf8',
            fontWeight: '700',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'left',
            x: 8,
            y: 10,
            width: 84,
            height: 12,
            zIndex: 1
          },
          {
            id: 'p2-box',
            type: 'shape',
            shapeType: 'rect',
            fillColor: 'rgba(255, 255, 255, 0.05)',
            strokeColor: '#38bdf8',
            strokeWidth: 2,
            text: 'Trong một tam giác vuông, bình phương cạnh huyền bằng tổng bình phương hai cạnh góc vuông:\n\n$$BC^2 = AB^2 + AC^2 \\implies BC = \\sqrt{AB^2 + AC^2}$$',
            textColor: '#f1f5f9',
            fontSize: 22,
            x: 8,
            y: 28,
            width: 84,
            height: 42,
            zIndex: 2
          }
        ]
      },
      {
        id: 'pyt-3',
        title: 'Bộ ba số Pytago phổ biến',
        notes: 'Nhớ các bộ ba: (3, 4, 5), (5, 12, 13), (6, 8, 10)...',
        backgroundColor: '#1e293b',
        elements: [
          {
            id: 'p3-t',
            type: 'text',
            text: 'II. CÁC BỘ BA SỐ PYTAGO ĐẶC BIỆT',
            fontSize: 28,
            fontFamily: 'Segoe UI',
            color: '#fbbf24',
            fontWeight: '700',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'left',
            x: 8,
            y: 10,
            width: 84,
            height: 12,
            zIndex: 1
          },
          {
            id: 'p3-tbl',
            type: 'table',
            rows: 4,
            cols: 3,
            headerBgColor: '#2563eb',
            headerTextColor: '#ffffff',
            rowAltColor: 'rgba(255,255,255,0.05)',
            borderColor: '#60a5fa',
            fontSize: 18,
            data: [
              ['Cạnh góc vuông a', 'Cạnh góc vuông b', 'Cạnh huyền c'],
              ['3 cm', '4 cm', '5 cm (3² + 4² = 9 + 16 = 25 = 5²)'],
              ['5 cm', '12 cm', '13 cm (25 + 144 = 169 = 13²)'],
              ['6 cm', '8 cm', '10 cm (36 + 64 = 100 = 10²)']
            ],
            x: 8,
            y: 25,
            width: 84,
            height: 55,
            zIndex: 2
          }
        ]
      }
    ]
  },
  {
    id: 'lec-lit-vietnam',
    title: 'Kho Tàng Văn Học Dân Gian Việt Nam',
    subject: 'Ngữ văn 10',
    grade: 'Lớp 10',
    author: 'Thầy Hoàng Quốc Bảo',
    updatedAt: '2026-09-15',
    aspectRatio: '16:9',
    themeId: 'sunset-amber',
    slides: [
      {
        id: 'lit-1',
        title: 'Trang Bìa - Văn Học Dân Gian',
        notes: 'Văn học dân gian là cội nguồn nuôi dưỡng tâm hồn người Việt qua hàng ngàn năm lịch sử.',
        backgroundColor: '#7c2d12',
        elements: [
          {
            id: 'l1-t',
            type: 'text',
            text: 'KHO TÀNG VĂN HỌC DÂN GIAN\nVIỆT NAM',
            fontSize: 42,
            fontFamily: 'Merriweather',
            color: '#ffffff',
            fontWeight: '700',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'center',
            x: 10,
            y: 28,
            width: 80,
            height: 25,
            zIndex: 1
          },
          {
            id: 'l1-sub',
            type: 'text',
            text: 'Ca dao - Dân ca - Truyện Cổ tích - Truyện Cười - Thần thoại',
            fontSize: 20,
            fontFamily: 'Merriweather',
            color: '#fef08a',
            fontWeight: 'normal',
            fontStyle: 'italic',
            textDecoration: 'none',
            textAlign: 'center',
            x: 15,
            y: 56,
            width: 70,
            height: 10,
            zIndex: 2
          }
        ]
      },
      {
        id: 'lit-2',
        title: 'Phân Loại Thể Loại',
        notes: 'Chia làm các nhóm tự sự, trữ tình và sân khấu truyền thống.',
        backgroundColor: '#7c2d12',
        elements: [
          {
            id: 'l2-t',
            type: 'text',
            text: 'HỆ THỐNG CÁC THỂ LOẠI CHÍNH',
            fontSize: 30,
            fontFamily: 'Merriweather',
            color: '#fde047',
            fontWeight: '700',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'left',
            x: 8,
            y: 10,
            width: 84,
            height: 12,
            zIndex: 1
          },
          {
            id: 'l2-smartart',
            type: 'smartart',
            smartArtType: 'cards',
            x: 8,
            y: 26,
            width: 84,
            height: 60,
            zIndex: 2,
            items: [
              { id: 't1', title: '1. Thần Thoại & Cổ Tích', desc: 'Lạc Long Quân, Thánh Gióng, Tấm Cám...', color: '#9a3412' },
              { id: 't2', title: '2. Ca Dao - Tục Ngữ', desc: 'Kinh nghiệm sống, tình yêu quê hương, đạo lý...', color: '#c2410c' },
              { id: 't3', title: '3. Truyện Cười & Ngụ Ngôn', desc: 'Trạng Quỳnh, Thầy bói xem voi, Đẽo cày giữa đường...', color: '#ea580c' }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'lec-english-daily',
    title: 'English: Daily Routines & Communication',
    subject: 'Tiếng Anh 7',
    grade: 'Lớp 7',
    author: 'Ms. Emily Nguyễn',
    updatedAt: '2026-09-12',
    aspectRatio: '16:9',
    themeId: 'emerald-green',
    slides: [
      {
        id: 'eng-1',
        title: 'Title - Daily Routines',
        notes: 'Warm up students with a quick morning routine song.',
        backgroundColor: '#0f4c3a',
        elements: [
          {
            id: 'e1-t',
            type: 'text',
            text: 'UNIT 4: MY DAILY ROUTINES\n& TIME MANAGEMENT',
            fontSize: 40,
            fontFamily: 'Plus Jakarta Sans',
            color: '#ffffff',
            fontWeight: '700',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'center',
            x: 10,
            y: 26,
            width: 80,
            height: 25,
            zIndex: 1
          },
          {
            id: 'e1-sub',
            type: 'text',
            text: 'Speaking & Vocabulary Practice | Grade 7',
            fontSize: 20,
            fontFamily: 'Plus Jakarta Sans',
            color: '#a7f3d0',
            fontWeight: 'normal',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'center',
            x: 15,
            y: 55,
            width: 70,
            height: 10,
            zIndex: 2
          }
        ]
      }
    ]
  },
  {
    id: 'lec-informatics-python',
    title: 'Tin Học 10: Nhập Môn Tư Duy Thuật Toán',
    subject: 'Tin học 10',
    grade: 'Lớp 10',
    author: 'Thầy Lê Minh Tuấn',
    updatedAt: '2026-09-10',
    aspectRatio: '16:9',
    themeId: 'dark-slate',
    slides: [
      {
        id: 'cs-1',
        title: 'Thuật toán và Sơ đồ khối',
        notes: 'Thuật toán là dãy hữu hạn các chỉ dẫn rõ ràng để giải quyết bài toán.',
        backgroundColor: '#1e293b',
        elements: [
          {
            id: 'cs1-t',
            type: 'text',
            text: 'TƯ DUY MÁY TÍNH & THUẬT TOÁN\n(COMPUTATIONAL THINKING)',
            fontSize: 38,
            fontFamily: 'Segoe UI',
            color: '#38bdf8',
            fontWeight: '700',
            fontStyle: 'normal',
            textDecoration: 'none',
            textAlign: 'center',
            x: 10,
            y: 25,
            width: 80,
            height: 25,
            zIndex: 1
          },
          {
            id: 'cs1-flow',
            type: 'smartart',
            smartArtType: 'process',
            x: 8,
            y: 55,
            width: 84,
            height: 35,
            zIndex: 2,
            items: [
              { id: 'a1', title: '1. Đầu Vào (Input)', desc: 'Dữ liệu bài toán', color: '#0284c7' },
              { id: 'a2', title: '2. Xử Lý (Process)', desc: 'Các bước thuật toán', color: '#0d9488' },
              { id: 'a3', title: '3. Đầu Ra (Output)', desc: 'Kết quả giải quyết', color: '#16a34a' }
            ]
          }
        ]
      }
    ]
  }
];

export const EDUCATIONAL_STOCK_PHOTOS = [
  {
    title: 'Vũ trụ & Hệ Mặt Trời',
    category: 'Khoa học',
    url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=900&auto=format&fit=crop&q=80'
  },
  {
    title: 'Hành tinh Trái Đất',
    category: 'Khoa học',
    url: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=900&auto=format&fit=crop&q=80'
  },
  {
    title: 'Phòng Thí Nghiệm Hóa Sinh',
    category: 'Khoa học',
    url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=900&auto=format&fit=crop&q=80'
  },
  {
    title: 'Hình học & Thước đo',
    category: 'Toán học',
    url: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=900&auto=format&fit=crop&q=80'
  },
  {
    title: 'Trống Đồng & Di Sản Lịch Sử',
    category: 'Lịch sử',
    url: 'https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?w=900&auto=format&fit=crop&q=80'
  },
  {
    title: 'Sách & Thư Viện Tri Thức',
    category: 'Ngữ văn',
    url: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=900&auto=format&fit=crop&q=80'
  },
  {
    title: 'Bản Đồ Địa Lý & Quả Địa Cầu',
    category: 'Địa lý',
    url: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=900&auto=format&fit=crop&q=80'
  },
  {
    title: 'Lập Trình & Công Nghệ Số',
    category: 'Tin học',
    url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=900&auto=format&fit=crop&q=80'
  }
];
