import { render, screen } from '@testing-library/react';
import SpatialHeatmap from './SpatialHeatmap';
import type { ParkingSpot } from '../types/parking';

describe('SpatialHeatmap', () => {
  it('maps heatmap thresholds to high, moderate, and low demand colors', () => {
    const spots: ParkingSpot[] = [
      { id: 'A1', status: 'occupied', heatRate: 90 },
      { id: 'B1', status: 'occupied', heatRate: 50 },
      { id: 'C1', status: 'available', heatRate: 10 },
    ];

    render(<SpatialHeatmap spots={spots} mode="heatmap" />);

    expect(screen.getByRole('button', { name: 'A1' }).className).toContain('bg-[var(--pp-danger)]');
    expect(screen.getByRole('button', { name: 'B1' }).className).toContain('bg-[var(--pp-warning-soft)]');
    expect(screen.getByRole('button', { name: 'C1' }).className).toContain('bg-[var(--pp-success-soft)]');
    expect(screen.getByText('High demand 80-100%')).toBeInTheDocument();
    expect(screen.getByText('Moderate 40-79%')).toBeInTheDocument();
    expect(screen.getByText('Low 0-39%')).toBeInTheDocument();
  });
});
