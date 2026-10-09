// GROUP 5 - Booking form. PLACEHOLDER until Group 5 builds it.
import { useParams, useSearchParams } from 'react-router';
import { Placeholder } from '../../components/Placeholder';

export default function BookingPage() {
  const { runId } = useParams();
  const [params] = useSearchParams();
  return (
    <Placeholder
      title="Traveller details"
      group="Group 5"
      summary={`Book run ${runId}, class ${params.get('class') || '?'}, stops ${params.get('from')} to ${params.get('to')}. Collect travellers, create the booking, then send the passenger to payment.`}
      requirements={[
        ['FR-G5-01', 'Enter 1 to 6 travellers: name, age, gender, berth preference.'],
        ['FR-G5-02', 'Check every traveller before sending.'],
        ['FR-G5-03', 'Booking runs as one locked transaction.'],
        ['FR-G5-04', 'Show which travellers got seats and which are on the waiting list.'],
        ['FR-G5-06', 'Go to /pay/:bookingId after the booking is created.'],
      ]}
      endpoints={['POST /api/v1/bookings', 'GET /api/v1/search/fare']}
      files={['frontend/src/pages/bookings/BookingPage.jsx', 'backend/src/modules/bookings/', 'db/procedures/g5_sp_book_ticket.sql']}
    />
  );
}
