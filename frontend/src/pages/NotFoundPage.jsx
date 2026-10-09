import { StationBoard } from '../components/StationBoard';
import { Button } from '../components/Button';

export default function NotFoundPage() {
  return (
    <div className="max-w-xl">
      <StationBoard code="404" name="No such platform" size="lg" />
      <h1 className="mt-8 text-[clamp(2.25rem,5vw,3.25rem)]">This page does not exist</h1>
      <p className="mt-3 text-lg text-ink-soft">The link may be old, or the address has a typo.</p>
      <Button to="/" className="mt-8">Go to search</Button>
    </div>
  );
}
