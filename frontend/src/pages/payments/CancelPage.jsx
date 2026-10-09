// GROUP 6 - Cancel tickets. PLACEHOLDER until Group 6 builds it.
import { useParams } from 'react-router';
import { Placeholder } from '../../components/Placeholder';

export default function CancelPage() {
  const { pnr } = useParams();
  return (
    <Placeholder
      title="Cancel tickets"
      group="Group 6"
      summary={`Cancel one or more travellers on PNR ${pnr}. Show the charge and refund first, then confirm.`}
      requirements={[
        ['FR-G6-05', 'Pick which travellers to cancel; allowed until chart preparation.'],
        ['FR-G6-06', 'Preview charge and refund before confirming (call the API with ?preview=true).'],
        ['FR-G6-07', 'Show the refund as pending.'],
        ['FR-G6-09', 'Freed seats go to the waiting list automatically.'],
      ]}
      endpoints={['POST /api/v1/bookings/:pnr/cancel?preview=true', 'POST /api/v1/bookings/:pnr/cancel']}
      files={['frontend/src/pages/payments/CancelPage.jsx', 'backend/src/modules/payments/', 'db/procedures/g6_sp_cancel_ticket.sql']}
    />
  );
}
