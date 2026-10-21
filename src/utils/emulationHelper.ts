import { Criterion, CriterionRecord, ClassWeekRecord, Student } from '../types/emulation';
import { CRITERIA_LIST } from '../data/criteria';

/**
 * Parses raw input string into clean list of 2-digit STTs
 * Accepts formats:
 * - "01-32-13-05-14-14-23"
 * - "1, 32, 13, 5, 14, 14, 23"
 * - "01 32 13 05 14"
 * - "106025" -> extracts 25
 */
export function parseIndividualInput(rawInput: string): {
  stts: string[];
  normalizedString: string;
  count: number;
} {
  if (!rawInput || typeof rawInput !== 'string') {
    return { stts: [], normalizedString: '', count: 0 };
  }

  // Find all 1 to 6 digit numbers (if user types 6-digit SBD like 101001 or 106025, extract last 2 digits)
  const matches = rawInput.match(/\d+/g) || [];
  const stts: string[] = [];

  for (const m of matches) {
    if (m.length >= 4) {
      // It's likely a full SBD like 101025 or 106025 -> last 2 digits
      const lastTwo = m.slice(-2);
      const num = parseInt(lastTwo, 10);
      if (!isNaN(num) && num > 0) {
        stts.push(num.toString().padStart(2, '0'));
      }
    } else {
      const num = parseInt(m, 10);
      if (!isNaN(num) && num > 0 && num <= 99) {
        stts.push(num.toString().padStart(2, '0'));
      }
    }
  }

  const normalizedString = stts.join('-');
  return {
    stts,
    normalizedString,
    count: stts.length,
  };
}

/**
 * Maps STTs to student info and counts frequency
 */
export function mapSttsToStudents(
  stts: string[],
  classStudents: Student[]
): {
  stt: string;
  count: number;
  student?: Student;
}[] {
  const counts: Record<string, number> = {};
  for (const stt of stts) {
    counts[stt] = (counts[stt] || 0) + 1;
  }

  const uniqueStts = Object.keys(counts).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));

  return uniqueStts.map((stt) => {
    const student = classStudents.find((s) => s.sttStr === stt || s.stt === parseInt(stt, 10));
    return {
      stt,
      count: counts[stt],
      student,
    };
  });
}

/**
 * Calculates a single criterion score
 */
export function calculateCriterionPoints(criterion: Criterion, count: number): number {
  return count * criterion.points;
}

/**
 * Calculates full class week record totals
 */
export function calculateWeekRecordTotals(
  record: ClassWeekRecord,
  criteriaList: Criterion[] = CRITERIA_LIST
): {
  bonusScore: number;
  penaltyScore: number;
  totalScore: number;
  violationCount: number;
  goodDeedCount: number;
} {
  let bonusScore = 0;
  let penaltyScore = 0;
  let violationCount = 0;
  let goodDeedCount = 0;

  for (const criterion of criteriaList) {
    const cRecord = record.criteriaRecords[criterion.id];
    if (!cRecord || cRecord.count <= 0) continue;

    const points = cRecord.count * criterion.points;

    if (criterion.points > 0) {
      bonusScore += points;
      goodDeedCount += cRecord.count;
    } else {
      penaltyScore += Math.abs(points);
      violationCount += cRecord.count;
    }
  }

  const base = record.baseScore || 500;
  const totalScore = base + bonusScore - penaltyScore;

  return {
    bonusScore,
    penaltyScore,
    totalScore,
    violationCount,
    goodDeedCount,
  };
}

/**
 * Create an empty ClassWeekRecord for a class and week
 */
export function createEmptyWeekRecord(classId: string, weekNumber: number, baseScore = 500): ClassWeekRecord {
  const criteriaRecords: Record<number, CriterionRecord> = {};
  for (const c of CRITERIA_LIST) {
    criteriaRecords[c.id] = {
      criterionId: c.id,
      count: 0,
      rawInput: '',
      studentStts: [],
      totalPoints: 0,
    };
  }

  return {
    classId,
    weekNumber,
    baseScore,
    criteriaRecords,
    bonusScore: 0,
    penaltyScore: 0,
    totalScore: baseScore,
    updatedAt: new Date().toISOString(),
  };
}
