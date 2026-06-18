import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LiveRegion } from '@/components/a11y/LiveRegion';

describe('LiveRegion', () => {
  it('renders polite status region with message', () => {
    render(<LiveRegion message="Moved Seven of Hearts" />);
    const region = screen.getByRole('status');
    expect(region.getAttribute('aria-live')).toBe('polite');
    expect(region.getAttribute('aria-atomic')).toBe('true');
    expect(region.textContent).toBe('Moved Seven of Hearts');
  });

  it('supports assertive politeness', () => {
    render(<LiveRegion message="Game won" politeness="assertive" />);
    expect(screen.getByRole('status').getAttribute('aria-live')).toBe('assertive');
  });
});
