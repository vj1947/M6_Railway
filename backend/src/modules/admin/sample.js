// Sample responses for Group 7 stubs.

function last30Days() {
  const days = [];
  const end = new Date('2026-10-09T00:00:00Z');
  for (let i = 29; i >= 0; i -= 1) {
    const d = new Date(end);
    d.setUTCDate(end.getUTCDate() - i);
    const wave = Math.round(150 + 60 * Math.sin(i / 3) + (i % 7 === 1 ? 70 : 0));
    days.push({ date: d.toISOString().slice(0, 10), bookings: wave, revenue: wave * 2150 });
  }
  return days;
}

export const dashboard = {
  today: { bookings: 182, revenue: 412650, cancellations: 14, activeTrains: 12, waitlisted: 525 },
  last30Days: last30Days(),
  topTrains: [
    { trainNumber: '12952', trainName: 'New Delhi - Mumbai Central Rajdhani Express', occupancyPercent: 71 },
    { trainNumber: '12301', trainName: 'Howrah - New Delhi Rajdhani Express', occupancyPercent: 66 },
    { trainNumber: '12002', trainName: 'New Delhi - Rani Kamlapati Shatabdi Express', occupancyPercent: 58 },
  ],
};

export const reports = {
  bookings: {
    columns: ['pnr', 'bookedAt', 'trainNumber', 'journeyDate', 'from', 'to', 'classCode', 'travellers', 'status', 'amount'],
    rows: [
      ['4521876390', '2026-10-09 15:02', '12724', '2026-11-20', 'NDLS', 'BPL', '3A', 2, 'BOOKED', 1730],
      ['6757495670', '2026-09-14 11:19', '12952', '2026-11-07', 'NDLS', 'BCT', '2A', 4, 'BOOKED', 9120],
      ['7739195991', '2026-09-02 20:41', '12001', '2026-09-18', 'RKMP', 'VGLJ', 'CC', 3, 'PARTIALLY_CANCELLED', 1395],
    ],
  },
  revenue: {
    columns: ['month', 'gross', 'refunds', 'net'],
    rows: [['2026-07', 920075, 18400, 901675], ['2026-08', 3806715, 96220, 3710495], ['2026-09', 14343210, 412830, 13930380], ['2026-10', 5723560, 201115, 5522445]],
  },
  occupancy: {
    columns: ['trainNumber', 'journeyDate', 'classCode', 'seats', 'filled', 'percent'],
    rows: [['12951', '2026-11-07', '1A', 24, 24, 100], ['12951', '2026-11-07', '2A', 192, 182, 95], ['12951', '2026-11-07', '3A', 640, 317, 50]],
  },
  passengers: {
    columns: ['ageGroup', 'male', 'female', 'other', 'total'],
    rows: [['Under 18', 2140, 1985, 0, 4125], ['18 to 59', 9870, 8044, 0, 17914], ['60 and above', 3561, 2978, 0, 6539]],
  },
  cancellations: {
    columns: ['reason', 'count', 'refunded'],
    rows: [['Change of plans', 512, 498320], ['Travel postponed', 486, 455010], ['Auto-cancelled at chart', 301, 412600]],
  },
};

export const auditLogs = {
  page: 1,
  pageSize: 20,
  total: 3,
  items: [
    { logId: 3, tableName: 'fare_rules', recordId: '3', action: 'UPDATE', changedBy: { userId: 1, name: 'Kartik Gaikwad' }, changedAt: '2026-10-09 12:10:44.120', oldData: { per_km_rate: 1.0 }, newData: { per_km_rate: 1.05 } },
    { logId: 2, tableName: 'bookings', recordId: '14080', action: 'UPDATE', changedBy: { userId: 11, name: 'Farhan Gupta' }, changedAt: '2026-10-09 15:03:12.481', oldData: { status: 'PENDING_PAYMENT' }, newData: { status: 'BOOKED' } },
    { logId: 1, tableName: 'trains', recordId: '12', action: 'UPDATE', changedBy: { userId: 1, name: 'Kartik Gaikwad' }, changedAt: '2026-10-08 18:22:05.004', oldData: { is_active: 1 }, newData: { is_active: 0 } },
  ],
};

export const showcase = {
  items: [
    { id: 1, title: 'Top 5 routes by revenue this month', concept: 'JOIN + GROUP BY + ORDER BY' },
    { id: 2, title: 'Passengers who travelled more than 5 times', concept: 'GROUP BY + HAVING' },
    { id: 3, title: 'Running occupancy per train with RANK()', concept: 'Window function' },
  ],
};
