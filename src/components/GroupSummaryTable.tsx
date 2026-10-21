import React, { useState } from 'react';
import { 
  Trophy, 
  Award, 
  Medal, 
  TrendingUp, 
  AlertCircle, 
  Edit3, 
  ArrowRight, 
  CheckCircle,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { ClassInfo, ClassWeekRecord, WeekRankItem } from '../types/emulation';
import { EMULATION_GROUPS } from '../data/groups';

interface GroupSummaryTableProps {
  currentWeek: number;
  records: Record<string, ClassWeekRecord>;
  allClasses: ClassInfo[];
  onSelectClassForEdit: (classId: string) => void;
  onOpenPrint: () => void;
}

export const GroupSummaryTable: React.FC<GroupSummaryTableProps> = ({
  currentWeek,
  records,
  allClasses,
  onSelectClassForEdit,
  onOpenPrint,
}) => {
  const [selectedGroupTab, setSelectedGroupTab] = useState<'all' | 1 | 2 | 3>('all');

  // Compute rank items for all classes in current week
  const rankItems: WeekRankItem[] = allClasses.map((cls) => {
    const key = `w${currentWeek}_${cls.id}`;
    const rec = records[key] || {
      classId: cls.id,
      weekNumber: currentWeek,
      baseScore: 500,
      criteriaRecords: {},
      bonusScore: 0,
      penaltyScore: 0,
      totalScore: 500,
      updatedAt: '',
    };

    let violationCount = 0;
    let goodDeedCount = 0;
    if (rec.criteriaRecords) {
      Object.values(rec.criteriaRecords).forEach((cr) => {
        if (cr.count > 0) {
          if (cr.totalPoints > 0) goodDeedCount += cr.count;
          else if (cr.totalPoints < 0) violationCount += cr.count;
        }
      });
    }

    return {
      classId: cls.id,
      className: cls.name,
      groupId: cls.groupId,
      baseScore: rec.baseScore || 500,
      bonusScore: rec.bonusScore || 0,
      penaltyScore: rec.penaltyScore || 0,
      totalScore: rec.totalScore ?? 500,
      groupRank: 0,
      schoolRank: 0,
      violationCount,
      goodDeedCount,
    };
  });

  // Calculate school-wide ranks
  const sortedSchool = [...rankItems].sort((a, b) => b.totalScore - a.totalScore);
  sortedSchool.forEach((item, index) => {
    item.schoolRank = index + 1;
  });

  // Calculate group ranks for each group
  const groupedData: Record<number, WeekRankItem[]> = { 1: [], 2: [], 3: [] };
  [1, 2, 3].forEach((gId) => {
    const items = rankItems.filter((i) => i.groupId === gId);
    items.sort((a, b) => b.totalScore - a.totalScore);
    items.forEach((item, index) => {
      item.groupRank = index + 1;
    });
    groupedData[gId] = items;
  });

  // Best of each group
  const topGroup1 = groupedData[1][0];
  const topGroup2 = groupedData[2][0];
  const topGroup3 = groupedData[3][0];
  const schoolChampion = sortedSchool[0];

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-800 border border-amber-300 shadow-2xs">
          <Trophy className="w-3.5 h-3.5 text-amber-600" />
          Hạng 1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-slate-200 text-slate-800 border border-slate-300">
          <Medal className="w-3.5 h-3.5 text-slate-600" />
          Hạng 2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
          <Medal className="w-3.5 h-3.5 text-orange-600" />
          Hạng 3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold bg-slate-100 text-slate-600">
        {rank}
      </span>
    );
  };

  const exportToCsv = () => {
    let csv = '\uFEFF'; // UTF-8 BOM
    csv += `BẢNG TỔNG KẾT THI ĐUA TUẦN ${currentWeek} - NĂM HỌC 2026-2027\n\n`;
    csv += 'Nhóm,Xếp hạng nhóm,Lớp,Điểm chuẩn,Điểm cộng,Điểm trừ,Tổng điểm,Hạng toàn trường\n';

    [1, 2, 3].forEach((gId) => {
      const gItems = groupedData[gId];
      gItems.forEach((item) => {
        csv += `Nhóm ${gId},${item.groupRank},${item.className},${item.baseScore},${item.bonusScore},${item.penaltyScore},${item.totalScore},${item.schoolRank}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `TKTĐ_Tuan_${currentWeek}_3_Nhom.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Highlights */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                Mục Tổng Kết Thi Đua Theo 3 Nhóm
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Tuần {currentWeek}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Bảng Tổng Kết Điểm & Xếp Hạng 3 Nhóm Thi Đua
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Tổng kết theo cơ chế 3 Nhóm Thi Đua (công văn trường THPT) gồm điểm chuẩn 500đ, điểm cộng, điểm trừ, tổng điểm và xếp hạng.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={exportToCsv}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Xuất Excel (CSV)
            </button>
            <button
              onClick={onOpenPrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              In Báo Cáo Chào Cờ
            </button>
          </div>
        </div>

        {/* Podium Leaders Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5">
          {/* Nhóm 1 Champion */}
          <div className="bg-linear-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-black uppercase text-emerald-800 tracking-wider flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                Dẫn đầu NHÓM 1
              </div>
              <div className="text-xl font-black text-emerald-950 mt-1">
                {topGroup1 ? topGroup1.className : '--'}
              </div>
              <div className="text-xs text-emerald-700 font-medium mt-0.5">
                Tổng điểm: <strong className="font-extrabold text-sm">{topGroup1?.totalScore ?? 0}đ</strong>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              1
            </div>
          </div>

          {/* Nhóm 2 Champion */}
          <div className="bg-linear-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-black uppercase text-amber-800 tracking-wider flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-amber-600" />
                Dẫn đầu NHÓM 2
              </div>
              <div className="text-xl font-black text-amber-950 mt-1">
                {topGroup2 ? topGroup2.className : '--'}
              </div>
              <div className="text-xs text-amber-700 font-medium mt-0.5">
                Tổng điểm: <strong className="font-extrabold text-sm">{topGroup2?.totalScore ?? 0}đ</strong>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-slate-900 flex items-center justify-center font-black text-lg shadow-sm">
              1
            </div>
          </div>

          {/* Nhóm 3 Champion */}
          <div className="bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-black uppercase text-indigo-800 tracking-wider flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-indigo-600" />
                Dẫn đầu NHÓM 3
              </div>
              <div className="text-xl font-black text-indigo-950 mt-1">
                {topGroup3 ? topGroup3.className : '--'}
              </div>
              <div className="text-xs text-indigo-700 font-medium mt-0.5">
                Tổng điểm: <strong className="font-extrabold text-sm">{topGroup3?.totalScore ?? 0}đ</strong>
              </div>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              1
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs for Groups */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setSelectedGroupTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedGroupTab === 'all'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          Hiển thị cả 3 Nhóm
        </button>
        <button
          onClick={() => setSelectedGroupTab(1)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedGroupTab === 1
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          Chỉ xem NHÓM 1 ({groupedData[1].length} lớp)
        </button>
        <button
          onClick={() => setSelectedGroupTab(2)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedGroupTab === 2
              ? 'bg-amber-500 text-slate-900 shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          Chỉ xem NHÓM 2 ({groupedData[2].length} lớp)
        </button>
        <button
          onClick={() => setSelectedGroupTab(3)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedGroupTab === 3
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          Chỉ xem NHÓM 3 ({groupedData[3].length} lớp)
        </button>
      </div>

      {/* Group Tables */}
      <div className="space-y-6">
        {[1, 2, 3].map((groupId) => {
          if (selectedGroupTab !== 'all' && selectedGroupTab !== groupId) return null;

          const groupMeta = EMULATION_GROUPS.find((g) => g.id === groupId);
          const groupClasses = groupedData[groupId] || [];

          const headerColorClass =
            groupId === 1
              ? 'bg-emerald-700 text-white'
              : groupId === 2
              ? 'bg-amber-500 text-slate-900'
              : 'bg-indigo-700 text-white';

          const groupSubText =
            groupId === 1
              ? '10A1, 10A2, 11A4, 11A5, 12A1'
              : groupId === 2
              ? '10A3, 11A3, 12A2, 12A3, 12A4, 12A5'
              : '10A4, 10A5, 10A6, 10A7, 11A1, 11A2';

          return (
            <div
              key={groupId}
              className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden"
            >
              {/* Group Table Header */}
              <div className={`px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${headerColorClass}`}>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <h3 className="text-base font-black uppercase tracking-wider">
                    {groupMeta?.name} - TỔNG KẾT THI ĐUA
                  </h3>
                </div>
                <div className="text-xs font-bold opacity-90">
                  Danh sách lớp: {groupSubText}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-4 text-center w-20">Hạng Nhóm</th>
                      <th className="py-3 px-4">Lớp</th>
                      <th className="py-3 px-4 text-center">Điểm Chuẩn</th>
                      <th className="py-3 px-4 text-center text-emerald-700">Điểm Cộng (+)</th>
                      <th className="py-3 px-4 text-center text-rose-700">Điểm Trừ (-)</th>
                      <th className="py-3 px-4 text-center font-black text-blue-800 text-sm">Tổng Điểm</th>
                      <th className="py-3 px-4 text-center">Hạng Toàn Trường</th>
                      <th className="py-3 px-4 text-center">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupClasses.map((item) => {
                      const isHighlighted = ['10A1', '10A2', '10A3', '10A6'].includes(item.classId);

                      return (
                        <tr
                          key={item.classId}
                          className={`hover:bg-blue-50/50 transition-colors ${
                            isHighlighted ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          <td className="py-3 px-4 text-center">
                            {getRankBadge(item.groupRank)}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-sm text-slate-900">
                                {item.className}
                              </span>
                              {isHighlighted && (
                                <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                                  Lớp mẫu
                                </span>
                              )}
                              {item.classId === '10A6' && (
                                <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded-sm">
                                  SBD 106025
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {item.violationCount > 0 ? `${item.violationCount} lượt vi phạm` : 'Không vi phạm'}
                              {item.goodDeedCount > 0 ? ` • ${item.goodDeedCount} tiết/điểm tốt` : ''}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center font-medium text-slate-600">
                            {item.baseScore}
                          </td>
                          <td className="py-3 px-4 text-center font-black text-emerald-600">
                            +{item.bonusScore}
                          </td>
                          <td className="py-3 px-4 text-center font-black text-rose-600">
                            -{item.penaltyScore}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="inline-block px-3 py-1 rounded-lg bg-blue-50 text-blue-900 font-black text-sm border border-blue-200">
                              {item.totalScore}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center font-bold text-slate-600">
                            Top {item.schoolRank}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => onSelectClassForEdit(item.classId)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 rounded-lg transition-colors border border-blue-200"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Sửa điểm</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
