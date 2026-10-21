import React, { useState, useMemo } from 'react';
import { X, Search, Plus, Minus, UserCheck, Trash2 } from 'lucide-react';
import { Student, Criterion } from '../types/emulation';
import { parseIndividualInput } from '../utils/emulationHelper';

interface StudentPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  criterion: Criterion;
  className: string;
  students: Student[];
  initialValue: string;
  onSave: (formattedValue: string) => void;
}

export const StudentPickerModal: React.FC<StudentPickerModalProps> = ({
  isOpen,
  onClose,
  criterion,
  className,
  students,
  initialValue,
  onSave,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Track counts per STT string (e.g. { '01': 1, '14': 2 })
  const [selectedCounts, setSelectedCounts] = useState<Record<string, number>>(() => {
    const parsed = parseIndividualInput(initialValue);
    const map: Record<string, number> = {};
    for (const stt of parsed.stts) {
      map[stt] = (map[stt] || 0) + 1;
    }
    return map;
  });

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = searchTerm.toLowerCase().trim();
    return students.filter((s) => {
      const matchStt = s.sttStr.includes(term) || s.stt.toString() === term;
      const matchSbd = s.sbd.toLowerCase().includes(term);
      const matchName = s.fullName.toLowerCase().includes(term);
      return matchStt || matchSbd || matchName;
    });
  }, [students, searchTerm]);

  // Total count of violations
  const totalCount = useMemo(() => {
    return Object.values(selectedCounts).reduce((sum, count) => sum + count, 0);
  }, [selectedCounts]);

  // Generated string (e.g. "01-32-13-05-14-14-23")
  const generatedString = useMemo(() => {
    const list: string[] = [];
    // Keep in natural STT order or chronological
    const sortedStts = Object.keys(selectedCounts).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    for (const stt of sortedStts) {
      const cnt = selectedCounts[stt];
      for (let i = 0; i < cnt; i++) {
        list.push(stt);
      }
    }
    return list.join('-');
  }, [selectedCounts]);

  const handleIncrement = (stt: string) => {
    setSelectedCounts((prev) => ({
      ...prev,
      [stt]: (prev[stt] || 0) + 1,
    }));
  };

  const handleDecrement = (stt: string) => {
    setSelectedCounts((prev) => {
      const current = prev[stt] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[stt];
        return next;
      }
      return {
        ...prev,
        [stt]: current - 1,
      };
    });
  };

  const handleClearAll = () => {
    setSelectedCounts({});
  };

  const handleConfirm = () => {
    onSave(generatedString);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-sm">
                Tiêu chí {criterion.id}
              </span>
              <span className="text-xs font-bold text-slate-500">
                {className} ({students.length} học sinh)
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${
                criterion.points > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {criterion.points > 0 ? `+${criterion.points}đ` : `${criterion.points}đ`} / lượt
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1 line-clamp-2">
              {criterion.name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Chọn học sinh vi phạm bằng cách bấm vào tên hoặc nút [+] bên dưới. Số lần vi phạm sẽ tự tổng hợp vào mã STT (2 số cuối SBD).
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Đóng cửa sổ chọn học sinh"
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Selection Bar */}
        <div className="px-5 py-3 bg-blue-50/70 border-b border-blue-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-700" />
            <span className="text-xs font-semibold text-blue-900">
              Đã ghi nhận: <strong className="text-sm font-extrabold text-blue-700">{totalCount}</strong> lượt vi phạm
            </span>
            <span className="text-xs font-bold text-rose-600">
              ({totalCount * criterion.points} điểm)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {totalCount > 0 && (
              <button
                onClick={handleClearAll}
                className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Xóa tất cả
              </button>
            )}
          </div>
        </div>

        {/* Generated formatted text preview */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Chuỗi mã STT sẽ lưu vào hệ thống:
          </div>
          <div className="font-mono text-xs font-bold text-slate-800 bg-white px-3 py-1.5 rounded-md border border-slate-300 select-all overflow-x-auto min-h-[30px] flex items-center">
            {generatedString || <span className="text-slate-400 font-normal italic">Chưa chọn học sinh nào (chuỗi trống)</span>}
          </div>
        </div>

        {/* Search input */}
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo STT (01, 25...), Mã SBD (101001, 106025) hoặc Họ và tên..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              autoFocus
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Student list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
          {filteredStudents.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Không tìm thấy học sinh nào phù hợp với từ khóa &ldquo;{searchTerm}&rdquo;
            </div>
          ) : (
            filteredStudents.map((student) => {
              const count = selectedCounts[student.sttStr] || 0;
              const isSelected = count > 0;

              return (
                <div
                  key={student.stt}
                  className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    onClick={() => handleIncrement(student.sttStr)}
                    className="flex items-center space-x-3 cursor-pointer flex-1 select-none"
                  >
                    <span
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono text-sm font-black shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {student.sttStr}
                    </span>

                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{student.fullName}</span>
                        {isSelected && (
                          <span className="text-xs bg-rose-500 text-white font-extrabold px-1.5 py-0.2 rounded-full">
                            x{count}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>Mã SBD: <strong className="font-mono text-slate-700">{student.sbd}</strong></span>
                        <span>•</span>
                        <span>STT: {student.stt}</span>
                      </div>
                    </div>
                  </div>

                  {/* Increment/Decrement buttons */}
                  <div className="flex items-center gap-1.5 shrink-0 pl-2">
                    {count > 0 && (
                      <button
                        onClick={() => handleDecrement(student.sttStr)}
                        className="w-8 h-8 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-700 flex items-center justify-center font-bold text-sm transition-colors"
                        title="Giảm 1 lần vi phạm"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => handleIncrement(student.sttStr)}
                      className={`h-8 px-2.5 rounded-lg flex items-center gap-1 font-bold text-xs transition-colors ${
                        isSelected
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700'
                      }`}
                      title="Ghi nhận vi phạm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{count > 0 ? `Thêm (+1)` : 'Chọn'}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Mẹo: Có thể nhập nhanh trực tiếp ngoài bảng dạng <code className="bg-slate-200 px-1 py-0.5 rounded-xs font-mono font-bold">01-32-13-05-14-14-23</code>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleConfirm}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              Áp dụng ({totalCount} lượt)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
