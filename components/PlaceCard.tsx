'use client';

import type { Place } from '@/lib/types';

export default function PlaceCard({ place }: { place: Place }) {
  const tags: string[] = [];

  if ((place.quiet_level ?? 0) >= 2) tags.push('Quiet');
  if ((place.lighting_level ?? 0) >= 2) tags.push('Bright');
  if ((place.outlets_density ?? 0) >= 2) tags.push('Outlets');
  if (place.linger_ok) tags.push('Linger OK');
  if (place.low_sensory) tags.push('Low-sensory');
  if (place.open_late) tags.push('Open late');
  if (place.accessible_restroom) tags.push('Accessible restroom');

  return (
    <article className="card">
      <div className="card-top">
        <div>
          <h3 className="card-title">{place.name}</h3>
          <p className="card-meta">
            {place.category}
            {place.address ? ` • ${place.address}` : ''}
          </p>
        </div>
        <span className="card-pill">{place.category}</span>
      </div>
      <div className="card-tags">
        {tags.length ? (
          tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))
        ) : (
          <span className="tag tag-muted">No vibe tags yet</span>
        )}
      </div>
    </article>
  );
}
