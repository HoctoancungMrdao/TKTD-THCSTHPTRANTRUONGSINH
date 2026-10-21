import React, { useState, useMemo } from 'react';
import { 
  Search, 
  HelpCircle, 
  Users, 
  Plus, 
  Minus, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  X,
  ChevronRight,
  Calculator,
  ArrowRight
} from 'lucide-react';
import { Criterion, ClassInfo, ClassWeekRecord, CriterionCategory } from '../types/emulation';
import { CRITERIA_LIST } from '../data/criteria';
import { parseIndividualInput, mapSttsToStudents } from '../utils/emulationHelper';
import { StudentPickerModal } from './StudentPickerModal';

interface CriteriaInputTableProps {
  currentWeek: number;
  currentClass: ClassInfo;
  allClasses: ClassInfo[];
  onSelectClass: (classId: string) => void;
  record: ClassWeekRecord;
  onUpdateCriterionRecord: (
    criterionId: number, 
    rawInput: string, 
    count: number, 
    stts: string[]
  ) => void;
  onViewSummary: () => void;
}

const CATEGORY_TABS: { key: 'all' | CriterionCategory; label: string; count: number }[] = [
  { key: 'all', label: 'Tất cả tiêu chí', count: 39 },
  { key: 'hoc_tap', label: 'I. Học tập', count: 10 },
  { key: 'dao_duc_ne_nep', label: 'II. Đạo đức - Nề nếp', count: 15 },
  { key: 'lao_dong', label: 'III. Lao động', count: 12 },
  { key: 'phong_trao', label: 'IV. Phong trào', count: 2 },
];

