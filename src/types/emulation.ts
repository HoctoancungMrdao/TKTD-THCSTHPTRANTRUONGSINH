export type CriterionType = 'general' | 'individual';

export type CriterionCategory = 
  | 'hoc_tap' 
  | 'dao_duc_ne_nep' 
  | 'lao_dong' 
  | 'phong_trao';

export interface Criterion {
  id: number;
  code: string;
  name: string;
  category: CriterionCategory;
  categoryName: string;
  subCategory?: string;
  points: number; // positive for bonus, negative for deduction
  type: CriterionType;
  unit: string; // 'tiết', 'điểm', 'lần', 'lượt'
  description?: string;
}

export interface Student {
  stt: number; // 1 to 60 (formatted as '01', '02', etc.)
  sttStr: string; // '01', '02', ...
  sbd: string; // '101001', '106025', etc.
  fullName: string;
  gender?: 'Nam' | 'Nữ';
  dob?: string;
}

export interface ClassInfo {
  id: string; // '10A1', '10A2', etc.
  name: string;
  grade: 10 | 11 | 12;
  groupId: 1 | 2 | 3;
  teacherName?: string;
  students: Student[];
}

export interface EmulationGroup {
  id: 1 | 2 | 3;
  name: string;
  classIds: string[];
  color: string;
}

export interface CriterionRecord {
  criterionId: number;
  count: number; // For general: quantity. For individual: number of STTs
  rawInput: string; // e.g. "01-32-13-05-14-14-23" or "3"
  studentStts: string[]; // ['01', '32', '13', '05', '14', '14', '23']
  totalPoints: number; // count * criterion.points
}

export interface ClassWeekRecord {
  classId: string;
  weekNumber: number;
  baseScore: number; // default 500
  criteriaRecords: Record<number, CriterionRecord>;
  bonusScore: number;
  penaltyScore: number;
  totalScore: number;
  note?: string;
  updatedAt: string;
}

export interface WeekRankItem {
  classId: string;
  className: string;
  groupId: 1 | 2 | 3;
  baseScore: number;
  bonusScore: number;
  penaltyScore: number;
  totalScore: number;
  groupRank: number;
  schoolRank: number;
  violationCount: number;
  goodDeedCount: number;
}
