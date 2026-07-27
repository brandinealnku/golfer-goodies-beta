import { Link } from 'react-router-dom';
import { Button, Card } from './ui';
export function EmulatorError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  function switchToDemo() {
    const url = new URL(window.location.href);
    url.searchParams.set('appMode', 'demo');
    url.hash = '#/discover';
    window.location.assign(url);
  }
  return (
    <Card>
      <h2>Local marketplace unavailable</h2>
      <p role="alert">{message}</p>
      <div className="card-badges">
        <Button onClick={onRetry}>Retry local connection</Button>
        <Link className="button" to="/dev/emulators">
          Open emulator diagnostics
        </Link>
        <Button onClick={switchToDemo}>Switch to demo mode</Button>
      </div>
    </Card>
  );
}
