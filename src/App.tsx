import React, { useState, useEffect, useMemo } from 'react';
import { 
  Lock, Unlock, Shield, Search, Printer, 
  ChevronDown, Save, RotateCcw, AlertTriangle, CheckCircle, 
  LogOut, LogIn, Calendar, Trophy, UserX, Award, Check
} from 'lucide-react';

// ==========================================
// 1. TÀI KHOẢN VÀ MẬT KHẨU CỐ ĐỊNH
// ==========================================
const CLASSES = [
  '10A1', '10A2', '10A3', '10A4', '10A5',
  '11A1', '11A2', '11A3', '11A4', '11A5',
  '12A1', '12A2', '12A3', '12A4', '12A5', '12A6', '12A7'
];

// Tạo bảng tra cứu tài khoản - mật khẩu
const USER_ACCOUNTS: Record<string, { role: 'admin' | 'class'; targetClass?: string; pass: string }> = {
  admin: { role: 'admin', pass: 'Admin@tts2026' },
  ...CLASSES.reduce((acc, cls) => {
    acc[cls.toLowerCase()] = {
      role: 'class',
      targetClass: cls,
      pass: `${cls}@tts2026`
    };
    return acc;
  }, {} as Record<string, { role: 'admin' | 'class'; targetClass?: string; pass: string }>)
};

// ==========================================
// 2. DANH SÁCH TIÊU CHÍ CHẤM ĐIỂM THI ĐUA
// ==========================================
interface Criterion {
  id: string;
  name: string;
  points: number;
  type: 'deduct' | 'bonus' | 'rating';
  isGeneral?: boolean; // Tiêu chí vùng CHUNG (đánh giá tiết / tuyên dương)
}

