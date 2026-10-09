// GROUP 1 - Profile. WORKING (read-only): shows real data from GET /users/me.
// TODO Group 1: editing (FR-G1-05) and password change (FR-G1-06).
import { api } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Panel } from '../../components/Layout';
import { Loader, ErrorState } from '../../components/Feedback';
import { longDate, ROLE_LABEL } from '../../utils/format';

const GENDER = { M: 'Male', F: 'Female', O: 'Other' };

function Row({ label, children }) {
  return (
    <div className="grid gap-1 border-b border-line py-3 last:border-0 sm:grid-cols-[12rem_1fr]">
      <dt className="text-sm font-semibold text-ink-soft">{label}</dt>
      <dd>{children || <span className="text-ink-soft">Not added</span>}</dd>
    </div>
  );
}

export default function ProfilePage() {
  const { data: me, loading, error, reload } = useApi(() => api.get('/users/me'), []);
  if (loading) return <Loader label="Loading your profile" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  return (
    <div className="max-w-3xl">
      <PageHeader title={me.fullName} description={`${ROLE_LABEL[me.role]} account, member since ${longDate(me.memberSince)}`} />
      <div className="space-y-6">
        <Panel title="Contact">
          <dl>
            <Row label="Email">{me.email}</Row>
            <Row label="Mobile">{me.phone}</Row>
          </dl>
        </Panel>

        {me.passenger && (
          <Panel title="Traveller details">
            <dl>
              <Row label="Date of birth">{me.passenger.dateOfBirth && longDate(me.passenger.dateOfBirth)}</Row>
              <Row label="Gender">{GENDER[me.passenger.gender]}</Row>
              <Row label="ID proof">{me.passenger.idProofType && `${me.passenger.idProofType.replace('_', ' ')}  ${me.passenger.idProofNumber}`}</Row>
              <Row label="Address">{me.passenger.address && `${me.passenger.address}, ${me.passenger.city}, ${me.passenger.state} ${me.passenger.pincode}`}</Row>
            </dl>
          </Panel>
        )}

        {me.staff && (
          <Panel title="Posting">
            <dl>
              <Row label="Employee code">{me.staff.employeeCode}</Row>
              <Row label="Designation">{me.staff.designation}</Row>
              <Row label="Station">{me.staff.postingStation?.name} ({me.staff.postingStation?.code})</Row>
            </dl>
          </Panel>
        )}
      </div>
    </div>
  );
}
