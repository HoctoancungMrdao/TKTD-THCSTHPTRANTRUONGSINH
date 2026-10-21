import React from 'react';
import { Award, Calendar, BookOpen, Layers, Users, Printer, RefreshCw, CheckCircle2 } from 'lucide-react';

interface HeaderProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
  activeTab: 'entry' | 'summary' | 'roster' | 'print';
  onTabChange: (tab: 'entry' | 'summary' | 'roster' | 'print') => void;
  onResetData: () => void;
  isSaved?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentWeek,
  onWeekChange,
  activeTab,
  onTabChange,
  onResetData,
  isSaved,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 border-b border-slate-100 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  Học Kỳ I • Năm Học 2026 - 2027
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">|</span>
                <span className="text-xs text-slate-500 font-medium hidden sm:inline">Đoàn Trường THPT</span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                HỆ THỐNG TỔNG KẾT THI ĐUA HÀNG TUẦN (TKTĐ)
              </h1>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            {isSaved && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã tự động lưu
              </span>
            )}
            
            <button
              onClick={() => {
                if (window.confirm('Khôi phục dữ liệu mẫu ban đầu (bao gồm ví dụ 10A1, 10A2, 10A3, 10A6)?')) {
                  onResetData();
                }
              }}
              title="Khôi phục dữ liệu mẫu ban đầu"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-blue-700 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-lg transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Dữ liệu mẫu
            </button>
          </div>
        </div>

        {/* Navigation Tabs and Week selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2">
          {/* Navigation Tabs */}
          <nav className="flex space-x-1 overflow-x-auto py-1">
            <button
              onClick={() => onTabChange('entry')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all shrink-0 ${
                activeTab === 'entry'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>1. Nhập Điểm Thi Đua (38 Tiêu chí)</span>
            </button>

            <button
              onClick={() => onTabChange('summary')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all shrink-0 ${
                activeTab === 'summary'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>2. Bảng Tổng Kết 3 Nhóm</span>
            </button>

            <button
              onClick={() => onTabChange('roster')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all shrink-0 ${
                activeTab === 'roster'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>3. Danh Sách Lớp & Học Sinh</span>
            </button>

            <button
              onClick={() => onTabChange('print')}
              className={`flex items-center gap-2 px-3.5 py-2 text-sm font-semibold rounded-lg transition-all shrink-0 ${
                activeTab === 'print'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Printer className="w-4 h-4" />
              <span>4. Báo Cáo Chào Cờ / In</span>
            </button>
          </nav>

          {/* Week selector badge */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <Calendar className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-semibold text-slate-700">Đang chọn:</span>
            <select
              value={currentWeek}
              onChange={(e) => onWeekChange(Number(e.target.value))}
              aria-label="Chọn tuần thi đua"
              className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
            >
              {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Tuần {w} ({w <= 18 ? 'HK I' : 'HK II'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
