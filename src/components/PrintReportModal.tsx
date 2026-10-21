import React from 'react';
import { X, Printer, Download, Award, CheckCircle } from 'lucide-react';
import { ClassInfo, ClassWeekRecord, WeekRankItem } from '../types/emulation';
import { EMULATION_GROUPS } from '../data/groups';

interface PrintReportModalProps {
  currentWeek: number;
  records: Record<string, ClassWeekRecord>;
  allClasses: ClassInfo[];
  onClose: () => void;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  currentWeek,
  records,
  allClasses,
  onClose,
}) => {
  // Compute rank items
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
      violationCount: 0,
      goodDeedCount: 0,
    };
  });

  // Calculate school-wide ranks
  const sortedSchool = [...rankItems].sort((a, b) => b.totalScore - a.totalScore);
  sortedSchool.forEach((item, index) => {
    item.schoolRank = index + 1;
  });

  // Grouped data
  const groupedData: Record<number, WeekRankItem[]> = { 1: [], 2: [], 3: [] };
  [1, 2, 3].forEach((gId) => {
    const items = rankItems.filter((i) => i.groupId === gId);
    items.sort((a, b) => b.totalScore - a.totalScore);
    items.forEach((item, index) => {
      item.groupRank = index + 1;
    });
    groupedData[gId] = items;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col max-h-[95vh] overflow-hidden border border-slate-200 print:border-none print:shadow-none print:max-w-none print:max-h-none print:w-full">
        {/* Action Header - Hidden when printing */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="font-extrabold text-slate-800 text-sm">
              Mẫu In Báo Cáo Chào Cờ Tuần {currentWeek}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              In / Xuất PDF
            </button>
            <button
              onClick={onClose}
              aria-label="Đóng cửa sổ in báo cáo"
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 overflow-y-auto print:p-0 print:overflow-visible text-slate-900 bg-white">
          {/* Header */}
          <div className="flex justify-between items-start text-xs border-b-2 border-slate-900 pb-4 mb-6">
            <div className="text-center font-bold">
              <div>SỞ GIÁO DỤC VÀ ĐÀO TẠO</div>
              <div className="font-extrabold uppercase">ĐOÀN TRƯỜNG THPT</div>
              <div className="text-[11px] font-normal italic mt-0.5">Số: ...../TKTĐ-ĐTN</div>
            </div>

            <div className="text-center font-bold">
              <div>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div className="font-semibold underline decoration-slate-400">Độc lập - Tự do - Hạnh phúc</div>
              <div className="text-[11px] font-normal italic mt-0.5">..., Ngày ... tháng 10 năm 2026</div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center my-4">
            <h1 className="text-lg font-black uppercase tracking-tight">
              BẢNG TỔNG KẾT THI ĐUA HỌC ĐƯỜNG - TUẦN {currentWeek}
            </h1>
            <p className="text-xs font-semibold text-slate-600 mt-0.5">
              HỌC KỲ I - NĂM HỌC 2026 - 2027 (THEO 3 NHÓM THI ĐUA)
            </p>
          </div>

          {/* 3 Group Tables */}
          <div className="space-y-6 my-6">
            {[1, 2, 3].map((groupId) => {
              const groupMeta = EMULATION_GROUPS.find((g) => g.id === groupId);
              const list = groupedData[groupId] || [];

              return (
                <div key={groupId} className="border border-slate-300 rounded-lg overflow-hidden">
                  <div className="bg-slate-100 px-4 py-2 font-black text-xs uppercase flex items-center justify-between border-b border-slate-300">
                    <span>{groupMeta?.name}</span>
                    <span className="text-[11px] font-normal text-slate-600">
                      Tổng số: {list.length} lớp
                    </span>
                  </div>

                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-300 text-[11px] font-bold text-slate-700">
                        <th className="py-2 px-3 text-center w-16 border-r border-slate-200">Hạng Nhóm</th>
                        <th className="py-2 px-3 border-r border-slate-200">Lớp</th>
                        <th className="py-2 px-3 text-center border-r border-slate-200">Điểm Chuẩn</th>
                        <th className="py-2 px-3 text-center border-r border-slate-200">Điểm Cộng (+)</th>
                        <th className="py-2 px-3 text-center border-r border-slate-200">Điểm Trừ (-)</th>
                        <th className="py-2 px-3 text-center border-r border-slate-200 font-black">Tổng Điểm</th>
                        <th className="py-2 px-3 text-center">Hạng Toàn Trường</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {list.map((item) => (
                        <tr key={item.classId} className={item.groupRank === 1 ? 'bg-amber-50/50 font-semibold' : ''}>
                          <td className="py-2 px-3 text-center font-bold border-r border-slate-200">
                            {item.groupRank === 1 ? 'Hạng 1 ★' : item.groupRank === 2 ? 'Hạng 2' : item.groupRank === 3 ? 'Hạng 3' : item.groupRank}
                          </td>
                          <td className="py-2 px-3 font-bold border-r border-slate-200">
                            {item.className}
                          </td>
                          <td className="py-2 px-3 text-center border-r border-slate-200">
                            {item.baseScore}
                          </td>
                          <td className="py-2 px-3 text-center border-r border-slate-200 text-emerald-700">
                            +{item.bonusScore}
                          </td>
                          <td className="py-2 px-3 text-center border-r border-slate-200 text-rose-700">
                            -{item.penaltyScore}
                          </td>
                          <td className="py-2 px-3 text-center font-black text-sm border-r border-slate-200">
                            {item.totalScore}
                          </td>
                          <td className="py-2 px-3 text-center">
                            Top {item.schoolRank}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 text-center text-xs mt-10 pt-4 border-t border-slate-200">
            <div>
              <div className="font-bold uppercase">BÍ THƯ ĐOÀN TRƯỜNG</div>
              <div className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</div>
              <div className="h-16"></div>
              <div className="font-bold">Đào Văn Khuôn</div>
            </div>

            <div>
              <div className="font-bold uppercase">HIỆU TRƯỞNG / BAN GIÁM HIỆU</div>
              <div className="text-[11px] italic text-slate-500">(Ký và đóng dấu)</div>
              <div className="h-16"></div>
              <div className="font-bold">.........................................</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
