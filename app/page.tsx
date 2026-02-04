'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import FilterChips, { Filters } from '@/components/FilterChips';
import PlaceCard from '@/components/PlaceCard';
import type { Place } from '@/lib/types';

const Map = dynamic(() => import('@/components/Map'), { ssr: false });

const filterLabels: Record<keyof Filters, string> = {
  quiet: 'Quiet',
  bright: 'Bright',
  outlets: 'Outlets',
  lowSensory: 'Low-sensory',
  lingerOk: 'Linger OK',
  openLate: 'Open late',
};

export default function Home() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState<Filters>({
    quiet: false,
    bright: false,
    outlets: false,
    lowSensory: false,
    lingerOk: false,
    openLate: false,
  });

  const bbox = useMemo(
    () => ({ w: -122.459696, s: 47.481002, e: -122.224433, n: 47.734136 }),
    [],
  );

  const activeFilters = useMemo(
    () =>
      Object.entries(filters)
        .filter(([, value]) => value)
        .map(([key]) => filterLabels[key as keyof Filters]),
    [filters],
  );

  const stats = useMemo(
    () => ({
      total: places.length,
      quiet: places.filter((place) => (place.quiet_level ?? 0) >= 2).length,
      outlets: places.filter((place) => (place.outlets_density ?? 0) >= 2).length,
    }),
    [places],
  );

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError('');

      try {
        const params = new URLSearchParams();
        params.set('bbox', `${bbox.w},${bbox.s},${bbox.e},${bbox.n}`);
        Object.entries(filters).forEach(([key, value]) => {
          if (value) params.set(key, '1');
        });

        const response = await fetch(`/api/places?${params.toString()}`, {
          signal: controller.signal,
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || 'Failed to load places.');
        }

        if (mounted) {
          setPlaces(payload.places || []);
        }
      } catch (err) {
        if (mounted && (err as Error).name !== 'AbortError') {
          setError((err as Error).message || 'Something went wrong.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [filters, bbox]);

  return (
    <main className="layout">
      <section className="panel">
        <div className="panel-header">
          <p className="eyebrow">Seattle core</p>
          <h1 className="page-title">Find your third place</h1>
          <p className="lede">
            Filter by vibe, map the neighborhood, and uncover spaces designed for calm,
            creativity, and connection.
          </p>
        </div>

        <div className="stat-grid">
          <div className="stat">
            <span className="stat-label">Places in view</span>
            <span className="stat-value">{stats.total}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Quiet options</span>
            <span className="stat-value">{stats.quiet}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Outlet-friendly</span>
            <span className="stat-value">{stats.outlets}</span>
          </div>
        </div>

        <div className="filter-block">
          <div className="filter-header">
            <h2 className="section-title">Filters</h2>
            <span className="muted">
              {activeFilters.length ? `${activeFilters.length} active` : 'No filters'}
            </span>
          </div>
          <FilterChips value={filters} onChange={setFilters} />
          <p className="filter-summary">
            Active:{' '}
            <span className="muted">
              {activeFilters.length ? activeFilters.join(', ') : 'None'}
            </span>
          </p>
        </div>

        <div className="results">
          <div className="results-header">
            <h2 className="section-title">Results</h2>
            <span className="muted">{loading ? 'Loading...' : `${places.length} places`}</span>
          </div>
          {error && <div className="notice notice-error">{error}</div>}
          {loading && <div className="notice">Loading places...</div>}
          {!loading && !places.length && !error && (
            <div className="notice">No matches yet. Try loosening a filter.</div>
          )}
          <div className="cards">
            {places.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </div>
        </div>
      </section>

      <section className="map-panel">
        <div className="map-card">
          <Map places={places} />
        </div>
        <p className="map-meta muted">Tip: click a marker to preview details.</p>
      </section>
    </main>
  );
}
