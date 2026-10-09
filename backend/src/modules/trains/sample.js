// Sample responses for Group 2 stubs (values match the seed data).

const ALL_DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export const trainList = {
  page: 1,
  pageSize: 20,
  total: 12,
  items: [
    { trainId: 1, trainNumber: '12951', trainName: 'Mumbai Central - New Delhi Rajdhani Express', trainType: 'RAJDHANI', from: 'BCT', to: 'NDLS', runningDays: ALL_DAYS, classes: ['1A', '2A', '3A'], isActive: true },
    { trainId: 3, trainNumber: '12301', trainName: 'Howrah - New Delhi Rajdhani Express', trainType: 'RAJDHANI', from: 'HWH', to: 'NDLS', runningDays: ALL_DAYS, classes: ['1A', '2A', '3A'], isActive: true },
    { trainId: 5, trainNumber: '12002', trainName: 'New Delhi - Rani Kamlapati Shatabdi Express', trainType: 'SHATABDI', from: 'NDLS', to: 'RKMP', runningDays: ['MON', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], classes: ['EC', 'CC'], isActive: true },
    { trainId: 7, trainNumber: '12723', trainName: 'Telangana Express', trainType: 'SUPERFAST', from: 'HYB', to: 'NDLS', runningDays: ALL_DAYS, classes: ['2A', '3A', 'SL'], isActive: true },
    { trainId: 11, trainNumber: '12839', trainName: 'Howrah - Chennai Mail', trainType: 'MAIL_EXPRESS', from: 'HWH', to: 'MAS', runningDays: ALL_DAYS, classes: ['1A', '2A', '3A', 'SL'], isActive: true },
  ],
};

export const classes = {
  items: [
    { classId: 1, classCode: '1A', className: 'First AC', isAc: true, hasBerths: true },
    { classId: 6, classCode: 'EC', className: 'Executive Chair Car', isAc: true, hasBerths: false },
    { classId: 2, classCode: '2A', className: 'AC 2 Tier', isAc: true, hasBerths: true },
    { classId: 3, classCode: '3A', className: 'AC 3 Tier', isAc: true, hasBerths: true },
    { classId: 5, classCode: 'CC', className: 'AC Chair Car', isAc: true, hasBerths: false },
    { classId: 4, classCode: 'SL', className: 'Sleeper', isAc: false, hasBerths: true },
  ],
};

export const trainDetail = {
  trainId: 1,
  trainNumber: '12951',
  trainName: 'Mumbai Central - New Delhi Rajdhani Express',
  trainType: 'RAJDHANI',
  route: { routeId: 1, routeCode: 'BCT-NDLS-RAJ', from: 'BCT', to: 'NDLS', stops: 6, distanceKm: 1384 },
  runningDays: ALL_DAYS,
  isActive: true,
  capacity: [
    { classCode: '1A', coaches: 1, seats: 24 },
    { classCode: '2A', coaches: 4, seats: 192 },
    { classCode: '3A', coaches: 10, seats: 640 },
  ],
  totalSeats: 856,
  coaches: [
    { coachId: 1, coachLabel: 'H1', classCode: '1A', coachPosition: 1, seats: 24 },
    { coachId: 2, coachLabel: 'A1', classCode: '2A', coachPosition: 2, seats: 48 },
    { coachId: 3, coachLabel: 'A2', classCode: '2A', coachPosition: 3, seats: 48 },
    { coachId: 6, coachLabel: 'B1', classCode: '3A', coachPosition: 6, seats: 64 },
    { coachId: 7, coachLabel: 'B2', classCode: '3A', coachPosition: 7, seats: 64 },
  ],
};

const PATTERN_3A = ['LB', 'MB', 'UB', 'LB', 'MB', 'UB', 'SL', 'SU'];
export const coachSeats = {
  coachId: 7,
  coachLabel: 'B2',
  classCode: '3A',
  seats: Array.from({ length: 64 }, (_, i) => ({ seatId: 400 + i, seatNumber: i + 1, berthType: PATTERN_3A[i % 8] })),
};
