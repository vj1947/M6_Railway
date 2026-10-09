// GROUP 6 - Mock payment. PLACEHOLDER until Group 6 builds it.
import { useParams } from 'react-router';
import { Placeholder } from '../../components/Placeholder';

export default function PaymentPage() {
  const { bookingId } = useParams();
  return (
    <Placeholder
      title="Pay for your ticket"
      group="Group 6"
      summary={`Payment for booking ${bookingId}. Show the amount, let the passenger choose a method, then simulate the bank's answer.`}
      requirements={[
        ['FR-G6-01', 'Show the amount and the four payment methods.'],
        ['FR-G6-02', 'Success confirms the booking and opens the e-ticket; failure releases the seats.'],
        ['FR-G6-03', 'Allow another attempt while the booking is still pending.'],
        ['FR-G6-04', 'Show the 15-minute time limit.'],
      ]}
      endpoints={['POST /api/v1/payments', 'POST /api/v1/payments/:id/verify']}
      files={['frontend/src/pages/payments/PaymentPage.jsx', 'backend/src/modules/payments/', 'db/procedures/g6_sp_confirm_payment.sql']}
    />
  );
}
