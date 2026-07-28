import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { environment } from '../../config/environment';
import { useIdentity } from '../../auth/IdentityContext';
import { demoIdentities } from '../../auth/identity';
import { hasCapability, roleLabel } from '../../auth/authorization';
import { demoCourses } from '../../data/demo-data';
import { submitDemoClaim } from '../../management/demo-management';

export function AccountPage() {
  const { state, memberships, signIn, signOut } = useIdentity();
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  async function emulatorSignIn(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      await signIn(email, password);
    } catch {
      setMessage(
        'Sign-in was unsuccessful. Check the local credentials and try again.',
      );
    } finally {
      setBusy(false);
    }
  }
  if (state.status === 'loading')
    return (
      <div className="page" role="status">
        Loading your account…
      </div>
    );
  if (state.status === 'error' && environment.mode === 'connected')
    return (
      <div className="page">
        <span className="eyebrow">Account</span>
        <h1>Course accounts are not configured</h1>
        <div className="card">
          <p>{state.message}</p>
          <p>
            You can keep browsing courses. No demonstration sign-in will be
            substituted in connected mode.
          </p>
          <Link className="button" to="/discover">
            Browse courses
          </Link>
        </div>
      </div>
    );
  if (state.status !== 'signed_in')
    return (
      <div className="page account-page">
        <span className="eyebrow">Account</span>
        <h1>Account</h1>
        <h2>Sign in to your course workspace</h2>
        <p>
          Course employees can update their authorized storefront. Golfer
          browsing never requires an account.
        </p>
        {environment.mode === 'demo' ? (
          <>
            <div className="notice">
              <strong>Browser-local demonstration</strong>
              <p>
                These fictional identities are not real accounts. Changes stay
                in this browser.
              </p>
            </div>
            <div className="demo-identity-grid">
              {demoIdentities.map((user) => (
                <button
                  className="card demo-identity"
                  key={user.uid}
                  onClick={() => void signIn(user.email)}
                >
                  <strong>
                    {user.membership
                      ? `Explore ${roleLabel(user.membership.role).toLowerCase()} demo`
                      : 'Explore golfer demo'}
                  </strong>
                  <span>
                    {user.displayName}
                    {user.uid === 'no-course-access'
                      ? ' · no course access'
                      : ''}
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <form className="card form-stack" onSubmit={emulatorSignIn}>
            <h2>Firebase emulator sign-in</h2>
            <label>
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label>
              Local password
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button className="button" disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}
        <p role="status">{message}</p>
      </div>
    );
  const user = state.user;
  return (
    <div className="page account-page">
      <span className="eyebrow">Signed-in account</span>
      <h1>{user.displayName}</h1>
      <div className="card">
        <dl className="details-list">
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Application mode</dt>
            <dd>{user.mode}</dd>
          </div>
        </dl>
        {user.mode === 'demo' && (
          <p className="notice">
            <strong>Local demo:</strong> management changes affect only this
            browser.
          </p>
        )}
        <h2>Authorized courses</h2>
        {memberships.length ? (
          memberships.map((m) => {
            const course = demoCourses.find((c) => c.id === m.courseId);
            return (
              <div className="membership" key={m.courseId}>
                <span>
                  <strong>{course?.name}</strong>
                  <br />
                  {roleLabel(m.role)} · {m.status}
                </span>
                {hasCapability(m, 'view_management_workspace') && (
                  <Link
                    className="button secondary"
                    to={`/manage/course/${m.courseId}`}
                  >
                    Manage course
                  </Link>
                )}
              </div>
            );
          })
        ) : (
          <p>You do not have an active course membership.</p>
        )}
        <div className="button-row">
          <button className="button secondary" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </div>
      <AccessRequest />
    </div>
  );
}
function AccessRequest() {
  const { state } = useIdentity();
  const [status, setStatus] = useState('');
  if (state.status !== 'signed_in') return null;
  const user = state.user;
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    try {
      submitDemoClaim(user, {
        courseId: String(data.get('courseId')),
        requestedRole: String(data.get('requestedRole')) as
          | 'course_owner'
          | 'course_manager',
        businessEmail: String(data.get('businessEmail')),
        explanation: String(data.get('explanation')),
      });
      setStatus(
        'Access request submitted. Golfer Goodies has not yet verified your relationship with this course.',
      );
      e.currentTarget.reset();
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'Request could not be submitted.',
      );
    }
  }
  return (
    <form className="card form-stack" onSubmit={submit}>
      <h2>Request access to a course</h2>
      <p>Submitting does not verify employment or create a membership.</p>
      <label>
        Course
        <select name="courseId" required>
          {demoCourses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Requested role
        <select name="requestedRole">
          <option value="course_manager">Course manager</option>
          <option value="course_owner">Course owner</option>
        </select>
      </label>
      <label>
        Business email
        <input name="businessEmail" type="email" required />
      </label>
      <label>
        How are you connected to this course?
        <textarea name="explanation" required minLength={10} />
      </label>
      <button className="button">Submit request</button>
      <p role="status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
