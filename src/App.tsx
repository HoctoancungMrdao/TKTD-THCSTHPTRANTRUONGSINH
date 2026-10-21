import React, { useState, useEffect, useMemo } from 'react';
import {
  Award,
  Lock,
  Unlock,
  UserCheck,
  LogOut,
  PenTool,
  Trophy,
  Users,
  Printer,
  ShieldCheck,
  Plus,
  Minus,
  X,
  Search,
  ListFilter,
  AlertTriangle,
  UserX,
  LogIn,
  RefreshCw,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

// Firebase Imports
import { db } from './firebase';
import { ref, onValue, set } from 'firebase/database';

// ==========================================
// 1. DATA TYPES & CONSTANTS
// ==========================================

export type UserRole = 'admin' | 'class';

export interface UserAccount {
  role: UserRole;
  targetClass: string;
}

export interface Student {
  stt: string;
  name: string;
}

export interface CriterionItem {
  code: string;
  name: string;
  points: number;
}

export interface CriterionGroup {
  category: string;
  items: CriterionItem[];
}

export interface ClassWeekData {
  common: Record<string, number>; // code -> quantity
  individual: Record<string, string[]>; // code -> array of SBD or 'CLASS'
  isEvaluated?: boolean; // Đã tổng kết/nhập điểm chưa
}

// 17 Classes list
export const CLASSES = [
  '10A1', '10A2', '10A3', '10A4', '10A5',
  '11A1', '11A2', '11A3', '11A4', '11A5',
  '12A1', '12A2', '12A3', '12A4', '12A5', '12A6', '12A7'
];

export const GRADE_GROUPS = {
  'Khối 10': ['10A1', '10A2', '10A3', '10A4', '10A5'],
  'Khối 11': ['11A1', '11A2', '11A3', '11A4', '11A5'],
  'Khối 12': ['12A1', '12A2', '12A3', '12A4', '12A5', '12A6', '12A7']
};

// Sample Vietnamese Names for Rosters
const SAMPLE_NAMES = [
  'Đặng Quốc Huy', 'Trần Đại Nghĩa', 'Nguyễn Văn An', 'Lê Thị Bích', 'Phạm Minh Cường',
  'Vũ Hoàng Dũng', 'Hoàng Thu Giang', 'Đỗ Văn Hùng', 'Bùi Thị Hương', 'Đinh Văn Khoa',
  'Ngô Thị Lan', 'Dương Minh Long', 'Lý Văn Nam', 'Phan Thị Ngọc', 'Trịnh Văn Phong',
  'Mai Thị Quỳnh', 'Cao Văn Sơn', 'Đào Thị Trang', 'Đỗ Minh Tuấn', 'Nguyễn Việt Anh'
];

// Generate 35 unique students per class
export const CLASS_ROSTERS: Record<string, Student[]> = {};
CLASSES.forEach((cls) => {
  CLASS_ROSTERS[cls] = Array.from({ length: 35 }, (_, i) => {
    const stt = (i + 1).toString().padStart(2, '0');
    const name = `${SAMPLE_NAMES[i % SAMPLE_NAMES.length]} (${cls})`;
    return { stt, name };
  });
});

// Full 39 Individual Criteria Categories
export const INDIVIDUAL_CRITERIA_GROUPS: CriterionGroup[] = [
  {
    category: 'I. TIÊU CHÍ HỌC TẬP',
    items: [
      { code: '1.1', name: 'KTB, KCB', points: -5 },
      { code: '1.2', name: 'KLBT, KCBDCHT', points: -5 },
      { code: '1.3', name: 'KTHNVHT', points: -5 },
      { code: '1.4', name: 'Điểm kém', points: -5 },
      { code: '1.5', name: 'Ghi nợ', points: -5 },
      { code: '2.5', name: 'Cúp tiết học', points: -10 },
      { code: '3', name: 'Sử dụng tài liệu, gian lận kiểm tra', points: -20 },
    ]
  },
  {
    category: 'II. ĐẠO ĐỨC - NỀ NẾP',
    items: [
      { code: '11', name: 'Vắng có phép', points: -1 },
      { code: '12', name: 'Vắng không phép', points: -5 },
      { code: '13', name: 'Đến lớp trễ', points: -5 },
      { code: '14', name: 'Nói chuyện, làm mất trật tự, làm việc riêng', points: -5 },
      { code: '15', name: 'Đồng phục, giày dép, dây nịt, phù hiệu không đúng quy định', points: -5 },
      { code: '16', name: 'Tô son, đánh phấn, sơn móng tay, móng chân', points: -10 },
      { code: '17', name: 'Lớp ồn trong giờ học, giờ trống tiết, không nghiêm túc khi KT', points: -20 },
      { code: '18', name: 'Để xe không đúng nơi quy định', points: -20 },
      { code: '19', name: 'Cư xử thiếu văn hóa: nói tục, chửi thề, xúc phạm danh dự', points: -20 },
      { code: '20', name: 'Ăn mặc phản cảm, xăm hình, nhuộm tóc sai quy định', points: -20 },
      { code: '21', name: 'Không hợp tác với Đội Trực cờ đỏ', points: -20 },
      { code: '22', name: 'Cúp tiết chào cờ đầu tuần', points: -20 },
      { code: '23', name: 'Vô lễ với thầy cô, người lớn tuổi', points: -20 },
      { code: '24', name: 'Sử dụng điện thoại sai quy định', points: -20 },
      { code: '25', name: 'Vi phạm An toàn giao thông - Trật tự xã hội', points: -30 },
    ]
  },
  {
    category: 'III. LAO ĐỘNG',
    items: [
      { code: '26', name: 'Không có khăn trải bàn, bình hoa, khăn lau bảng', points: -10 },
      { code: '27', name: 'Vệ sinh lớp không sạch, không đổ rác, còn rác ngăn bàn', points: -10 },
      { code: '28', name: 'Không lau bảng hoặc lau bảng không sạch', points: -10 },
      { code: '29', name: 'Mang thức ăn, hộp xốp, mì ly vào phòng học', points: -20 },
      { code: '30', name: 'Phá hoại tài sản, vứt rác bừa bãi, vẽ bẩn lên bàn ghế', points: -20 },
      { code: '31', name: 'Trực vệ sinh theo lịch: Trực không tốt', points: -20 },
      { code: '32', name: 'Trực vệ sinh theo lịch: Bỏ trực vệ sinh', points: -30 },
      { code: '33', name: 'Không tắt đèn, quạt, cửa sổ khi ra khỏi phòng', points: -30 },
      { code: '34', name: 'Trực sân lễ, SHDC: Dọn dẹp không tốt', points: -20 },
      { code: '35', name: 'Trực sân lễ, SHDC: Bị nhắc nhở hoặc không trực', points: -30 },
      { code: '36', name: 'Lao động trường: Không mang đầy đủ dụng cụ', points: -20 },
      { code: '37', name: 'Lao động trường: Không tham gia lao động', points: -30 },
    ]
  },
  {
    category: 'IV. CÁC HOẠT ĐỘNG PHONG TRÀO',
    items: [
      { code: '38', name: 'Tham gia từ 50% sĩ số lớp trở lên', points: 30 },
      { code: '39', name: 'Tham gia dưới 50% sĩ số lớp', points: -30 },
    ]
  }
];

// Common evaluation criteria items (4-10)
export const COMMON_CRITERIA_MAP: Record<string, { label: string; points: number; type: 'bonus' | 'penalty' }> = {
  '4': { label: '4. Tiết tốt (+10đ)', points: 10, type: 'bonus' },
  '5': { label: '5. Tiết KĐ/KĐK (-5đ)', points: -5, type: 'penalty' },
  '6': { label: '6. Tiết B (-3đ)', points: -3, type: 'penalty' },
  '7': { label: '7. Tiết C (-10đ)', points: -10, type: 'penalty' },
  '8': { label: '8. Điểm 8 (+1đ)', points: 1, type: 'bonus' },
  '9': { label: '9. Điểm 9 (+2đ)', points: 2, type: 'bonus' },
  '10': { label: '10. Điểm 10 (+3đ)', points: 3, type: 'bonus' },
};

// ==========================================
// 2. MAIN APP COMPONENT
// ==========================================

export default function App() {
  // Auth state
  const [user, setUser] = useState<UserAccount | null>(() => {
    const savedSession = localStorage.getItem('thpt_thi_dua_user_session');
    if (savedSession) {
      try { return JSON.parse(savedSession); } catch (e) { console.error(e); }
    }
    return null;
  });

  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [loginSelectedAccount, setLoginSelectedAccount] = useState<string>('10A1');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // App navigation & week
  const [activeTab, setActiveTab] = useState<'input' | 'summary' | 'students' | 'report'>('summary');
  const [currentWeek, setCurrentWeek] = useState<number>(6);
  const [targetClass, setTargetClass] = useState<string>('10A1');

  // Auto lock detection
  const [isSystemLocked, setIsSystemLocked] = useState<boolean>(false);

  // Student list tab state
  const [studentTabClass, setStudentTabClass] = useState<string>('10A1');
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');

  // Class summary tab view target
  const [summaryViewClass, setSummaryViewClass] = useState<string>('10A1');

  // SBD input buffer per criterion
  const [sbdInputs, setSbdInputs] = useState<Record<string, string>>({});

  // Student picker modal
  const [activeModalCode, setActiveModalCode] = useState<string | null>(null);

  // Database Store
  const [dataStore, setDataStore] = useState<Record<number, Record<string, ClassWeekData>>>(() => {
    const saved = localStorage.getItem('thpt_thi_dua_db_react');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return {};
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(true);

  // Realtime Sync Listener
  useEffect(() => {
    const dbRef = ref(db, 'thi_dua_data');
    const unsubscribe = onValue(dbRef, (snapshot) => {
      const val = snapshot.val();
      if (val) {
        setDataStore(val);
        localStorage.setItem('thpt_thi_dua_db_react', JSON.stringify(val));
      }
      setIsSyncing(false);
    }, (err) => {
      console.error("Lỗi đồng bộ Firebase:", err);
      setIsSyncing(false);
    });

    return () => unsubscribe();
  }, []);

  // Check locking
  useEffect(() => {
    const now = new Date();
    const day = now.getDay();
    const hour = now.getHours();

    let locked = false;
    if (day === 5 && hour >= 21) locked = true;
    if (day === 6 || day === 0) locked = true;

    setIsSystemLocked(locked);
  }, []);

  // Helper: Get data for a class
  const getWeekClassData = (week: number, cls: string): ClassWeekData => {
    if (!dataStore[week] || !dataStore[week][cls]) {
      return {
        common: { '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 },
        individual: {},
        isEvaluated: false
      };
    }
    return dataStore[week][cls];
  };

  // Helper Score Calculation (Khởi điểm 100đ)
  const calculateClassScore = (week: number, cls: string): { score: number; isEvaluated: boolean } => {
    const BASE_SCORE = 100;
    const cData = getWeekClassData(week, cls);

    // Kiểm tra xem lớp đã có tương tác chấm điểm nào chưa
    const hasCommon = Object.values(cData.common || {}).some(v => v > 0);
    const hasIndividual = Object.values(cData.individual || {}).some(arr => arr && arr.length > 0);
    const isEvaluated = cData.isEvaluated || hasCommon || hasIndividual;

    if (!isEvaluated) {
      return { score: 0, isEvaluated: false };
    }

    let score = BASE_SCORE;

    // Common
    Object.keys(cData.common || {}).forEach((code) => {
      const qty = cData.common[code] || 0;
      const pts = COMMON_CRITERIA_MAP[code]?.points || 0;
      score += qty * pts;
    });

    // Individual
    INDIVIDUAL_CRITERIA_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        const entries = cData.individual[item.code] || [];
        score += entries.length * item.points;
      });
    });

    return { score, isEvaluated: true };
  };

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    let expectedPassword = '';
    let accountObj: UserAccount | null = null;

    if (loginSelectedAccount === 'admin') {
      expectedPassword = 'Admin@tts2026';
      accountObj = { role: 'admin', targetClass: CLASSES[0] };
    } else {
      expectedPassword = `${loginSelectedAccount}@tts2026`;
      accountObj = { role: 'class', targetClass: loginSelectedAccount };
    }

    if (loginPassword.trim() !== expectedPassword) {
      setLoginError('Mật khẩu không chính xác!');
      return;
    }

    setUser(accountObj);
    localStorage.setItem('thpt_thi_dua_user_session', JSON.stringify(accountObj));
    if (accountObj.role === 'class') {
      setTargetClass(accountObj.targetClass);
      setStudentTabClass(accountObj.targetClass);
      setSummaryViewClass(accountObj.targetClass);
    }
    setShowLoginModal(false);
    setLoginPassword('');
    setLoginError('');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('thpt_thi_dua_user_session');
  };

  // Mutation Helper
  const updateClassData = (
    week: number,
    cls: string,
    updater: (prev: ClassWeekData) => ClassWeekData
  ) => {
    const weekData = dataStore[week] || {};
    const currentClassData = weekData[cls] || {
      common: { '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0 },
      individual: {},
      isEvaluated: false
    };

    const updatedClassData = updater({ ...currentClassData, isEvaluated: true });
    
    const newStore = {
      ...dataStore,
      [week]: {
        ...weekData,
        [cls]: updatedClassData
      }
    };

    setDataStore(newStore);

    set(ref(db, `thi_dua_data/${week}/${cls}`), updatedClassData)
      .catch((err) => console.error("Lỗi khi lưu lên Firebase:", err));
  };

  // Handlers for Score Changes
  const handleUpdateCommon = (code: string, delta: number) => {
    if (!user) { setShowLoginModal(true); return; }
    if (isSystemLocked && user?.role !== 'admin') return;

    updateClassData(currentWeek, targetClass, (prev) => {
      const currentVal = prev.common[code] || 0;
      const newVal = Math.max(0, currentVal + delta);
      return {
        ...prev,
        common: { ...prev.common, [code]: newVal }
      };
    });
  };

  const handleApplySBD = (code: string) => {
    if (!user) { setShowLoginModal(true); return; }
    if (isSystemLocked && user?.role !== 'admin') return;
    const rawValue = sbdInputs[code] || '';
    if (!rawValue.trim()) return;

    const tokens = rawValue.split(/[-,\s]+/).filter(Boolean);

    updateClassData(currentWeek, targetClass, (prev) => {
      const currentEntries = prev.individual[code] || [];
      const newTokens = tokens.map((t) => t.padStart(2, '0'));
      return {
        ...prev,
        individual: { ...prev.individual, [code]: [...currentEntries, ...newTokens] }
      };
    });

    setSbdInputs((prev) => ({ ...prev, [code]: '' }));
  };

  const handleRemoveIndividualEntry = (code: string, indexToRemove: number) => {
    if (!user) return;
    if (isSystemLocked && user?.role !== 'admin') return;

    updateClassData(currentWeek, targetClass, (prev) => {
      const currentEntries = [...(prev.individual[code] || [])];
      currentEntries.splice(indexToRemove, 1);
      return {
        ...prev,
        individual: { ...prev.individual, [code]: currentEntries }
      };
    });
  };

  const handleSelectStudentModal = (stt: string) => {
    if (!activeModalCode) return;
    if (!user) { setShowLoginModal(true); return; }
    if (isSystemLocked && user?.role !== 'admin') return;

    updateClassData(currentWeek, targetClass, (prev) => {
      const currentEntries = prev.individual[activeModalCode] || [];
      return {
        ...prev,
        individual: { ...prev.individual, [activeModalCode]: [...currentEntries, stt] }
      };
    });

    setActiveModalCode(null);
  };

  // Ranked Data By Grade
  const rankedByGrade = useMemo(() => {
    const result: Record<string, Array<{ className: string; score: number; isEvaluated: boolean }>> = {};

    Object.entries(GRADE_GROUPS).forEach(([gradeName, classList]) => {
      const list = classList.map((cls) => {
        const { score, isEvaluated } = calculateClassScore(currentWeek, cls);
        return { className: cls, score, isEvaluated };
      });

      // Sắp xếp: Đã tổng kết xếp trên (điểm cao -> thấp), Chưa TK xếp dưới cùng
      list.sort((a, b) => {
        if (a.isEvaluated && !b.isEvaluated) return -1;
        if (!a.isEvaluated && b.isEvaluated) return 1;
        return b.score - a.score;
      });

      result[gradeName] = list;
    });

    return result;
  }, [dataStore, currentWeek]);

  // Total Rankings All Classes
  const allRankings = useMemo(() => {
    return CLASSES.map((cls) => {
      const { score, isEvaluated } = calculateClassScore(currentWeek, cls);
      return { className: cls, score, isEvaluated };
    }).sort((a, b) => {
      if (a.isEvaluated && !b.isEvaluated) return -1;
      if (!a.isEvaluated && b.isEvaluated) return 1;
      return b.score - a.score;
    });
  }, [dataStore, currentWeek]);

  const activeClassData = getWeekClassData(currentWeek, targetClass);
  const isEditingLocked = !user || (isSystemLocked && user?.role !== 'admin');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased">
      <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-2 sm:p-4 gap-3">

        {/* 1. TOP HEADER STRIP */}
        <header className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-slate-800 text-sm sm:text-base">
                  TUẦN {currentWeek} (19/10 - 23/10/2026)
                </span>
                {isSyncing ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 flex items-center gap-1 animate-pulse">
                    <RefreshCw className="w-3 h-3 animate-spin" /> REALTIME...
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                    🟢 ONLINE
                  </span>
                )}
                {isSystemLocked && (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> KHÓA THỨ 6 (21:00)
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 ms-auto">
            {user?.role === 'admin' && (
              <select
                value={currentWeek}
                onChange={(e) => setCurrentWeek(Number(e.target.value))}
                className="text-xs font-semibold bg-slate-100 border border-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7].map((w) => (
                  <option key={w} value={w}>Tuần {w}</option>
                ))}
              </select>
            )}

            {user ? (
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-slate-700">
                  {user.role === 'admin' ? 'ADMIN (Đoàn Trường)' : `Lớp ${user.targetClass}`}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold ms-1 border-s border-slate-300 ps-2"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all"
              >
                <LogIn className="w-4 h-4" /> Đăng Nhập
              </button>
            )}
          </div>
        </header>

        {/* 2. NAVIGATION TABS */}
        <nav className="flex bg-slate-200/80 p-1 rounded-xl gap-1 text-xs sm:text-sm font-semibold text-slate-600">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'summary' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4" /> <span>Xếp Hạng & Tổng Kết</span>
          </button>

          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'input' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <PenTool className="w-4 h-4" /> <span>Nhập Điểm Thi Đua</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'students' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" /> <span>Danh Sách Học Sinh</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'report' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4" /> <span>Báo Cáo Chào Cờ</span>
          </button>
        </nav>

        {/* 3. MAIN TAB CONTENT */}
        <main className="flex-1">

          {/* TAB 1: MẶT HÀNG ĐẦU - XẾP HẠNG (3 KHỐI) & TỔNG KẾT TỪNG LỚP */}
          {activeTab === 'summary' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
              
              {/* BÊN TRÁI: BẢNG XẾP HẠNG CHIA 3 KHỐI (LG: 5 COLUMNS) */}
              <div className="lg:col-span-5 bg-white rounded-xl shadow-sm border border-slate-200 p-3 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-800 uppercase flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 text-amber-500" /> XẾP HẠNG THEO KHỐI
                  </h2>
                  <span className="text-[11px] text-slate-400 font-medium">Khởi điểm: 100đ</span>
                </div>

                {Object.entries(rankedByGrade).map(([gradeName, classList]) => (
                  <div key={gradeName} className="space-y-1.5">
                    <div className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 flex items-center justify-between">
                      <span>{gradeName}</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {classList.filter(c => c.isEvaluated).length}/{classList.length} Lớp đã chấm
                      </span>
                    </div>

                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden text-xs">
                      {classList.map((item, index) => {
                        const rank = index + 1;
                        return (
                          <div
                            key={item.className}
                            onClick={() => setSummaryViewClass(item.className)}
                            className={`p-2 flex items-center justify-between cursor-pointer transition-colors ${
                              summaryViewClass === item.className ? 'bg-blue-50/80 font-bold' : 'hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] ${
                                item.isEvaluated && rank === 1 ? 'bg-amber-400 text-white' :
                                item.isEvaluated && rank === 2 ? 'bg-slate-300 text-slate-700' :
                                item.isEvaluated && rank === 3 ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                              }`}>
                                {item.isEvaluated ? rank : '-'}
                              </span>
                              <span className="text-slate-800">Lớp {item.className}</span>
                            </div>

                            <div>
                              {item.isEvaluated ? (
                                <span className="font-extrabold text-blue-600 text-sm">{item.score}đ</span>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-400 text-[10px] font-semibold italic">
                                  Chưa TK
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* BÊN PHẢI: TRANG TỔNG KẾT THEO LỚP (LG: 7 COLUMNS) */}
              <div className="lg:col-span-7 bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Chọn Lớp Xem Tổng Kết:</span>
                    <select
                      value={summaryViewClass}
                      onChange={(e) => setSummaryViewClass(e.target.value)}
                      className="text-xs font-bold bg-blue-600 text-white rounded-lg px-2.5 py-1 focus:outline-none"
                    >
                      {CLASSES.map((cls) => (
                        <option key={cls} value={cls}>Lớp {cls}</option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const { score, isEvaluated } = calculateClassScore(currentWeek, summaryViewClass);
                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-500 font-medium">Tổng điểm:</span>
                        {isEvaluated ? (
                          <span className="text-base font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                            {score}đ
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                            Chưa Tổng Kết
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* HIỂN THỊ CHI TIẾT TỔNG KẾT (CHỈ CÁC MỤC CÓ THAY ĐỔI) */}
                {(() => {
                  const cData = getWeekClassData(currentWeek, summaryViewClass);
                  
                  // Lọc tiêu chuẩn chung có thay đổi
                  const activeCommon = Object.keys(COMMON_CRITERIA_MAP).filter((code) => (cData.common[code] || 0) > 0);

                  // Lọc vi phạm riêng có thay đổi
                  const activeIndividual: Array<{ code: string; name: string; points: number; entries: string[] }> = [];
                  INDIVIDUAL_CRITERIA_GROUPS.forEach((group) => {
                    group.items.forEach((item) => {
                      const entries = cData.individual[item.code] || [];
                      if (entries.length > 0) {
                        activeIndividual.push({
                          code: item.code,
                          name: item.name,
                          points: item.points,
                          entries
                        });
                      }
                    });
                  });

                  if (activeCommon.length === 0 && activeIndividual.length === 0) {
                    return (
                      <div className="text-center py-12 space-y-2">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto opacity-80" />
                        <p className="text-xs font-bold text-slate-700">Lớp {summaryViewClass} duy trì nề nếp hoàn hảo!</p>
                        <p className="text-[11px] text-slate-400">Chưa ghi nhận điểm trừ hoặc vi phạm nào trong Tuần {currentWeek}.</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4 text-xs">
                      {/* Tiêu chuẩn tiết học & tuyên dương */}
                      {activeCommon.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="font-bold text-blue-700 text-xs uppercase flex items-center gap-1 border-s-2 border-blue-600 ps-2">
                            1. Tiết Học & Tuyên Dương
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activeCommon.map((code) => {
                              const item = COMMON_CRITERIA_MAP[code];
                              const qty = cData.common[code];
                              const totalPts = qty * item.points;

                              return (
                                <div key={code} className="p-2 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                                  <span className="font-semibold text-slate-700">{item.label}</span>
                                  <span className={`font-bold ${totalPts >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {qty} lần ({totalPts > 0 ? '+' : ''}{totalPts}đ)
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Danh sách vi phạm riêng */}
                      {activeIndividual.length > 0 && (
                        <div className="space-y-2">
                          <h3 className="font-bold text-rose-700 text-xs uppercase flex items-center gap-1 border-s-2 border-rose-600 ps-2">
                            2. Danh Sách Lỗi Vi Phạm Lớp & Học Sinh
                          </h3>
                          <div className="space-y-1.5">
                            {activeIndividual.map((item) => {
                              const totalPts = item.entries.length * item.points;
                              const names = item.entries.map((stt) => {
                                if (stt === 'CLASS') return `Tập thể Lớp ${summaryViewClass}`;
                                const st = CLASS_ROSTERS[summaryViewClass]?.find((s) => s.stt === stt);
                                return st ? `${stt}.${st.name}` : `STT ${stt}`;
                              }).join(', ');

                              return (
                                <div key={item.code} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                                  <div className="flex items-center justify-between font-bold text-slate-800">
                                    <span>[{item.code}] {item.name}</span>
                                    <span className={totalPts >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                                      {totalPts > 0 ? '+' : ''}{totalPts}đ
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-600 font-medium">
                                    <strong>Ghi nhận:</strong> {names}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

            </div>
          )}

          {/* TAB 2: NHẬP ĐIỂM THI ĐUA */}
          {activeTab === 'input' && (
            <div className="space-y-3">
              {user && isSystemLocked && user.role !== 'admin' && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-amber-800 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Hệ thống đã tự động KHÓA nhập điểm sau 21:00 Thứ 6. Bạn chỉ có quyền xem.</span>
                </div>
              )}

              {user?.role === 'admin' && (
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-600 whitespace-nowrap flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-blue-600" /> ADMIN chọn lớp chấm:
                  </span>
                  <select
                    value={targetClass}
                    onChange={(e) => setTargetClass(e.target.value)}
                    className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500"
                  >
                    {CLASSES.map((c) => (
                      <option key={c} value={c}>Lớp {c}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* VÙNG CHUNG */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <ListFilter className="w-4 h-4" /> TIÊU CHUẨN THI ĐUA
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2">
                  {Object.keys(COMMON_CRITERIA_MAP).map((code) => {
                    const item = COMMON_CRITERIA_MAP[code];
                    const count = activeClassData.common[code] || 0;

                    return (
                      <div key={code} className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-700 truncate flex-1" title={item.label}>
                          {item.label}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            disabled={isEditingLocked}
                            onClick={() => handleUpdateCommon(code, -1)}
                            className="w-6 h-6 rounded-md bg-slate-200 text-slate-700 font-bold hover:bg-slate-300 disabled:opacity-40 flex items-center justify-center text-xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-extrabold text-xs text-slate-800 min-w-[16px] text-center">{count}</span>
                          <button
                            disabled={isEditingLocked}
                            onClick={() => handleUpdateCommon(code, 1)}
                            className={`w-6 h-6 rounded-md font-bold text-white disabled:opacity-40 flex items-center justify-center text-xs ${
                              item.type === 'bonus' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                            }`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* VÙNG RIÊNG */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                    <UserX className="w-4 h-4" /> TIÊU CHUẨN THI ĐUA - RIÊNG (LỖI HỌC SINH / CẢ LỚP)
                  </h2>
                </div>

                <div className="space-y-4">
                  {INDIVIDUAL_CRITERIA_GROUPS.map((group) => (
                    <div key={group.category} className="space-y-2">
                      <h3 className="text-xs font-bold uppercase text-slate-500 border-s-2 border-slate-400 ps-2">
                        {group.category}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {group.items.map((item) => {
                          const entries = activeClassData.individual[item.code] || [];
                          const ptsColor = item.points > 0 ? 'text-emerald-600' : 'text-rose-600';
                          const ptsText = item.points > 0 ? `+${item.points}đ` : `${item.points}đ`;

                          const counts: Record<string, number> = {};
                          entries.forEach((stt) => { counts[stt] = (counts[stt] || 0) + 1; });
                          const uniqueEntries = Array.from(new Set(entries));

                          return (
                            <div key={item.code} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-semibold text-slate-800 leading-snug">
                                  <span className="font-bold text-blue-700 me-1">{item.code}.</span>{item.name}
                                </span>
                                <span className={`text-xs font-bold ${ptsColor} whitespace-nowrap`}>{ptsText}</span>
                              </div>

                              <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                                <div className="flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    disabled={isEditingLocked}
                                    placeholder="Gõ SBD: 06-10-14..."
                                    value={sbdInputs[item.code] || ''}
                                    onChange={(e) => setSbdInputs({ ...sbdInputs, [item.code]: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && handleApplySBD(item.code)}
                                    className="flex-1 text-xs px-2 py-1 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100"
                                  />
                                  <button
                                    disabled={isEditingLocked}
                                    onClick={() => handleApplySBD(item.code)}
                                    className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-md disabled:opacity-40"
                                  >
                                    Thêm
                                  </button>
                                  <button
                                    disabled={isEditingLocked}
                                    onClick={() => {
                                      if (!user) setShowLoginModal(true);
                                      else setActiveModalCode(item.code);
                                    }}
                                    className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-md whitespace-nowrap disabled:opacity-40"
                                  >
                                    Chọn từ DS
                                  </button>
                                </div>

                                <div className="flex flex-wrap gap-1 min-h-[22px]">
                                  {uniqueEntries.length === 0 ? (
                                    <span className="text-[11px] text-slate-300 italic">Chưa có ghi nhận</span>
                                  ) : (
                                    uniqueEntries.map((stt) => {
                                      const index = entries.indexOf(stt);
                                      let label = '';
                                      if (stt === 'CLASS') {
                                        label = `Tập thể ${targetClass}`;
                                      } else {
                                        const student = CLASS_ROSTERS[targetClass]?.find((s) => s.stt === stt);
                                        label = student ? `${stt} ${student.name}` : `STT ${stt}`;
                                      }

                                      return (
                                        <span key={stt} className="inline-flex items-center gap-1 bg-slate-200 text-slate-800 text-[11px] font-semibold px-2 py-0.5 rounded-md border border-slate-300">
                                          {label}
                                          {counts[stt] > 1 && (
                                            <span className="bg-rose-600 text-white px-1 text-[10px] rounded-full font-bold">
                                              x{counts[stt]}
                                            </span>
                                          )}
                                          {!isEditingLocked && (
                                            <button
                                              onClick={() => handleRemoveIndividualEntry(item.code, index)}
                                              className="text-slate-400 hover:text-rose-600 ms-0.5 font-bold"
                                            >
                                              <X className="w-3 h-3" />
                                            </button>
                                          )}
                                        </span>
                                      );
                                    })
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DANH SÁCH HỌC SINH TỪNG LỚP (ĐÃ SỬA HOÀN TOÀN) */}
          {activeTab === 'students' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1">
                  {CLASSES.map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setStudentTabClass(cls)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                        cls === studentTabClass
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      Lớp {cls}
                    </button>
                  ))}
                </div>

                <div className="w-full sm:w-64 relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder={`Tìm học sinh Lớp ${studentTabClass}...`}
                    value={studentSearchTerm}
                    onChange={(e) => setStudentSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="text-xs font-bold text-slate-700">
                DANH SÁCH 35 HỌC SINH - LỚP {studentTabClass}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {(CLASS_ROSTERS[studentTabClass] || [])
                  .filter((s) => s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) || s.stt.includes(studentSearchTerm))
                  .map((s) => (
                    <div key={s.stt} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-start gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                        {s.stt}
                      </span>
                      <span className="font-bold text-slate-800 text-xs truncate">{s.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: BÁO CÁO CHÀO CỜ */}
          {activeTab === 'report' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 no-print">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Printer className="w-5 h-5 text-blue-600" /> BÁO CÁO TỔNG KẾT TỔNG HỢP
                </h2>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Printer className="w-4 h-4" /> In Báo Cáo
                </button>
              </div>

              <div className="text-center space-y-1">
                <h1 className="text-base font-extrabold uppercase text-slate-900 tracking-wide">
                  BÁO CÁO THI ĐUA HÀNG TUẦN
                </h1>
                <p className="text-xs font-semibold text-slate-600">
                  TUẦN {currentWeek} • HỌC KỲ I (2026-2027)
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-700 border-s-4 border-blue-600 ps-2">
                  I. BẢNG XẾP HẠNG CÁC LỚP
                </h3>
                <table className="w-full text-left border-collapse text-xs border border-slate-300">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-300 font-bold">
                      <th className="p-2 border-r border-slate-300 text-center w-16">XH</th>
                      <th className="p-2 border-r border-slate-300">LỚP</th>
                      <th className="p-2 text-right w-28">TỔNG ĐIỂM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {allRankings.map((item, index) => (
                      <tr key={item.className}>
                        <td className="p-2 text-center font-bold border-r border-slate-300">
                          {item.isEvaluated ? index + 1 : '-'}
                        </td>
                        <td className="p-2 font-bold border-r border-slate-300">Lớp {item.className}</td>
                        <td className="p-2 text-right font-extrabold text-slate-900">
                          {item.isEvaluated ? `${item.score}đ` : 'Chưa TK'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL ĐĂNG NHẬP */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 antialiased">
          <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm p-6 space-y-4 relative">
            <button
              type="button"
              onClick={() => { setShowLoginModal(false); setLoginError(''); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-base font-extrabold text-slate-800 pt-1">ĐĂNG NHẬP HỆ THỐNG</h2>
              <p className="text-xs text-slate-500 font-medium">Quản Lý Thi Đua Học Sinh THPT</p>
            </div>

            {loginError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs p-2.5 rounded-xl font-bold flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tài Khoản Lớp / Admin:</label>
                <select
                  value={loginSelectedAccount}
                  onChange={(e) => setLoginSelectedAccount(e.target.value)}
                  className="w-full text-xs font-semibold bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <optgroup label="Tài Khoản Quản Trị">
                    <option value="admin">Quản Trị Viên (Admin / Đoàn Trường)</option>
                  </optgroup>
                  <optgroup label="17 Tài Khoản Lớp">
                    {CLASSES.map((cls) => (
                      <option key={cls} value={cls}>Lớp {cls}</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mật khẩu:</label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Nhập mật khẩu (VD: 10A1@tts2026)..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-[0.98]"
              >
                Xác Nhận Đăng Nhập
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL PICKER CHỌN HỌC SINH */}
      {activeModalCode && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase">
                Ghi lỗi Tiêu chí {activeModalCode} (Lớp {targetClass})
              </h3>
              <button onClick={() => setActiveModalCode(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-1.5 flex-1 text-xs">
              <div
                onClick={() => handleSelectStudentModal('CLASS')}
                className="p-2.5 bg-blue-50 hover:bg-blue-100 rounded-lg cursor-pointer flex items-center justify-between text-blue-800 font-bold border border-blue-200"
              >
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" /> Tập thể Lớp {targetClass}
                </span>
                <Plus className="w-4 h-4 text-blue-600" />
              </div>

              {(CLASS_ROSTERS[targetClass] || []).map((s) => (
                <div
                  key={s.stt}
                  onClick={() => handleSelectStudentModal(s.stt)}
                  className="p-2 hover:bg-slate-100 rounded-lg cursor-pointer flex items-center justify-between text-slate-700 transition-colors"
                >
                  <span>
                    <strong className="text-slate-900 me-2">{s.stt}.</strong>{s.name}
                  </span>
                  <Plus className="w-3.5 h-3.5 text-slate-400" />
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-200 text-right">
              <button
                onClick={() => setActiveModalCode(null)}
                className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
