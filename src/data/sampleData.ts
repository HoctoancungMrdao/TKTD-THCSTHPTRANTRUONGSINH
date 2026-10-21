import { ClassWeekRecord } from '../types/emulation';
import { createEmptyWeekRecord, calculateWeekRecordTotals, parseIndividualInput } from '../utils/emulationHelper';
import { CRITERIA_LIST } from './criteria';

function buildRecord(classId: string, week: number, inputs: Record<number, string | number>): ClassWeekRecord {
  const record = createEmptyWeekRecord(classId, week);
  for (const [cidStr, val] of Object.entries(inputs)) {
    const cid = parseInt(cidStr, 10);
    const crit = CRITERIA_LIST.find((c) => c.id === cid);
    if (!crit) continue;

    if (crit.type === 'individual') {
      const raw = String(val);
      const parsed = parseIndividualInput(raw);
      record.criteriaRecords[cid] = {
        criterionId: cid,
        count: parsed.count,
        rawInput: raw,
        studentStts: parsed.stts,
        totalPoints: parsed.count * crit.points,
      };
    } else {
      const count = typeof val === 'number' ? val : parseInt(val, 10) || 0;
      record.criteriaRecords[cid] = {
        criterionId: cid,
        count,
        rawInput: count.toString(),
        studentStts: [],
        totalPoints: count * crit.points,
      };
    }
  }

  const totals = calculateWeekRecordTotals(record);
  record.bonusScore = totals.bonusScore;
  record.penaltyScore = totals.penaltyScore;
  record.totalScore = totals.totalScore;
  return record;
}

export const SAMPLE_WEEK_RECORDS: Record<string, ClassWeekRecord> = {
  // 10A1 (Nhóm 1) - có ví dụ mẫu 01-32-13-05-14-14-23
  'w1_10A1': buildRecord('10A1', 1, {
    1: '01-32-13-05-14-14-23', // 7 lượt KTB = -35đ
    4: 8, // 8 tiết tốt = +80đ
    8: 12, // 12 điểm 8 = +12đ
    9: 8, // 8 điểm 9 = +16đ
    10: 4, // 4 điểm 10 = +12đ
    13: '09-17', // Đi trễ 2 lượt = -10đ
    14: '03-24-38', // Nói chuyện 3 lượt = -15đ
    38: 1, // Phong trào >50% = +30đ
  }),

  // 10A2 (Nhóm 1)
  'w1_10A2': buildRecord('10A2', 1, {
    1: '06-12', // 2 lượt KTB = -10đ
    4: 10, // 10 tiết tốt = +100đ
    8: 15, // 15 điểm 8 = +15đ
    9: 11, // 11 điểm 9 = +22đ
    10: 7, // 7 điểm 10 = +21đ
    11: '02-19', // Vắng có phép = -2đ
    15: '21', // Đồng phục = -5đ
    38: 1, // Phong trào = +30đ
  }),

  // 11A4 (Nhóm 1)
  'w1_11A4': buildRecord('11A4', 1, {
    4: 9,
    8: 10,
    9: 7,
    10: 3,
    1: '04-18',
    14: '12',
  }),

  // 11A5 (Nhóm 1)
  'w1_11A5': buildRecord('11A5', 1, {
    4: 7,
    8: 8,
    9: 6,
    10: 2,
    1: '05-11-20',
    6: 1, // Tiết B
  }),

  // 12A1 (Nhóm 1)
  'w1_12A1': buildRecord('12A1', 1, {
    4: 11,
    8: 18,
    9: 14,
    10: 9,
    1: '02',
    38: 1,
  }),

  // 10A3 (Nhóm 2)
  'w1_10A3': buildRecord('10A3', 1, {
    1: '02-11-26', // 3 lượt KTB = -15đ
    4: 9, // 9 tiết tốt = +90đ
    8: 14, // 14 điểm 8 = +14đ
    9: 9, // 9 điểm 9 = +18đ
    10: 5, // 5 điểm 10 = +15đ
    14: '09-13', // 2 lượt nói chuyện = -10đ
    28: 1, // Không lau bảng = -10đ
    38: 1, // Phong trào = +30đ
  }),

  // 11A3 (Nhóm 2)
  'w1_11A3': buildRecord('11A3', 1, {
    4: 8,
    8: 11,
    9: 7,
    10: 4,
    1: '08-15',
    13: '01',
  }),

  // 12A2 (Nhóm 2)
  'w1_12A2': buildRecord('12A2', 1, {
    4: 10,
    8: 16,
    9: 12,
    10: 8,
    38: 1,
  }),

  // 12A3 (Nhóm 2)
  'w1_12A3': buildRecord('12A3', 1, {
    4: 7,
    8: 9,
    9: 6,
    10: 3,
    1: '14-22',
  }),

  // 12A4 (Nhóm 2)
  'w1_12A4': buildRecord('12A4', 1, {
    4: 8,
    8: 10,
    9: 8,
    10: 5,
  }),

  // 12A5 (Nhóm 2)
  'w1_12A5': buildRecord('12A5', 1, {
    4: 8,
    8: 12,
    9: 7,
    10: 4,
  }),

  // 10A6 (Nhóm 3) - có STT 25 và 26 theo yêu cầu người dùng
  'w1_10A6': buildRecord('10A6', 1, {
    1: '25-26-03-12', // 4 lượt KTB = -20đ (trong đó có bạn STT 25 và 26)
    4: 8, // 8 tiết tốt = +80đ
    8: 13, // 13 điểm 8 = +13đ
    9: 8, // 8 điểm 9 = +16đ
    10: 4, // 4 điểm 10 = +12đ
    13: '25', // STT 25 đi trễ 1 lượt = -5đ
    14: '07-18', // 2 lượt nói chuyện = -10đ
    38: 1, // Phong trào = +30đ
  }),

  // 10A4 (Nhóm 3)
  'w1_10A4': buildRecord('10A4', 1, {
    4: 8,
    8: 10,
    9: 6,
    10: 3,
    1: '05-16',
  }),

  // 10A5 (Nhóm 3)
  'w1_10A5': buildRecord('10A5', 1, {
    4: 7,
    8: 9,
    9: 5,
    10: 2,
    1: '11-19-28',
  }),

  // 10A7 (Nhóm 3)
  'w1_10A7': buildRecord('10A7', 1, {
    4: 9,
    8: 12,
    9: 8,
    10: 4,
    1: '04-15',
  }),

  // 11A1 (Nhóm 3)
  'w1_11A1': buildRecord('11A1', 1, {
    4: 10,
    8: 15,
    9: 10,
    10: 6,
    38: 1,
  }),

  // 11A2 (Nhóm 3)
  'w1_11A2': buildRecord('11A2', 1, {
    4: 9,
    8: 13,
    9: 9,
    10: 5,
    1: '07',
  }),
};
