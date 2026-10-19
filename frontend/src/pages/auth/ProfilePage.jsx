// GROUP 1 - Profile: real data, profile edit (FR-G1-05), and password change (FR-G1-06).
import { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { useApi } from '../../hooks/useApi';
import { PageHeader, Panel } from '../../components/Layout';
import { Loader, ErrorState, Notice } from '../../components/Feedback';
import { Button } from '../../components/Button';
import { Field, Input } from '../../components/Field';
import { longDate, ROLE_LABEL } from '../../utils/format';

const GENDER = { M: 'Male', F: 'Female', O: 'Other' };
const ID_TYPES = [
  { value: '', label: 'Select ID proof' },
  { value: 'AADHAAR', label: 'Aadhaar' },
  { value: 'PAN', label: 'PAN card' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'VOTER_ID', label: 'Voter ID' },
  { value: 'DRIVING_LICENCE', label: 'Driving licence' },
];

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

  // Profile Edit State (FR-G1-05)
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    idProofType: '',
    idProofNumber: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [profileSuccess, setProfileSuccess] = useState(null);

  // Password Change State (FR-G1-06)
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdError, setPwdError] = useState(null);
  const [pwdSuccess, setPwdSuccess] = useState(null);

  useEffect(() => {
    if (me) {
      setEditForm({
        fullName: me.fullName || '',
        phone: me.phone || '',
        dateOfBirth: me.passenger?.dateOfBirth ? me.passenger.dateOfBirth.slice(0, 10) : '',
        gender: me.passenger?.gender || '',
        idProofType: me.passenger?.idProofType || '',
        idProofNumber: me.passenger?.idProofNumber || '',
        address: me.passenger?.address || '',
        city: me.passenger?.city || '',
        state: me.passenger?.state || '',
        pincode: me.passenger?.pincode || '',
      });
    }
  }, [me]);

  if (loading) return <Loader label="Loading your profile" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const payload = {
        fullName: editForm.fullName,
        phone: editForm.phone,
      };

      if (me.passenger) {
        payload.passenger = {
          dateOfBirth: editForm.dateOfBirth || null,
          gender: editForm.gender || null,
          idProofType: editForm.idProofType || null,
          idProofNumber: editForm.idProofNumber || null,
          address: editForm.address || null,
          city: editForm.city || null,
          state: editForm.state || null,
          pincode: editForm.pincode || null,
        };
      }

      await api.put('/users/me', payload);
      setProfileSuccess('Profile updated successfully.');
      setIsEditing(false);
      await reload();
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdSaving(true);
    setPwdError(null);
    setPwdSuccess(null);

    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError('New passwords do not match.');
      setPwdSaving(false);
      return;
    }

    if (pwdForm.newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters.');
      setPwdSaving(false);
      return;
    }

    try {
      await api.put('/users/me/password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdSuccess('Password changed successfully.');
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdError(err.message || 'Failed to change password.');
    } finally {
      setPwdSaving(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={me.fullName}
          description={`${ROLE_LABEL[me.role]} account, member since ${longDate(me.memberSince)}`}
        />
        {!isEditing && (
          <Button variant="secondary" onClick={() => setIsEditing(true)}>
            Edit profile
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {profileSuccess && <Notice tone="success" title={profileSuccess} />}
        {profileError && <Notice tone="error" title={profileError} />}

        {isEditing ? (
          <Panel title="Edit profile">
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <Field label="Full name" required>
                <Input
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  required
                />
              </Field>

              <Field label="Mobile number" required hint="10-digit mobile number">
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  maxLength={10}
                  required
                />
              </Field>

              {me.passenger && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Date of birth">
                      <Input
                        type="date"
                        value={editForm.dateOfBirth}
                        onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                      />
                    </Field>
                    <Field label="Gender">
                      <select
                        className="w-full rounded-[var(--radius-field)] border border-line bg-paper px-3 py-2 text-ink focus:border-ink focus:outline-none"
                        value={editForm.gender}
                        onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                      >
                        <option value="">Select gender</option>
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </Field>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="ID proof type">
                      <select
                        className="w-full rounded-[var(--radius-field)] border border-line bg-paper px-3 py-2 text-ink focus:border-ink focus:outline-none"
                        value={editForm.idProofType}
                        onChange={(e) => setEditForm({ ...editForm, idProofType: e.target.value })}
                      >
                        {ID_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </Field>
                    <Field label="ID proof number">
                      <Input
                        value={editForm.idProofNumber}
                        onChange={(e) => setEditForm({ ...editForm, idProofNumber: e.target.value })}
                        placeholder="e.g. Aadhaar or PAN number"
                      />
                    </Field>
                  </div>

                  <Field label="Address">
                    <Input
                      value={editForm.address}
                      onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                      placeholder="Street address or locality"
                    />
                  </Field>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label="City">
                      <Input
                        value={editForm.city}
                        onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                      />
                    </Field>
                    <Field label="State">
                      <Input
                        value={editForm.state}
                        onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                      />
                    </Field>
                    <Field label="Pincode">
                      <Input
                        value={editForm.pincode}
                        onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                        maxLength={6}
                      />
                    </Field>
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <Button type="submit" loading={profileSaving}>
                  Save changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={profileSaving}
                  onClick={() => {
                    setIsEditing(false);
                    setProfileError(null);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Panel>
        ) : (
          <>
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
                  <Row label="ID proof">
                    {me.passenger.idProofType && `${me.passenger.idProofType.replace('_', ' ')} ${me.passenger.idProofNumber || ''}`}
                  </Row>
                  <Row label="Address">
                    {(me.passenger.address || me.passenger.city || me.passenger.state) && (
                      [me.passenger.address, me.passenger.city, me.passenger.state, me.passenger.pincode]
                        .filter(Boolean)
                        .join(', ')
                    )}
                  </Row>
                </dl>
              </Panel>
            )}

            {me.staff && (
              <Panel title="Posting">
                <dl>
                  <Row label="Employee code">{me.staff.employeeCode}</Row>
                  <Row label="Designation">{me.staff.designation}</Row>
                  <Row label="Station">
                    {me.staff.postingStation?.name} ({me.staff.postingStation?.code})
                  </Row>
                </dl>
              </Panel>
            )}
          </>
        )}

        {/* FR-G1-06 Change Password */}
        <Panel title="Change password">
          {pwdSuccess && <Notice tone="success" title={pwdSuccess} />}
          {pwdError && <Notice tone="error" title={pwdError} />}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <Field label="Current password" required>
              <Input
                type="password"
                autoComplete="current-password"
                value={pwdForm.currentPassword}
                onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })}
                required
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="New password" required hint="At least 8 characters">
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={pwdForm.newPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })}
                  required
                />
              </Field>
              <Field label="Confirm new password" required>
                <Input
                  type="password"
                  autoComplete="new-password"
                  value={pwdForm.confirmPassword}
                  onChange={(e) => setPwdForm({ ...pwdForm, confirmPassword: e.target.value })}
                  required
                />
              </Field>
            </div>

            <div className="pt-2">
              <Button type="submit" loading={pwdSaving}>
                Update password
              </Button>
            </div>
          </form>
        </Panel>
      </div>
    </div>
  );
}