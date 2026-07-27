import { PageHeader, Card } from '../components/ui';
export function PlaceholderPage({
  title,
  phase,
}: {
  title: string;
  phase: string;
}) {
  return (
    <div className="page">
      <PageHeader title={title} />
      <Card>
        <h2>Foundation ready</h2>
        <p>{phase}</p>
        <p>
          This is a clearly labeled placeholder. No operational backend behavior
          is available.
        </p>
      </Card>
    </div>
  );
}
