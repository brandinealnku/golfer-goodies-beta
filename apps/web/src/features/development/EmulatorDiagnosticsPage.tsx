import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Card, PageHeader } from '../../components/ui';
import { environment } from '../../config/environment';
import { emulatorPorts, LOCAL_PROJECT_ID } from '../../firebase/config';
import { checkEmulators } from '../../firebase/status';
export function EmulatorDiagnosticsPage() {
  const [status, setStatus] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('Not checked');
  if (environment.mode === 'connected')
    return (
      <div className="page">
        <PageHeader title="Diagnostics unavailable" />
        <Alert>Connected mode is not configured in Phase 3.</Alert>
      </div>
    );
  async function check() {
    setMessage('Checking local emulators…');
    try {
      const result = await checkEmulators();
      setStatus(result);
      setMessage('Local emulator check completed.');
    } catch {
      setMessage(
        'Local emulators are unavailable. Start and seed them, retry, or switch to demo mode.',
      );
    }
  }
  return (
    <div className="page">
      <PageHeader title="Local emulator diagnostics" />
      <p aria-live="polite">{message}</p>
      <Card>
        <h2>Expected local stack</h2>
        <p>
          Project: <code>{LOCAL_PROJECT_ID}</code>
        </p>
        <p>
          Emulator UI:{' '}
          <a href={`http://127.0.0.1:${emulatorPorts.ui}`}>
            127.0.0.1:{emulatorPorts.ui}
          </a>
        </p>
        <Button onClick={() => void check()}>Run safe health check</Button>
        <dl>
          {Object.entries(status).map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p>Never use this project identity for production.</p>
        <Link className="button" to="/discover">
          Return to marketplace
        </Link>
      </Card>
    </div>
  );
}
