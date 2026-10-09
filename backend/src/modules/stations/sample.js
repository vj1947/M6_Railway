// Sample responses for Group 3 stubs (values match the seed data).

export const routes = {
  items: [
    { routeId: 1, routeCode: 'BCT-NDLS-RAJ', routeName: 'Mumbai Central to New Delhi (Rajdhani)', origin: 'BCT', destination: 'NDLS', stops: 6, distanceKm: 1384 },
    { routeId: 5, routeCode: 'NDLS-RKMP-SHT', routeName: 'New Delhi to Rani Kamlapati (Shatabdi)', origin: 'NDLS', destination: 'RKMP', stops: 6, distanceKm: 708 },
    { routeId: 8, routeCode: 'NDLS-HYB-TEL', routeName: 'New Delhi to Hyderabad Deccan (Telangana Exp)', origin: 'NDLS', destination: 'HYB', stops: 10, distanceKm: 1672 },
  ],
};

export const schedule = {
  trainId: 1,
  trainNumber: '12951',
  trainName: 'Mumbai Central - New Delhi Rajdhani Express',
  stops: [
    { stopSeq: 1, stationCode: 'BCT',  stationName: 'Mumbai Central',    arrival: null,    departure: '17:00', day: 1, distanceKm: 0 },
    { stopSeq: 2, stationCode: 'ST',   stationName: 'Surat',             arrival: '19:52', departure: '19:55', day: 1, distanceKm: 263 },
    { stopSeq: 3, stationCode: 'BRC',  stationName: 'Vadodara Junction', arrival: '21:13', departure: '21:23', day: 1, distanceKm: 392 },
    { stopSeq: 4, stationCode: 'RTM',  stationName: 'Ratlam Junction',   arrival: '00:30', departure: '00:33', day: 2, distanceKm: 653 },
    { stopSeq: 5, stationCode: 'KOTA', stationName: 'Kota Junction',     arrival: '03:20', departure: '03:30', day: 2, distanceKm: 918 },
    { stopSeq: 6, stationCode: 'NDLS', stationName: 'New Delhi',         arrival: '08:32', departure: null,    day: 2, distanceKm: 1384 },
  ],
};

export const board = {
  stationCode: 'BPL',
  date: '2026-11-20',
  items: [
    { trainNumber: '12002', trainName: 'New Delhi - Rani Kamlapati Shatabdi Express', from: 'NDLS', to: 'RKMP', arrival: '14:25', departure: '14:30', status: 'SCHEDULED' },
    { trainNumber: '12001', trainName: 'Rani Kamlapati - New Delhi Shatabdi Express', from: 'RKMP', to: 'NDLS', arrival: '15:25', departure: '15:30', status: 'SCHEDULED' },
    { trainNumber: '12723', trainName: 'Telangana Express', from: 'HYB', to: 'NDLS', arrival: '22:55', departure: '23:05', status: 'SCHEDULED' },
  ],
};

export const fareRules = {
  items: [
    { classId: 1, classCode: '1A', perKmRate: 2.55, minDistanceKm: 300, reservationCharge: 60, superfastCharge: 75, gstPercent: 5, minCancellationCharge: 240 },
    { classId: 6, classCode: 'EC', perKmRate: 2.40, minDistanceKm: 250, reservationCharge: 60, superfastCharge: 75, gstPercent: 5, minCancellationCharge: 240 },
    { classId: 2, classCode: '2A', perKmRate: 1.50, minDistanceKm: 300, reservationCharge: 50, superfastCharge: 45, gstPercent: 5, minCancellationCharge: 200 },
    { classId: 3, classCode: '3A', perKmRate: 1.05, minDistanceKm: 300, reservationCharge: 40, superfastCharge: 45, gstPercent: 5, minCancellationCharge: 180 },
    { classId: 5, classCode: 'CC', perKmRate: 1.20, minDistanceKm: 250, reservationCharge: 40, superfastCharge: 45, gstPercent: 5, minCancellationCharge: 180 },
    { classId: 4, classCode: 'SL', perKmRate: 0.42, minDistanceKm: 200, reservationCharge: 20, superfastCharge: 30, gstPercent: 0, minCancellationCharge: 120 },
  ],
};
