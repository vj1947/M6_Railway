// Sample responses for Group 6 stubs. Cancellation charges follow the rules in db/README.md.

export const payment = {
  paymentId: 14730,
  bookingId: 14080,
  pnr: '4521876390',
  amount: 1730,
  method: 'UPI',
  status: 'INITIATED',
  txnRef: 'TXN2026100948213377',
  payBefore: '2026-10-09 15:47:00',
};

export const paid = {
  paymentId: 14730,
  status: 'SUCCESS',
  txnRef: 'TXN2026100948213377',
  paidAt: '2026-10-09 15:03:12',
  bookingStatus: 'BOOKED',
  pnr: '4521876390',
};

export const failed = {
  paymentId: 14730,
  status: 'FAILED',
  txnRef: 'TXN2026100948213377',
  bookingStatus: 'PAYMENT_FAILED',
  pnr: '4521876390',
  message: 'The bank declined the payment. Your seats have been released.',
};

export function cancellation({ pnr, bpIds, preview }) {
  // 3A fare 865, more than 48 h before departure -> flat Rs 180 per traveller
  const items = bpIds.map((bpId, i) => ({ bpId, name: i === 0 ? 'Kartik Gaikwad' : 'Ananya Gaikwad', fare: 865, charge: 180, refund: 685 }));
  return {
    pnr,
    preview,
    hoursBeforeDeparture: 962,
    rule: 'More than 48 hours before departure: flat charge per traveller',
    items,
    totalRefund: items.reduce((s, x) => s + x.refund, 0),
    ...(preview ? {} : { bookingStatus: 'PARTIALLY_CANCELLED', refundStatus: 'PENDING', waitlistPromoted: 1 }),
  };
}

export const paymentHistory = {
  items: [
    { paymentId: 14730, pnr: '4521876390', amount: 1730, method: 'UPI', status: 'SUCCESS', paidAt: '2026-10-09 15:03:12' },
    { paymentId: 14112, pnr: '6757495670', amount: 9120, method: 'CARD', status: 'SUCCESS', paidAt: '2026-09-14 11:20:05' },
    { paymentId: 14111, pnr: '6757495670', amount: 9120, method: 'CARD', status: 'FAILED', paidAt: null },
  ],
};

export const refundHistory = {
  items: [
    { refundId: 2490, pnr: '7739195991', traveller: 'Pallavi Agarwal', amount: 285, status: 'PROCESSED', createdAt: '2026-09-10 09:12:44', processedAt: '2026-09-12 18:00:10' },
  ],
};

export const waitlist = {
  pnr: '4521876390',
  classCode: '3A',
  travellers: [
    { serial: 2, name: 'Ananya Gaikwad', wlNumber: 7, currentPosition: 3, status: 'WAITING' },
  ],
};
