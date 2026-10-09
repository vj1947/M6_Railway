// Status colours follow railway signals: green = confirmed, amber = waiting, red = cancelled.
//   <StatusBadge status="CNF" />   <StatusBadge status="WL" detail="7" />   <StatusBadge status="BOOKED" />
const STYLES = {
  green: 'bg-cnf-bg text-cnf',
  amber: 'bg-wl-bg text-wl',
  red: 'bg-can-bg text-can',
  blue: 'bg-pending-bg text-pending',
  grey: 'bg-paper-sunk text-ink-soft',
};

const STATUS = {
  CNF: ['green', 'Confirmed'],
  BOOKED: ['green', 'Booked'],
  SUCCESS: ['green', 'Paid'],
  PROCESSED: ['green', 'Refunded'],
  AVAILABLE: ['green', 'Available'],
  CONFIRMED: ['green', 'Confirmed'],
  WL: ['amber', 'Waiting list'],
  WAITING: ['amber', 'Waiting'],
  PARTIALLY_CANCELLED: ['amber', 'Partly cancelled'],
  PENDING: ['amber', 'Refund pending'],
  CAN: ['red', 'Cancelled'],
  CANCELLED: ['red', 'Cancelled'],
  PAYMENT_FAILED: ['red', 'Payment failed'],
  FAILED: ['red', 'Failed'],
  NOT_AVAILABLE: ['red', 'Not available'],
  PENDING_PAYMENT: ['blue', 'Awaiting payment'],
  INITIATED: ['blue', 'Started'],
  SCHEDULED: ['blue', 'Scheduled'],
  CHART_PREPARED: ['grey', 'Chart prepared'],
  DEPARTED: ['grey', 'Departed'],
  COMPLETED: ['grey', 'Completed'],
  ACTIVE: ['green', 'Active'],
  INACTIVE: ['grey', 'Inactive'],
};

export function StatusBadge({ status, detail, className = '' }) {
  const [tone, label] = STATUS[status] || ['grey', status];
  return (
    <span className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${STYLES[tone]} ${className}`}>
      {label}{detail != null && <span className="font-display text-[15px] font-bold leading-none">{detail}</span>}
    </span>
  );
}