const CRITERIA: Criterion[] = [
  // CHUNG (Đánh giá tiết học & Tuyên dương)
  { id: '4', name: 'Tiết học đạt loại B', points: -5, type: 'deduct', isGeneral: true },
  { id: '5', name: 'Tiết học đạt loại C', points: -10, type: 'deduct', isGeneral: true },
  { id: '6', name: 'Tiết học đạt loại D', points: -20, type: 'deduct', isGeneral: true },
  { id: '7', name: 'Tiết học Không xếp loại', points: -30, type: 'deduct', isGeneral: true },
  { id: '8', name: 'Tuyên dương Điểm 8', points: 5, type: 'bonus', isGeneral: true },
  { id: '9', name: 'Tuyên dương Điểm 9', points: 10, type: 'bonus', isGeneral: true },
  { id: '10', name: 'Tuyên dương Điểm 10', points: 15, type: 'bonus', isGeneral: true },

  // RIÊNG - I. HỌC TẬP
  { id: '1.1', name: '1.1 Không học bài, không làm bài tập', points: -2, type: 'deduct' },
  { id: '1.2', name: '1.2 Không mang sách vở, dụng cụ học tập', points: -2, type: 'deduct' },
  { id: '1.3', name: '1.3 Không chuẩn bị bài trước khi đến lớp', points: -2, type: 'deduct' },
  { id: '2.1', name: '2.1 Mất trật tự, làm việc riêng trong giờ học', points: -2, type: 'deduct' },
  { id: '2.2', name: '2.2 Sử dụng điện thoại không đúng quy định', points: -5, type: 'deduct' },
  { id: '2.3', name: '2.3 Đổi chỗ, ngồi sai sơ đồ lớp', points: -2, type: 'deduct' },
  { id: '2.4', name: '2.4 Ngủ trong giờ học', points: -2, type: 'deduct' },
  { id: '2.5', name: '2.5 Cúp tiết, trốn giờ học', points: -10, type: 'deduct' },
  { id: '3', name: '3. Gian lận trong kiểm tra, thi cử', points: -20, type: 'deduct' },

  // RIÊNG - II. KỶ LUẬT & NỘI QUY
  { id: '11', name: '11. Đi học muộn / Về sớm không lý do', points: -2, type: 'deduct' },
  { id: '12', name: '12. Vắng học không phép', points: -5, type: 'deduct' },
  { id: '13', name: '13. Sai đồng phục, không đeo bảng tên/phù hiệu', points: -2, type: 'deduct' },
  { id: '14', name: '14. Nhuộm tóc sáng màu, trang điểm, sơn móng', points: -5, type: 'deduct' },
  { id: '15', name: '15. Nối tóc, để kiểu tóc không đúng quy định', points: -5, type: 'deduct' },
  { id: '16', name: '16. Đi xe máy phân khối lớn, không mũ bảo hiểm', points: -20, type: 'deduct' },
  { id: '17', name: '17. Gửi xe ngoài trường, không đúng nơi quy định', points: -10, type: 'deduct' },
  { id: '18', name: '18. Mang chất cấm, vũ khí, vật nguy hiểm', points: -50, type: 'deduct' },
  { id: '19', name: '19. Hút thuốc lá, thuốc lá điện tử trong trường', points: -30, type: 'deduct' },
  { id: '20', name: '20. Đánh nhau, gây mất trật tự trường học', points: -50, type: 'deduct' },
  { id: '21', name: '21. Nói tục, chửi thề, xúc phạm người khác', points: -5, type: 'deduct' },

  // RIÊNG - III. VỆ SINH & TÀI SẢN
  { id: '22', name: '22. Lớp trực vệ sinh chậm, không sạch', points: -5, type: 'deduct' },
  { id: '23', name: '23. Vứt rác không đúng nơi quy định', points: -5, type: 'deduct' },
  { id: '24', name: '24. Viết vẽ lên bàn, tường, cửa sổ', points: -10, type: 'deduct' },
  { id: '25', name: '25. Làm hư hỏng tài sản nhà trường', points: -20, type: 'deduct' },
  { id: '26', name: '26. Không tắt điện, quạt khi ra khỏi phòng', points: -5, type: 'deduct' },

  // RIÊNG - IV. HOẠT ĐỘNG & THI ĐUA
  { id: '27', name: '27. Vắng / Muộn tập thể dục giữa giờ, chào cờ', points: -5, type: 'deduct' },
  { id: '28', name: '28. Không tham gia hoạt động đoàn thể', points: -10, type: 'deduct' },
  { id: '29', name: '29. Đạt giải Nhất phong trào trường', points: 30, type: 'bonus' },
  { id: '30', name: '30. Đạt giải Nhì phong trào trường', points: 20, type: 'bonus' },
  { id: '31', name: '31. Đạt giải Ba phong trào trường', points: 10, type: 'bonus' },
  { id: '39', name: '39. Đạt giải Khuyến khích / Tuyên dương', points: 5, type: 'bonus' },
];

// ==========================================
// 3. DANH SÁCH HỌC SINH MẪU
// ==========================================
interface Student {
  sbd: string;
  stt: number;
  name: string;
  className: string;
}

const GENERATE_STUDENTS = (): Student[] => {
  const sampleNames = [
    'Nguyễn Văn An', 'Trần Thị Bích', 'Lê Hoàng Cường', 'Phạm Minh Đức',
    'Vũ Thị Hoa', 'Đặng Quốc Huy', 'Bùi Tuyết Mai', 'Đỗ Nam Phong',
    'Hoàng Khánh Linh', 'Ngo Thanh Tùng', 'Dương Thảo Nguyên', 'Lý Quốc Bảo'
  ];
  const result: Student[] = [];
  CLASSES.forEach((cls) => {
    for (let i = 1; i <= 20; i++) {
      const sbd = `${cls}-${i < 10 ? '0' + i : i}`;
      const name = sampleNames[(i + cls.charCodeAt(0)) % sampleNames.length] + ` (${cls})`;
      result.push({ sbd, stt: i, name, className: cls });
    }
  });
  return result;
};

const STUDENTS_DATA = GENERATE_STUDENTS();

