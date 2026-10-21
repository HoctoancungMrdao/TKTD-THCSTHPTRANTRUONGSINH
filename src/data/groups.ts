import { EmulationGroup } from '../types/emulation';

export const EMULATION_GROUPS: EmulationGroup[] = [
  {
    id: 1,
    name: 'NHÓM 1',
    classIds: ['10A1', '10A2', '11A4', '11A5', '12A1'],
    color: 'emerald',
  },
  {
    id: 2,
    name: 'NHÓM 2',
    classIds: ['10A3', '11A3', '12A2', '12A3', '12A4', '12A5'],
    color: 'amber',
  },
  {
    id: 3,
    name: 'NHÓM 3',
    classIds: ['10A4', '10A5', '10A6', '10A7', '11A1', '11A2'],
    color: 'indigo',
  },
];

export const ALL_SCHOOL_CLASSES = [
  // Nhóm 1
  { id: '10A1', name: '10A1', groupId: 1, grade: 10 },
  { id: '10A2', name: '10A2', groupId: 1, grade: 10 },
  { id: '11A4', name: '11A4', groupId: 1, grade: 11 },
  { id: '11A5', name: '11A5', groupId: 1, grade: 11 },
  { id: '12A1', name: '12A1', groupId: 1, grade: 12 },

  // Nhóm 2
  { id: '10A3', name: '10A3', groupId: 2, grade: 10 },
  { id: '11A3', name: '11A3', groupId: 2, grade: 11 },
  { id: '12A2', name: '12A2', groupId: 2, grade: 12 },
  { id: '12A3', name: '12A3', groupId: 2, grade: 12 },
  { id: '12A4', name: '12A4', groupId: 2, grade: 12 },
  { id: '12A5', name: '12A5', groupId: 2, grade: 12 },

  // Nhóm 3
  { id: '10A4', name: '10A4', groupId: 3, grade: 10 },
  { id: '10A5', name: '10A5', groupId: 3, grade: 10 },
  { id: '10A6', name: '10A6', groupId: 3, grade: 10 },
  { id: '10A7', name: '10A7', groupId: 3, grade: 10 },
  { id: '11A1', name: '11A1', groupId: 3, grade: 11 },
  { id: '11A2', name: '11A2', groupId: 3, grade: 11 },
];
