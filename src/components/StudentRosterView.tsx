import React, { useState, useMemo } from 'react';
import { Search, UserCheck, AlertTriangle, ShieldCheck, ChevronRight, Filter } from 'lucide-react';
import { ClassInfo, ClassWeekRecord, Student } from '../types/emulation';
import { CRITERIA_LIST } from '../data/criteria';

interface StudentRosterViewProps {
  currentWeek: number;
  classes: ClassInfo[];
  selectedClassId: string;
  onSelectClass: (classId: string) => void;
  record: ClassWeekRecord;
  onJumpToCriterion: (criterionId: number) => void;
}

export const StudentRosterView: React.FC<StudentRosterViewProps> = ({
  currentWeek,
  classes,
  selectedClassId,
  onSelectClass,
  record,
  onJumpToCriterion,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [onlyViolating, setOnlyViolating] = useState(false);

  const currentClass = classes.find((c) => c.id === selectedClassId) || classes[0];

  // Map violations per student for current week
  const studentViolations = useMemo(() => {
    const map: Record<string, { criterionId: number; criterionName: string; count: number; points: number }[]> = {};

    if (!record || !record.criteriaRecords) return map;

    Object.values(record.criteriaRecords).forEach((cr) => {
      const criterion = CRITERIA_LIST.find((c) => c.id === cr.criterionId);
      if (!criterion || criterion.type !== 'individual') return;

      // cr.studentStts contains list of stts
      const counts: Record<string, number> = {};
      cr.studentStts.forEach((stt) => {
        counts[stt] = (counts[stt] || 0) + 1;
      });

      Object.entries(counts).forEach(([stt, cnt]) => {
        if (!map[stt]) map[stt] = [];
        map[stt].push({
          criterionId: criterion.id,
          criterionName: criterion.name,
          count: cnt,
          points: cnt * criterion.points,
        });
      });
    });

    return map;
  }, [record]);

  // Filter students
  const filteredStudents = useMemo(() => {
    return currentClass.students.filter((student) => {
      const violations = studentViolations[student.sttStr] || [];
      if (onlyViolating && violations.length === 0) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase().trim();
      const matchName = student.fullName.toLowerCase().includes(term);
      const matchStt = student.sttStr.includes(term) || student.stt.toString() === term;
      const matchSbd = student.sbd.toLowerCase().includes(term);
      return matchName || matchStt || matchSbd;
    });
  }, [currentClass, studentViolations, onlyViolating, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                Tra Cứu Học Sinh & Mã SBD
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Tuần {currentWeek} • {currentClass.name}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Danh Sách Học Sinh: {currentClass.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mỗi học sinh có mã SBD gồm tiền tố lớp và 2 ký tự cuối là số thứ tự (STT). Khi nhập vi phạm chỉ cần gõ 2 số cuối (STT) cách nhau bằng dấu gạch ngang.
            </p>
          </div>

          {/* Class switcher buttons */}
          <div className="flex flex-wrap gap-1.5 shrink-0">
            {classes.map((cls) => {
              const isSelected = cls.id === currentClass.id;
              return (
                <button
                  key={cls.id}
                  onClick={() => onSelectClass(cls.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {cls.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Filter and search controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-100">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo STT (01, 25...), Mã SBD (101001, 106025) hoặc Họ tên..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => setOnlyViolating(!onlyViolating)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              onlyViolating
                ? 'bg-rose-100 text-rose-800 border border-rose-300'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Chỉ xem học sinh có vi phạm trong tuần</span>
          </button>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 text-center w-16">STT</th>
                <th className="py-3 px-4 w-32 font-mono">Mã SBD</th>
                <th className="py-3 px-4">Họ và Tên Học Sinh</th>
                <th className="py-3 px-4">Ghi Nhận Vi Phạm Tuần {currentWeek}</th>
                <th className="py-3 px-4 text-center w-28">Tổng Trừ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    Không tìm thấy học sinh nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const violations = studentViolations[student.sttStr] || [];
                  const totalPenalty = violations.reduce((s, v) => s + Math.abs(v.points), 0);
                  const hasViolation = violations.length > 0;

                  return (
                    <tr
                      key={student.stt}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        hasViolation ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-mono font-black text-sm text-slate-800">
                        <span className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 inline-flex items-center justify-center">
                          {student.sttStr}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        <span className="bg-slate-100 text-blue-800 px-2 py-1 rounded-md text-xs border border-slate-200">
                          {student.sbd}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-sm text-slate-900">
                          {student.fullName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Lớp {currentClass.name} • 2 số cuối SBD: <strong className="font-mono text-slate-600">{student.sttStr}</strong>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {violations.length === 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 text-xs font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Không vi phạm
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {violations.map((v, idx) => (
                              <button
                                key={idx}
                                onClick={() => onJumpToCriterion(v.criterionId)}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors"
                                title="Nhấn để xem hoặc sửa tiêu chí này"
                              >
                                <span>TC {v.criterionId}: {v.criterionName}</span>
                                {v.count > 1 && (
                                  <span className="bg-rose-600 text-white text-[10px] px-1 rounded-full font-bold">
                                    x{v.count}
                                  </span>
                                )}
                                <span className="text-rose-700 font-mono font-bold">({v.points}đ)</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {hasViolation ? (
                          <span className="font-black text-rose-600 text-sm">
                            -{totalPenalty}đ
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">0đ</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
