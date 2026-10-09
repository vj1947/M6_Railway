// Sample responses for Group 4 stubs. Fares follow the real fare formula.

const RESULTS = [
  {
    runId: 506,
    trainId: 5,
    trainNumber: '12002',
    trainName: 'New Delhi - Rani Kamlapati Shatabdi Express',
    trainType: 'SHATABDI',
    from: { stationCode: 'NDLS', stationName: 'New Delhi', stopSeq: 1, time: '06:00', dayOffset: 0 },
    to: { stationCode: 'BPL', stationName: 'Bhopal Junction', stopSeq: 5, time: '14:25', dayOffset: 0 },
    durationMinutes: 505,
    distanceKm: 701,
    bookable: true,
    classes: [
      { classId: 6, classCode: 'EC', className: 'Executive Chair Car', fare: 1910, availability: { status: 'WL', count: 12 } },
      { classId: 5, classCode: 'CC', className: 'AC Chair Car', fare: 975, availability: { status: 'AVAILABLE', count: 143 } },
    ],
  },
  {
    runId: 511,
    trainId: 8,
    trainNumber: '12724',
    trainName: 'Telangana Express',
    trainType: 'SUPERFAST',
    from: { stationCode: 'NDLS', stationName: 'New Delhi', stopSeq: 1, time: '17:30', dayOffset: 0 },
    to: { stationCode: 'BPL', stationName: 'Bhopal Junction', stopSeq: 5, time: '03:35', dayOffset: 1 },
    durationMinutes: 605,
    distanceKm: 702,
    bookable: true,
    classes: [
      { classId: 2, classCode: '2A', className: 'AC 2 Tier', fare: 1210, availability: { status: 'AVAILABLE', count: 8 } },
      { classId: 3, classCode: '3A', className: 'AC 3 Tier', fare: 865, availability: { status: 'AVAILABLE', count: 96 } },
      { classId: 4, classCode: 'SL', className: 'Sleeper', fare: 345, availability: { status: 'AVAILABLE', count: 310 } },
    ],
  },
];

export function searchResults({ date, classFilter }) {
  const trains = RESULTS
    .map((t) => ({ ...t, journeyDate: date, classes: classFilter ? t.classes.filter((c) => c.classCode === classFilter) : t.classes }))
    .filter((t) => t.classes.length > 0);
  return {
    from: { stationCode: 'NDLS', stationName: 'New Delhi' },
    to: { stationCode: 'BPL', stationName: 'Bhopal Junction' },
    date,
    trains,
  };
}

export const fareBreakup = {
  trainId: 8,
  classCode: '3A',
  distanceKm: 702,
  breakup: { base: 737.10, reservation: 40, superfast: 45, gst: 41.11, rounding: 1.79 },
  total: 865,
};

export const calendar = {
  trainId: 8,
  classCode: '3A',
  days: [
    { date: '2026-11-18', status: 'AVAILABLE', count: 212 },
    { date: '2026-11-19', status: 'AVAILABLE', count: 164 },
    { date: '2026-11-20', status: 'AVAILABLE', count: 96 },
    { date: '2026-11-21', status: 'AVAILABLE', count: 41 },
    { date: '2026-11-22', status: 'WL', count: 18 },
    { date: '2026-11-23', status: 'WL', count: 6 },
    { date: '2026-11-24', status: 'AVAILABLE', count: 120 },
  ],
};
