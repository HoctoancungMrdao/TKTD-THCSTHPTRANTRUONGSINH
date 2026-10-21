import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { CriteriaInputTable } from './components/CriteriaInputTable';
import { GroupSummaryTable } from './components/GroupSummaryTable';
import { StudentRosterView } from './components/StudentRosterView';
import { PrintReportModal } from './components/PrintReportModal';
import { ClassInfo, ClassWeekRecord } from './types/emulation';
import { INITIAL_CLASSES } from './data/rosters';
import { SAMPLE_WEEK_RECORDS } from './data/sampleData';
import { 
  createEmptyWeekRecord, 
  calculateWeekRecordTotals,
  calculateCriterionPoints 
} from './utils/emulationHelper';
import { CRITERIA_LIST } from './data/criteria';

const STORAGE_KEY = 'tktd_weekly_records_v1';

export default function App() {
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [selectedClassId, setSelectedClassId] = useState<string>('10A1');
  const [activeTab, setActiveTab] = useState<'entry' | 'summary' | 'roster' | 'print'>('entry');
  const [classes] = useState<ClassInfo[]>(INITIAL_CLASSES);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);

  // Records map: key is `w${week}_${classId}`
  const [records, setRecords] = useState<Record<string, ClassWeekRecord>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore parse error
    }
    return SAMPLE_WEEK_RECORDS;
  });

  // Save to localStorage when records change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      setIsSaved(true);
      const timer = setTimeout(() => setIsSaved(false), 2500);
      return () => clearTimeout(timer);
    } catch {
      // localStorage error fallback
    }
  }, [records]);

  // Current active class object
  const currentClass = useMemo(() => {
    return classes.find((c) => c.id === selectedClassId) || classes[0];
  }, [classes, selectedClassId]);

  // Current active record for current class and week
  const currentRecord = useMemo(() => {
    const key = `w${currentWeek}_${selectedClassId}`;
    if (records[key]) {
      return records[key];
    }
    return createEmptyWeekRecord(selectedClassId, currentWeek);
  }, [records, currentWeek, selectedClassId]);

  // Update a single criterion record for the active class and week
  const handleUpdateCriterionRecord = useCallback(
    (criterionId: number, rawInput: string, count: number, stts: string[]) => {
      const criterion = CRITERIA_LIST.find((c) => c.id === criterionId);
      if (!criterion) return;

      setRecords((prev) => {
        const key = `w${currentWeek}_${selectedClassId}`;
        const existing = prev[key] || createEmptyWeekRecord(selectedClassId, currentWeek);

        const newCriteriaRecords = {
          ...existing.criteriaRecords,
          [criterionId]: {
            criterionId,
            count,
            rawInput,
            studentStts: stts,
            totalPoints: calculateCriterionPoints(criterion, count),
          },
        };

        const updatedRecord: ClassWeekRecord = {
          ...existing,
          criteriaRecords: newCriteriaRecords,
          updatedAt: new Date().toISOString(),
        };

        const totals = calculateWeekRecordTotals(updatedRecord);
        updatedRecord.bonusScore = totals.bonusScore;
        updatedRecord.penaltyScore = totals.penaltyScore;
        updatedRecord.totalScore = totals.totalScore;

        return {
          ...prev,
          [key]: updatedRecord,
        };
      });
    },
    [currentWeek, selectedClassId]
  );

  // Reset to initial sample data
  const handleResetData = () => {
    setRecords(SAMPLE_WEEK_RECORDS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_WEEK_RECORDS));
    setIsSaved(true);
  };

  // Jump to edit class
  const handleSelectClassForEdit = (classId: string) => {
    setSelectedClassId(classId);
    setActiveTab('entry');
  };

  // Jump to specific criterion from roster view
  const handleJumpToCriterion = (_criterionId: number) => {
    setActiveTab('entry');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentWeek={currentWeek}
        onWeekChange={(w) => setCurrentWeek(w)}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'print') {
            setIsPrintModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onResetData={handleResetData}
        isSaved={isSaved}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6">
        {activeTab === 'entry' && (
          <CriteriaInputTable
            currentWeek={currentWeek}
            currentClass={currentClass}
            allClasses={classes}
            onSelectClass={(id) => setSelectedClassId(id)}
            record={currentRecord}
            onUpdateCriterionRecord={handleUpdateCriterionRecord}
            onViewSummary={() => setActiveTab('summary')}
          />
        )}

        {activeTab === 'summary' && (
          <GroupSummaryTable
            currentWeek={currentWeek}
            records={records}
            allClasses={classes}
            onSelectClassForEdit={handleSelectClassForEdit}
            onOpenPrint={() => setIsPrintModalOpen(true)}
          />
        )}

        {activeTab === 'roster' && (
          <StudentRosterView
            currentWeek={currentWeek}
            classes={classes}
            selectedClassId={selectedClassId}
            onSelectClass={(id) => setSelectedClassId(id)}
            record={currentRecord}
            onJumpToCriterion={handleJumpToCriterion}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>TKTĐ Tuần</strong> • Đoàn Trường THPT • Hệ thống thi đua 3 nhóm theo 38 tiêu chuẩn
          </div>
          <div>
            Hỗ trợ nhập lỗi cá nhân theo 2 số cuối SBD (STT) • Mẫu lớp 10A1, 10A2, 10A3, 10A6
          </div>
        </div>
      </footer>

      {/* Print Report Modal */}
      {isPrintModalOpen && (
        <PrintReportModal
          currentWeek={currentWeek}
          records={records}
          allClasses={classes}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
}
