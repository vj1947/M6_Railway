// Admin pages that groups have not built yet. Each group moves its page into its own
// folder when it starts building, and deletes it from here.
import { Placeholder } from '../../components/Placeholder';

export function AdminTrainsPage() {
  return (
    <Placeholder title="Manage trains" group="Group 2"
      summary="Add trains, set running days, attach coaches and generate their seats."
      requirements={[
        ['FR-G2-01', 'Add a train with number, name, type, route and running days.'],
        ['FR-G2-02', 'Edit or deactivate a train.'],
        ['FR-G2-05', 'Add coaches with label, class and position.'],
        ['FR-G2-06', 'Generate seats automatically for each new coach.'],
        ['FR-G2-08', 'Show seats per class and total capacity.'],
      ]}
      endpoints={['GET/POST /api/v1/trains', 'PUT /api/v1/trains/:id', 'GET/POST /api/v1/trains/:id/coaches', 'GET /api/v1/coaches/:id/seats']}
      files={['frontend/src/pages/trains/', 'backend/src/modules/trains/']} />
  );
}

export function AdminFaresPage() {
  return (
    <Placeholder title="Fare rules" group="Group 3"
      summary="Per-class rates that every fare is calculated from."
      requirements={[
        ['FR-G3-10', 'Edit per-km rate, minimum distance, reservation, superfast, GST and cancellation charge per class.'],
        ['FR-G3-07', 'Generate train runs for a date range.'],
      ]}
      endpoints={['GET /api/v1/fare-rules', 'PUT /api/v1/fare-rules/:classId', 'POST /api/v1/train-runs/generate']}
      files={['frontend/src/pages/stations/', 'backend/src/modules/stations/']} />
  );
}

export function AdminUsersPage() {
  return (
    <Placeholder title="Users" group="Group 1"
      summary="Find any account, change its role, and switch accounts on or off."
      requirements={[
        ['FR-G1-07', 'Create staff accounts with employee code and posting station.'],
        ['FR-G1-09', 'Search users by role, name or email; change role; activate or deactivate.'],
      ]}
      endpoints={['GET /api/v1/admin/users', 'POST /api/v1/admin/staff', 'PATCH /api/v1/admin/users/:id']}
      files={['frontend/src/pages/auth/', 'backend/src/modules/auth/']} />
  );
}

export function AdminReportsPage() {
  return (
    <Placeholder title="Reports" group="Group 7"
      summary="Filterable reports built on database views, each downloadable as CSV."
      requirements={[
        ['FR-G7-02', 'Bookings by date range, train, class and status.'],
        ['FR-G7-03', 'Revenue by day or month, net of refunds.'],
        ['FR-G7-04', 'Occupancy per train run and class.'],
        ['FR-G7-05', 'Passenger age groups and frequent travellers.'],
        ['FR-G7-06', 'Cancellations and refunds.'],
        ['FR-G7-13', 'Download any report as CSV.'],
      ]}
      endpoints={['GET /api/v1/admin/reports/:type']}
      files={['frontend/src/pages/admin/', 'backend/src/modules/admin/', 'db/views/']} />
  );
}

export function AdminAuditPage() {
  return (
    <Placeholder title="Audit log" group="Group 7"
      summary="Every change to important records, who made it and what changed."
      requirements={[
        ['FR-G7-07', 'Filter by table, user and date; show old and new values side by side.'],
        ['FR-G7-08', 'Triggers write the log automatically.'],
      ]}
      endpoints={['GET /api/v1/admin/audit-logs']}
      files={['frontend/src/pages/admin/', 'db/triggers/']} />
  );
}
