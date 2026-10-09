// GROUP 5 - Reservation chart for staff. PLACEHOLDER until Group 5 builds it.
import { Placeholder } from '../../components/Placeholder';

export default function StaffChartPage() {
  return (
    <Placeholder
      title="Reservation chart"
      group="Group 5"
      summary="Staff pick a train and date and see every traveller by coach and seat, to check tickets on board."
      requirements={[
        ['FR-G5-10', 'List travellers for one train run, grouped by coach, sorted by seat.'],
        ['FR-G5-11', 'Book a ticket at the counter for a passenger (optional).'],
        ['FR-G3-09', 'Mark the run as chart prepared (Group 3 API).'],
      ]}
      endpoints={['GET /api/v1/runs/:runId/chart', 'POST /api/v1/counter/bookings', 'PATCH /api/v1/train-runs/:runId/status']}
      files={['frontend/src/pages/bookings/StaffChartPage.jsx', 'backend/src/modules/bookings/']}
    />
  );
}