export const CriteriaInputTable: React.FC<CriteriaInputTableProps> = ({
  currentWeek,
  currentClass,
  allClasses,
  onSelectClass,
  record,
  onUpdateCriterionRecord,
  onViewSummary,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | CriterionCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalCriterion, setActiveModalCriterion] = useState<Criterion | null>(null);

  // Group classes by group ID
  const classesByGroup = useMemo(() => {
    return {
      group1: allClasses.filter((c) => c.groupId === 1),
      group2: allClasses.filter((c) => c.groupId === 2),
      group3: allClasses.filter((c) => c.groupId === 3),
    };
  }, [allClasses]);

  // Filter criteria
  const filteredCriteria = useMemo(() => {
    return CRITERIA_LIST.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      if (!matchCat) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchName = item.name.toLowerCase().includes(q);
      const matchCode = item.code.toLowerCase().includes(q);
      const matchId = item.id.toString() === q;
      const matchDesc = item.description?.toLowerCase().includes(q) || false;
      return matchName || matchCode || matchId || matchDesc;
    });
  }, [selectedCategory, searchQuery]);

  // Handle individual raw input changes
  const handleIndividualInputChange = (criterion: Criterion, value: string) => {
    const parsed = parseIndividualInput(value);
    onUpdateCriterionRecord(criterion.id, value, parsed.count, parsed.stts);
  };

  // Quick remove single student from list
  const handleRemoveStudentStt = (criterion: Criterion, sttToRemove: string) => {
    const currentRecord = record.criteriaRecords[criterion.id];
    if (!currentRecord) return;
    const currentStts = [...currentRecord.studentStts];
    const index = currentStts.indexOf(sttToRemove);
    if (index !== -1) {
      currentStts.splice(index, 1);
      const newRaw = currentStts.join('-');
      onUpdateCriterionRecord(criterion.id, newRaw, currentStts.length, currentStts);
    }
  };

  // Handle general count changes
  const handleGeneralCountChange = (criterion: Criterion, newCount: number) => {
    const count = Math.max(0, newCount);
    onUpdateCriterionRecord(criterion.id, count.toString(), count, []);
  };

  return (
    <div className="space-y-6">
      {/* Steps Navigation Helper Banner */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-blue-800 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400 text-slate-900 font-extrabold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Quy trình 3 bước
              </span>
              <span className="text-blue-200 text-xs font-medium">
                Tuần {currentWeek} • Học kỳ I
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Nhập Điểm Thi Đua: {currentClass.name}
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl">
              Nhập số lượng cho lỗi chung (tiết tốt, tiết B/C, điểm 8/9/10, phong trào) hoặc nhập chuỗi STT 2 số cuối SBD cho lỗi cá nhân (ví dụ: <span className="font-mono bg-blue-900/60 px-1.5 py-0.5 rounded-sm font-bold text-amber-300">01-32-13-05-14-14-23</span>).
            </p>
          </div>

          {/* Quick Scoreboard Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 sm:p-4 shrink-0 flex items-center gap-4">
            <div className="text-center border-r border-white/20 pr-4">
              <div className="text-[10px] uppercase font-bold text-blue-200">Điểm chuẩn</div>
              <div className="text-lg font-black text-white">{record.baseScore}</div>
            </div>
            <div className="text-center border-r border-white/20 pr-4">
              <div className="text-[10px] uppercase font-bold text-emerald-300">Điểm cộng (+)</div>
              <div className="text-lg font-black text-emerald-300">+{record.bonusScore}</div>
            </div>
            <div className="text-center border-r border-white/20 pr-4">
              <div className="text-[10px] uppercase font-bold text-rose-300">Điểm trừ (-)</div>
              <div className="text-lg font-black text-rose-300">-{record.penaltyScore}</div>
            </div>
            <div className="text-center pl-1">
              <div className="text-[10px] uppercase font-bold text-amber-200">Tổng điểm</div>
              <div className="text-2xl font-black text-amber-300">{record.totalScore}</div>
            </div>
          </div>
        </div>

        {/* Step 2: Class Selector Pills */}
        <div className="mt-4 pt-4 border-t border-white/15">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
              <span>B2: Chọn Lớp Cần Nhập Điểm (Theo 3 Nhóm Thi Đua)</span>
            </div>
            <button
              onClick={onViewSummary}
              className="text-xs font-bold text-amber-300 hover:text-white flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              Xem ngay bảng tổng kết 3 nhóm
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Group 1 */}
            <div className="bg-black/15 rounded-xl p-2.5 border border-white/10">
              <div className="text-[11px] font-black uppercase text-emerald-300 mb-1.5 flex items-center justify-between">
                <span>NHÓM 1 (5 Lớp)</span>
                <span className="text-[10px] text-white/70">10A1, 10A2, 11A4, 11A5, 12A1</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {classesByGroup.group1.map((cls) => {
                  const isCurrent = cls.id === currentClass.id;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => onSelectClass(cls.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        isCurrent
                          ? 'bg-emerald-500 text-white shadow-md ring-2 ring-white scale-105'
                          : 'bg-white/15 text-white hover:bg-white/25'
                      }`}
                    >
                      <span>{cls.name}</span>
                      {(cls.id === '10A1' || cls.id === '10A2') && (
                        <span className="text-[10px] text-amber-300">★</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group 2 */}
            <div className="bg-black/15 rounded-xl p-2.5 border border-white/10">
              <div className="text-[11px] font-black uppercase text-amber-300 mb-1.5 flex items-center justify-between">
                <span>NHÓM 2 (6 Lớp)</span>
                <span className="text-[10px] text-white/70">10A3, 11A3, 12A2, 12A3, 12A4, 12A5</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {classesByGroup.group2.map((cls) => {
                  const isCurrent = cls.id === currentClass.id;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => onSelectClass(cls.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-900 shadow-md ring-2 ring-white scale-105'
                          : 'bg-white/15 text-white hover:bg-white/25'
                      }`}
                    >
                      <span>{cls.name}</span>
                      {cls.id === '10A3' && (
                        <span className="text-[10px] text-amber-300">★</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Group 3 */}
            <div className="bg-black/15 rounded-xl p-2.5 border border-white/10">
              <div className="text-[11px] font-black uppercase text-indigo-300 mb-1.5 flex items-center justify-between">
                <span>NHÓM 3 (6 Lớp)</span>
                <span className="text-[10px] text-white/70">10A4, 10A5, 10A6, 10A7, 11A1, 11A2</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {classesByGroup.group3.map((cls) => {
                  const isCurrent = cls.id === currentClass.id;
                  return (
                    <button
                      key={cls.id}
                      onClick={() => onSelectClass(cls.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                        isCurrent
                          ? 'bg-indigo-400 text-slate-950 shadow-md ring-2 ring-white scale-105'
                          : 'bg-white/15 text-white hover:bg-white/25'
                      }`}
                    >
                      <span>{cls.name}</span>
                      {cls.id === '10A6' && (
                        <span className="text-[10px] text-amber-300">★</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: 38 Criteria Section */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Category bar and search */}
        <div className="p-4 sm:p-5 border-b border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-700">
                B3: Bảng 38 Tiêu Chuẩn Thi Đua
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                Danh Sách Tiêu Chí & Nhập Điểm Tuần {currentWeek} - {currentClass.name}
              </h3>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm tiêu chí (VD: không thuộc bài, 01...)"
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CATEGORY_TABS.map((tab) => {
              const isActive = selectedCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Criteria List */}
        <div className="divide-y divide-slate-100">
          {filteredCriteria.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Không tìm thấy tiêu chí nào phù hợp với tìm kiếm &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            filteredCriteria.map((criterion) => {
              const currentRecord = record.criteriaRecords[criterion.id] || {
                criterionId: criterion.id,
                count: 0,
                rawInput: '',
                studentStts: [],
                totalPoints: 0,
              };

              const hasValue = currentRecord.count > 0;
              const isBonus = criterion.points > 0;
              const pointsTotal = currentRecord.count * criterion.points;

              // Recognized students for individual criterion
              const recognizedStudents = criterion.type === 'individual'
                ? mapSttsToStudents(currentRecord.studentStts, currentClass.students)
                : [];

              return (
                <div
                  key={criterion.id}
                  className={`p-4 sm:p-5 transition-colors ${
                    hasValue ? 'bg-blue-50/30' : 'hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    {/* Left info */}
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* ID badge */}
                        <span className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 font-mono text-xs font-black flex items-center justify-center shrink-0">
                          {criterion.id}
                        </span>

                        {/* Category tag */}
                        <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {criterion.categoryName}
                        </span>

                        {criterion.subCategory && (
                          <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            {criterion.subCategory}
                          </span>
                        )}

                        {/* Type indicator */}
                        <span
                          className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            criterion.type === 'individual'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-teal-50 text-teal-700 border border-teal-200'
                          }`}
                        >
                          {criterion.type === 'individual'
                            ? 'Lỗi cá nhân (Nhập STT học sinh)'
                            : 'Lỗi / Điểm chung (Nhập số lượng)'}
                        </span>

                        {/* Points badge */}
                        <span
                          className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                            isBonus
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isBonus ? `+${criterion.points}đ` : `${criterion.points}đ`} / {criterion.unit}
                        </span>
                      </div>

                      {/* Name */}
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                        {criterion.id}. {criterion.name}
                      </h4>

                      {/* Description */}
                      {criterion.description && (
                        <p className="text-xs text-slate-500 leading-relaxed">
                          {criterion.description}
                        </p>
                      )}
                    </div>

                    {/* Right Input Area */}
                    <div className="lg:w-96 shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2.5">
                      {criterion.type === 'individual' ? (
                        /* Individual Input: STT list (e.g. 01-32-13-05-14-14-23) */
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1">
                            <label className="font-bold text-slate-700 flex items-center gap-1">
                              <span>Mã STT (2 số cuối SBD):</span>
                              <span className="text-[10px] text-slate-400 font-normal">(cách nhau bằng dấu gạch ngang)</span>
                            </label>
                            <button
                              onClick={() => setActiveModalCriterion(criterion)}
                              className="text-blue-700 hover:text-blue-900 font-bold hover:underline flex items-center gap-1"
                              title="Mở danh sách học sinh để chọn nhanh bằng cách nhấn"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span>Chọn từ danh sách</span>
                            </button>
                          </div>

                          <div className="relative">
                            <input
                              type="text"
                              value={currentRecord.rawInput}
                              onChange={(e) => handleIndividualInputChange(criterion, e.target.value)}
                              placeholder="Ví dụ: 01-32-13-05-14-14-23"
                              className="w-full px-3 py-2 text-xs font-mono font-bold bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden text-slate-900 placeholder:text-slate-400 placeholder:font-normal"
                            />
                            {currentRecord.rawInput && (
                              <button
                                onClick={() => onUpdateCriterionRecord(criterion.id, '', 0, [])}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-600"
                                title="Xóa dữ liệu"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Quick hint */}
                          <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                            <span>
                              Ví dụ mẫu: <button
                                type="button"
                                onClick={() => handleIndividualInputChange(criterion, '01-32-13-05-14-14-23')}
                                className="text-blue-600 font-mono font-bold hover:underline"
                              >
                                01-32-13-05-14-14-23
                              </button>
                            </span>
                          </div>

                          {/* Recognized student chips */}
                          {recognizedStudents.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-slate-200">
                              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1 flex items-center justify-between">
                                <span>Học sinh ghi nhận ({currentRecord.count} lượt):</span>
                              </div>
                              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                                {recognizedStudents.map((item) => (
                                  <span
                                    key={item.stt}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px] font-medium text-slate-800 shadow-2xs"
                                  >
                                    <strong className="font-mono text-blue-700">
                                      {item.stt}
                                    </strong>
                                    <span>
                                      {item.student ? item.student.fullName : 'Học sinh STT ' + item.stt}
                                    </span>
                                    {item.count > 1 && (
                                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1 rounded-full">
                                        x{item.count}
                                      </span>
                                    )}
                                    <button
                                      onClick={() => handleRemoveStudentStt(criterion, item.stt)}
                                      className="text-slate-400 hover:text-rose-600 ml-0.5"
                                      title="Xóa học sinh này khỏi tiêu chí"
                                    >
                                      ×
                                    </button>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* General Input: Quantity counter */
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <label className="font-bold text-slate-700">
                              Số lượng ({criterion.unit}):
                            </label>
                            <span className="text-[11px] text-slate-500">
                              {criterion.unit}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleGeneralCountChange(criterion, currentRecord.count - 1)}
                              disabled={currentRecord.count <= 0}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center font-bold transition-colors"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>

                            <input
                              type="number"
                              min="0"
                              value={currentRecord.count}
                              onChange={(e) => handleGeneralCountChange(criterion, parseInt(e.target.value, 10) || 0)}
                              className="w-20 px-2 py-1.5 text-center text-sm font-black bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                            />

                            <button
                              type="button"
                              onClick={() => handleGeneralCountChange(criterion, currentRecord.count + 1)}
                              className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            {/* Quick presets */}
                            <div className="flex items-center gap-1 ml-auto">
                              {[0, 1, 2, 5].map((preset) => (
                                <button
                                  key={preset}
                                  type="button"
                                  onClick={() => handleGeneralCountChange(criterion, preset)}
                                  className={`px-2 py-1 text-[11px] font-bold rounded-md transition-colors ${
                                    currentRecord.count === preset
                                      ? 'bg-blue-600 text-white'
                                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                                  }`}
                                >
                                  {preset}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Point result calculation preview */}
                      <div className="flex items-center justify-between text-xs pt-1.5 border-t border-slate-200 font-medium">
                        <span className="text-slate-600">
                          Thành tiền điểm: <strong className="text-slate-800">{currentRecord.count}</strong> {criterion.unit} × {criterion.points}đ =
                        </span>
                        <span
                          className={`font-black text-sm ${
                            pointsTotal > 0
                              ? 'text-emerald-600'
                              : pointsTotal < 0
                              ? 'text-rose-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {pointsTotal > 0 ? `+${pointsTotal}` : pointsTotal} điểm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer summary bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            Tổng kết {currentClass.name}: <strong className="text-emerald-700 font-bold">+{record.bonusScore} điểm cộng</strong>,{' '}
            <strong className="text-rose-700 font-bold">-{record.penaltyScore} điểm trừ</strong>. Tổng điểm tuần: <strong className="text-blue-700 font-black text-sm">{record.totalScore}đ</strong>
          </div>

          <button
            onClick={onViewSummary}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 group"
          >
            <span>Xem Bảng Tổng Kết & Xếp Hạng 3 Nhóm</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {/* Student Picker Modal */}
      {activeModalCriterion && (
        <StudentPickerModal
          isOpen={true}
          onClose={() => setActiveModalCriterion(null)}
          criterion={activeModalCriterion}
          className={currentClass.name}
          students={currentClass.students}
          initialValue={record.criteriaRecords[activeModalCriterion.id]?.rawInput || ''}
          onSave={(formattedVal) => {
            handleIndividualInputChange(activeModalCriterion, formattedVal);
          }}
        />
      )}
    </div>
  );
};
