// Sample responses for Group 5 stubs.

const JOURNEY = {
  runId: 511,
  trainNumber: '12724',
  trainName: 'Telangana Express',
  journeyDate: '2026-11-20',
  from: { stationCode: 'NDLS', stationName: 'New Delhi', departure: '2026-11-20 17:30' },
  to: { stationCode: 'BPL', stationName: 'Bhopal Junction', arrival: '2026-11-21 03:35' },
  distanceKm: 702,
  classCode: '3A',
  className: 'AC 3 Tier',
};

export function newBooking(passengers) {
  const seats = [['B2', 21, 'MB'], ['B2', 22, 'UB'], ['B2', 17, 'LB'], ['B2', 18, 'MB'], ['B2', 19, 'UB'], ['B2', 23, 'SL']];
  return {
    bookingId: 14080,
    pnr: '4521876390',
    status: 'PENDING_PAYMENT',
    ...JOURNEY,
    passengers: passengers.map((p, i) => ({
      bpId: 28600 + i,
      name: p.name,
      age: Number(p.age),
      gender: p.gender,
      status: 'CNF',
      coach: seats[i][0],
      seatNumber: seats[i][1],
      berthType: seats[i][2],
      wlNumber: null,
      fare: 865,
    })),
    amount: 865 * passengers.length,
    payBefore: '2026-10-09 15:47:00',
  };
}

export const myBookings = {
  upcoming: [
    { pnr: '4521876390', status: 'BOOKED', trainNumber: '12724', trainName: 'Telangana Express', journeyDate: '2026-11-20', from: 'NDLS', to: 'BPL', departure: '17:30', classCode: '3A', travellers: 2, amount: 1730 },
    { pnr: '6757495670', status: 'BOOKED', trainNumber: '12952', trainName: 'New Delhi - Mumbai Central Rajdhani Express', journeyDate: '2026-11-07', from: 'NDLS', to: 'BCT', departure: '16:55', classCode: '2A', travellers: 4, amount: 9120 },
    { pnr: '3147323484', status: 'PENDING_PAYMENT', trainNumber: '12127', trainName: 'Mumbai CSMT - Pune Intercity Express', journeyDate: '2026-10-24', from: 'CSMT', to: 'PUNE', departure: '06:40', classCode: 'CC', travellers: 1, amount: 400 },
  ],
  past: [
    { pnr: '7739195991', status: 'PARTIALLY_CANCELLED', trainNumber: '12001', trainName: 'Rani Kamlapati - New Delhi Shatabdi Express', journeyDate: '2026-09-18', from: 'RKMP', to: 'VGLJ', departure: '15:15', classCode: 'CC', travellers: 3, amount: 1395 },
    { pnr: '5108236205', status: 'BOOKED', trainNumber: '12723', trainName: 'Telangana Express', journeyDate: '2026-09-04', from: 'HYB', to: 'NDLS', departure: '06:00', classCode: '3A', travellers: 4, amount: 7840 },
  ],
};

export const pnrStatus = {
  pnr: '4521876390',
  status: 'BOOKED',
  ...JOURNEY,
  chartPrepared: false,
  passengers: [
    { serial: 1, bookingStatus: 'CNF B2/21 MB', currentStatus: 'CNF', coach: 'B2', seatNumber: 21, berthType: 'MB', wlPosition: null },
    { serial: 2, bookingStatus: 'WL 7', currentStatus: 'WL', coach: null, seatNumber: null, berthType: null, wlPosition: 3 },
  ],
};

export const ticket = {
  pnr: '4521876390',
  status: 'BOOKED',
  bookedAt: '2026-10-09 15:02:41',
  ...JOURNEY,
  quota: 'General',
  passengers: [
    { serial: 1, name: 'Kartik Gaikwad', age: 21, gender: 'M', status: 'CNF', coach: 'B2', seatNumber: 21, berthType: 'MB', wlNumber: null, fare: 865 },
    { serial: 2, name: 'Ananya Gaikwad', age: 19, gender: 'F', status: 'CNF', coach: 'B2', seatNumber: 22, berthType: 'UB', wlNumber: null, fare: 865 },
  ],
  payment: { method: 'UPI', txnRef: 'TXN2026100948213377', paidAt: '2026-10-09 15:03:12', amount: 1730 },
  totalFare: 1730,
};

export const chart = {
  runId: 511,
  trainNumber: '12724',
  journeyDate: '2026-11-20',
  coaches: [
    {
      coach: 'B2',
      classCode: '3A',
      passengers: [
        { seatNumber: 17, berthType: 'LB', name: 'Revathi Nair', age: 64, gender: 'F', from: 'NDLS', to: 'HYB', pnr: '9196548247' },
        { seatNumber: 21, berthType: 'MB', name: 'Kartik Gaikwad', age: 21, gender: 'M', from: 'NDLS', to: 'BPL', pnr: '4521876390' },
        { seatNumber: 22, berthType: 'UB', name: 'Ananya Gaikwad', age: 19, gender: 'F', from: 'NDLS', to: 'BPL', pnr: '4521876390' },
      ],
    },
  ],
};