// ==========================================
// 4. INTERFACES DỮ LIỆU CHẤM ĐIỂM
// ==========================================
interface IndividualViolation {
  criterionId: string;
  sbd: string;
  count: number;
}

interface GeneralScore {
  criterionId: string;
  count: number;
}

interface WeekData {
  general: Record<string, number>; // criterionId -> count
  violations: IndividualViolation[]; // danh sách vi phạm cá nhân
}

// Key format: week_6_10A1 -> WeekData
type AppData = Record<string, WeekData>;

// Current User Session
interface UserSession {
  username: string;
  role: 'admin' | 'class';
  targetClass?: string;
}

export default function App() {
  // State quản lý phiên làm việc & Đăng nhập
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('tktd_user_session');
    return saved ? JSON.parse(saved) : null; // Mặc định null = Khách/Người xem
  });

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginInput, setLoginInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Tab đang chọn
  const [activeTab, setActiveTab] = useState<'entry' | 'summary' | 'search' | 'report'>('entry');

  // Quản lý tuần
  const [currentWeek, setCurrentWeek] = useState<number>(6); // Mặc định Tuần 6
  const [selectedClass, setSelectedClass] = useState<string>('10A1');

  // Toàn bộ dữ liệu chấm điểm (lưu vào localStorage)
  const [appData, setAppData] = useState<AppData>(() => {
    const saved = localStorage.getItem('tktd_app_data_v2');
    return saved ? JSON.parse(saved) : {};
  });

  // Tự động chọn lớp khi đăng nhập tài khoản Lớp
  useEffect(() => {
    if (currentUser && currentUser.role === 'class' && currentUser.targetClass) {
      setSelectedClass(currentUser.targetClass);
    }
  }, [currentUser]);

  // Tự động đồng bộ appData vào localStorage
  useEffect(() => {
    localStorage.setItem('tktd_app_data_v2', JSON.stringify(appData));
  }, [appData]);

  // Kiểm tra thời gian khóa hệ thống (21h00 Thứ 6)
  const isSystemLocked = useMemo(() => {
    // Admin không bị khóa bao giờ
    if (currentUser?.role === 'admin') return false;

    const now = new Date();
    const day = now.getDay(); // 0: CN, 5: T6, 6: T7
    const hour = now.getHours();

    // Khóa từ 21h00 Thứ 6 đến hết Chủ Nhật
    if (day === 5 && hour >= 21) return true;
    if (day === 6 || day === 0) return true;
    return false;
  }, [currentUser]);

  // Lấy dữ liệu của tuần và lớp đang chọn
  const weekClassKey = `week_${currentWeek}_${selectedClass}`;
  const currentWeekData: WeekData = appData[weekClassKey] || { general: {}, violations: [] };

  // ------------------------------------------
  // XỬ LÝ ĐĂNG NHẬP / ĐĂNG XUẤT CHẶT CHẼ
  // ------------------------------------------
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const accountKey = loginInput.trim().toLowerCase();
    const account = USER_ACCOUNTS[accountKey];

    // KIỂM TRA CHÍNH XÁC MẬT KHẨU
    if (!account || account.pass !== passwordInput.trim()) {
      setLoginError('Tài khoản hoặc mật khẩu không chính xác!');
      return;
    }

    // Đăng nhập thành công
    const session: UserSession = {
      username: accountKey,
      role: account.role,
      targetClass: account.targetClass
    };

    setCurrentUser(session);
    localStorage.setItem('tktd_user_session', JSON.stringify(session));
    setShowLoginModal(false);
    setLoginInput('');
    setPasswordInput('');
    setLoginError('');

    if (account.role === 'class' && account.targetClass) {
      setSelectedClass(account.targetClass);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('tktd_user_session');
  };

  // ------------------------------------------
  // XỬ LÝ CẬP NHẬT ĐIỂM SỐ
  // ------------------------------------------
  const updateGeneralScore = (criterionId: string, delta: number) => {
    if (isSystemLocked) return;

    setAppData((prev) => {
      const existing = prev[weekClassKey] || { general: {}, violations: [] };
      const currentVal = existing.general[criterionId] || 0;
      const newVal = Math.max(0, currentVal + delta);

      return {
        ...prev,
        [weekClassKey]: {
          ...existing,
          general: { ...existing.general, [criterionId]: newVal }
        }
      };
    });
  };

  // Nhập chuỗi SBD/STT nhanh (dạng 06-10-14 hoặc 6 10 14)
  const [fastInputString, setFastInputString] = useState<Record<string, string>>({});

  const handleFastAddViolation = (criterionId: string) => {
    if (isSystemLocked) return;

    const input = fastInputString[criterionId] || '';
    if (!input.trim()) return;

    // Tách chuỗi theo dấu vết, phẩy, khoảng trắng
    const tokens = input.split(/[-,\s]+/).map(t => t.trim()).filter(Boolean);
    
    setAppData((prev) => {
      const existing = prev[weekClassKey] || { general: {}, violations: [] };
      let updatedViolations = [...existing.violations];

      tokens.forEach((token) => {
        let targetSbd = token;
        // Nếu nhập số thứ tự (1-20), tự tạo SBD
        if (!isNaN(Number(token))) {
          const sttNum = parseInt(token, 10);
          targetSbd = `${selectedClass}-${sttNum < 10 ? '0' + sttNum : sttNum}`;
        }

        const idx = updatedViolations.findIndex(
          v => v.criterionId === criterionId && v.sbd === targetSbd
        );

        if (idx >= 0) {
          updatedViolations[idx] = {
            ...updatedViolations[idx],
            count: updatedViolations[idx].count + 1
          };
        } else {
          updatedViolations.push({ criterionId, sbd: targetSbd, count: 1 });
        }
      });

      return {
        ...prev,
        [weekClassKey]: {
          ...existing,
          violations: updatedViolations
        }
      };
    });

    setFastInputString(prev => ({ ...prev, [criterionId]: '' }));
  };

  const removeViolationCard = (criterionId: string, sbd: string) => {
    if (isSystemLocked) return;

    setAppData((prev) => {
      const existing = prev[weekClassKey] || { general: {}, violations: [] };
      return {
        ...prev,
        [weekClassKey]: {
          ...existing,
          violations: existing.violations.filter(
            v => !(v.criterionId === criterionId && v.sbd === sbd)
          )
        }
      };
    });
  };

  // ------------------------------------------
  // TÍNH ĐIỂM BẢNG TỔNG KẾT
  // ------------------------------------------
  const calculateClassScore = (clsName: string, week: number) => {
    const key = `week_${week}_${clsName}`;
    const data = appData[key];
    let total = 500; // Điểm chuẩn 500

    if (!data) return total;

    // Điểm chung
    Object.entries(data.general).forEach(([critId, count]) => {
      const crit = CRITERIA.find(c => c.id === critId);
      if (crit) {
        total += crit.points * count;
      }
    });

    // Điểm vi phạm riêng
    data.violations.forEach((v) => {
      const crit = CRITERIA.find(c => c.id === v.criterionId);
      if (crit) {
        total += crit.points * v.count;
      }
    });

    return total;
  };

  const summaryData = useMemo(() => {
    const list = CLASSES.map((cls) => ({
      className: cls,
      score: calculateClassScore(cls, currentWeek)
    }));

    // Sắp xếp điểm từ cao xuống thấp
    list.sort((a, b) => b.score - a.score);

    return list.map((item, idx) => ({
      rank: idx + 1,
      ...item
    }));
  }, [appData, currentWeek]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans flex flex-col">
      {/* ================= HEADER TRÊN CÙNG ================= */}
      <header className="bg-slate-900 text-white px-4 py-3 shadow-md flex flex-wrap justify-between items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg text-white">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-blue-800 text-blue-100 text-xs font-semibold px-2.5 py-0.5 rounded">
                TUẦN {currentWeek} (19/10 - 23/10/2026)
              </span>
              <span className="text-xs text-slate-300">
                | Hạn nhập điểm: 21:00 Thứ 6 hàng tuần
              </span>
            </div>
            <h1 className="text-base font-bold tracking-tight text-white mt-0.5">
              HỆ THỐNG TỔNG KẾT THI ĐUA HÀNG TUẦN (TKTĐ)
            </h1>
          </div>
        </div>

        {/* Trạng thái đăng nhập */}
        <div className="flex items-center gap-3">
          {isSystemLocked && (
            <div className="flex items-center gap-1.5 bg-red-900/80 text-red-200 border border-red-700 text-xs px-2.5 py-1 rounded-md">
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span>HỆ THỐNG ĐÃ KHÓA</span>
            </div>
          )}

          {currentUser ? (
            <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-md border border-slate-700">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-medium text-slate-200">
                {currentUser.role === 'admin' ? 'ADMIN' : `Lớp: ${currentUser.targetClass}`}
              </span>
              <button 
                onClick={handleLogout}
                className="ml-2 text-slate-400 hover:text-red-400 p-1 rounded transition"
                title="Đăng xuất"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition shadow"
            >
              <LogIn className="w-4 h-4" />
              <span>Đăng nhập</span>
            </button>
          )}
        </div>
      </header>

      {/* ================= THANH TÙY CHỌN & NAV TABS ================= */}
      <nav className="bg-white border-b border-slate-200 px-4 py-2 flex flex-wrap justify-between items-center gap-3 shadow-sm">
        {/* Chọn Tuần & Chọn Lớp */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 px-2.5 py-1.5 rounded border">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span>Đang chọn:</span>
            <select 
              value={currentWeek} 
              onChange={(e) => setCurrentWeek(Number(e.target.value))}
              className="font-bold text-slate-900 bg-transparent outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(w => (
                <option key={w} value={w}>Tuần {w} (HK I)</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 px-2.5 py-1.5 rounded border">
            <span>Lớp:</span>
            <select 
              value={selectedClass} 
              onChange={(e) => setSelectedClass(e.target.value)}
              disabled={currentUser?.role === 'class'} // Khóa cố định nếu đăng nhập tài khoản Lớp
              className="font-bold text-slate-900 bg-transparent outline-none cursor-pointer disabled:opacity-75"
            >
              {CLASSES.map(cls => (
                <option key={cls} value={cls}>Lớp {cls}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 4 TAB CHÍNH */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('entry')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'entry' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            1. Nhập Điểm
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'summary' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            2. Bảng Tổng Kết
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'search' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            3. Tra Cứu Học Sinh
          </button>
          <button
            onClick={() => setActiveTab('report')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'report' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            4. Báo Cáo
          </button>
        </div>
      </nav>

      {/* ================= NỘI DUNG CHÍNH THEO TAB ================= */}
      <main className="flex-1 p-4 max-w-7xl w-full mx-auto">
        {/* WARN LỜI CẢNH BÁO KHI KHÓA */}
        {isSystemLocked && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-center gap-2 text-xs text-amber-800">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Hệ thống đã tự động khóa sau 21h00 Thứ 6. Bạn hiện đang ở chế độ <b>Chỉ xem</b>.</span>
          </div>
        )}

        {/* ------------------ TAB 1: NHẬP ĐIỂM ------------------ */}
        {activeTab === 'entry' && (
          <div className="space-y-6">
            {/* VÙNG CHUNG (TỐI GIẢN SIÊU NHỎ GỌN) */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-3">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                VÙNG CHUNG: ĐÁNH GIÁ TIẾT HỌC & TUYÊN DƯƠNG
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {CRITERIA.filter(c => c.isGeneral).map((crit) => {
                  const count = currentWeekData.general[crit.id] || 0;
                  return (
                    <div key={crit.id} className="border rounded p-2 text-center bg-slate-50">
                      <div className="text-[11px] font-medium text-slate-700 line-clamp-1">{crit.name}</div>
                      <div className={`text-xs font-bold ${crit.points > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {crit.points > 0 ? `+${crit.points}` : crit.points}đ
                      </div>
                      <div className="flex items-center justify-center gap-1 mt-1.5">
                        <button
                          onClick={() => updateGeneralScore(crit.id, -1)}
                          disabled={isSystemLocked || count <= 0}
                          className="w-6 h-6 rounded bg-slate-200 hover:bg-slate-300 disabled:opacity-40 text-xs font-bold"
                        >
                          -
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{count}</span>
                        <button
                          onClick={() => updateGeneralScore(crit.id, 1)}
                          disabled={isSystemLocked}
                          className="w-6 h-6 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* VÙNG RIÊNG (TIÊU CHÍ VI PHẠM CÁ NHÂN) */}
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                VÙNG RIÊNG: VI PHẠM CÁ NHÂN THEO LỚP ({selectedClass})
              </h2>

              <div className="divide-y divide-slate-100">
                {CRITERIA.filter(c => !c.isGeneral).map((crit) => {
                  const cardList = currentWeekData.violations.filter(v => v.criterionId === crit.id);

                  return (
                    <div key={crit.id} className="py-2.5 flex flex-wrap md:flex-nowrap items-center justify-between gap-3">
                      {/* Tiêu đề tiêu chí */}
                      <div className="w-full md:w-1/3">
                        <div className="text-xs font-semibold text-slate-800">{crit.name}</div>
                        <div className="text-[11px] text-red-600 font-medium">{crit.points} điểm</div>
                      </div>

                      {/* Ô nhập nhanh chuỗi SBD/STT */}
                      <div className="flex items-center gap-1.5 w-full md:w-1/3">
                        <input
                          type="text"
                          placeholder="SBD/STT (VD: 06-10-14)"
                          value={fastInputString[crit.id] || ''}
                          onChange={(e) => setFastInputString(prev => ({ ...prev, [crit.id]: e.target.value }))}
                          disabled={isSystemLocked}
                          className="flex-1 px-2.5 py-1 text-xs border rounded outline-none focus:border-blue-500 disabled:bg-slate-100"
                        />
                        <button
                          onClick={() => handleFastAddViolation(crit.id)}
                          disabled={isSystemLocked}
                          className="px-2.5 py-1 bg-slate-800 text-white text-xs font-medium rounded hover:bg-slate-700 disabled:opacity-50"
                        >
                          Thêm
                        </button>
                      </div>

                      {/* Thẻ học sinh vi phạm */}
                      <div className="flex flex-wrap items-center gap-1.5 w-full md:w-1/3 justify-start md:justify-end">
                        {cardList.map((item) => (
                          <div key={item.sbd} className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-xs px-2 py-0.5 rounded-full">
                            <span className="font-semibold">{item.sbd}</span>
                            {item.count > 1 && (
                              <span className="bg-red-600 text-white text-[10px] font-bold px-1 rounded-full">
                                x{item.count}
                              </span>
                            )}
                            {!isSystemLocked && (
                              <button
                                onClick={() => removeViolationCard(crit.id, item.sbd)}
                                className="ml-1 text-red-400 hover:text-red-700 font-bold"
                              >
                                ×
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ------------------ TAB 2: BẢNG TỔNG KẾT ------------------ */}
        {activeTab === 'summary' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              BẢNG TỔNG KẾT XẾP HẠNG THI ĐUA TUẦN {currentWeek}
            </h2>

            {/* BẢNG TỐI GIẢN 3 CỘT: XẾP HẠNG | LỚP | TỔNG ĐIỂM */}
            <div className="max-w-xl mx-auto overflow-hidden border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white uppercase text-[11px] font-bold">
                    <th className="py-2.5 px-4 text-center w-24">Xếp Hạng</th>
                    <th className="py-2.5 px-4">Lớp</th>
                    <th className="py-2.5 px-4 text-right w-32">Tổng Điểm</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {summaryData.map((row) => (
                    <tr key={row.className} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-4 text-center font-bold">
                        {row.rank === 1 ? (
                          <span className="inline-flex items-center justify-center bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-extrabold">
                            🏆 Top 1
                          </span>
                        ) : (
                          `Hạng ${row.rank}`
                        )}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900">
                        Lớp {row.className}
                      </td>
                      <td className="py-2.5 px-4 text-right font-extrabold text-blue-700 text-sm">
                        {row.score}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------ TAB 3: TRA CỨU HỌC SINH ------------------ */}
        {activeTab === 'search' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
            <h2 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              TRA CỨU HỌC SINH LỚP {selectedClass}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
              {STUDENTS_DATA.filter(s => s.className === selectedClass).map((student) => (
                <div key={student.sbd} className="border rounded p-2 flex justify-between items-center bg-slate-50 text-xs">
                  <div>
                    <span className="font-bold text-slate-700">{student.stt}. </span>
                    <span className="font-medium text-slate-900">{student.name}</span>
                  </div>
                  <span className="text-[11px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                    SBD: {student.sbd}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------ TAB 4: BÁO CÁO / IN BÁO CÁO ------------------ */}
        {activeTab === 'report' && (
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 space-y-6">
            <div className="flex justify-between items-center border-b pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  BÁO CÁO THI ĐUA CHÀO CỜ - TUẦN {currentWeek}
                </h2>
                <p className="text-xs text-slate-500">Trường THPT • Năm học 2026 - 2027</p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-700"
              >
                <Printer className="w-4 h-4" />
                <span>In Báo Cáo</span>
              </button>
            </div>

            {/* BẢNG TỔNG KẾT RÚT GỌN 3 CỘT IN BÁO CÁO */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase mb-2">1. Bảng Xếp Hạng Lớp</h3>
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead>
                  <tr className="bg-slate-100 font-bold border-b border-slate-300">
                    <th className="p-2 border-r border-slate-300 text-center">Xếp Hạng</th>
                    <th className="p-2 border-r border-slate-300">Lớp</th>
                    <th className="p-2 text-right">Tổng Điểm</th>
                  </tr>
                </thead>
                <tbody>
                  {summaryData.map((r) => (
                    <tr key={r.className} className="border-b border-slate-200">
                      <td className="p-2 border-r border-slate-200 text-center font-bold">{r.rank}</td>
                      <td className="p-2 border-r border-slate-200 font-medium">Lớp {r.className}</td>
                      <td className="p-2 text-right font-bold text-blue-700">{r.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* DANH SÁCH CHI TIẾT VI PHẠM ĐỌC GIỜ CHÀO CỜ */}
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase mb-2">2. Danh Sách Chi Tiết Vi Phạm Trong Tuần</h3>
              <div className="space-y-2 text-xs">
                {CLASSES.map((cls) => {
                  const key = `week_${currentWeek}_${cls}`;
                  const data = appData[key];
                  if (!data || data.violations.length === 0) return null;

                  return (
                    <div key={cls} className="border p-2 rounded bg-slate-50">
                      <span className="font-bold text-blue-800">Lớp {cls}: </span>
                      <span className="text-slate-700">
                        {data.violations.map(v => {
                          const crit = CRITERIA.find(c => c.id === v.criterionId);
                          return `${v.sbd} (${crit?.name || v.criterionId}${v.count > 1 ? ` x${v.count}` : ''})`;
                        }).join('; ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL ĐĂNG NHẬP (KHÓA CHẶT) ================= */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-sm w-full p-5 relative">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              ĐĂNG NHẬP HỆ THỐNG
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Nhập tài khoản Admin hoặc Lớp (VD: 10A1)
            </p>

            {loginError && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-600 text-xs p-2 rounded flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Tài khoản</label>
                <input
                  type="text"
                  placeholder="admin hoặc 10A1..."
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border rounded outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Mật khẩu</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border rounded outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowLoginModal(false); setLoginError(''); }}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 shadow"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
