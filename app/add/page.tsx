"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

type FormState = {
  name: string;
  address: string;
  city: string;
  category: string;
  lat: number;
  lng: number;
  quiet_level: number;
  lighting_level: number;
  outlets_density: number;
  seating_type: string;
  linger_ok: boolean;
  low_sensory: boolean;
  outdoor_seating: boolean;
  accessible_restroom: boolean;
  open_late: boolean;
  wifi_quality: number;
  safety_evening: number;
};

type Status = { type: 'idle' | 'success' | 'error'; message: string };

export default function Add() {
  const [form, setForm] = useState<FormState>({
    name: '',
    address: '',
    city: 'Seattle',
    category: 'library',
    lat: 47.6062,
    lng: -122.3321,
    quiet_level: 2,
    lighting_level: 2,
    outlets_density: 2,
    seating_type: 'table',
    linger_ok: true,
    low_sensory: false,
    outdoor_seating: false,
    accessible_restroom: true,
    open_late: false,
    wifi_quality: 2,
    safety_evening: 2,
  });

  const [status, setStatus] = useState<Status>({ type: 'idle', message: '' });
  const [saving, setSaving] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  const updateCoords = (lat: number, lng: number) =>
    setForm((current) => ({ ...current, lat, lng }));

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ type: 'idle', message: '' });
    setSaving(true);

    try {
      const response = await fetch('/api/places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || 'Unable to save this place.');
      }

      setStatus({ type: 'success', message: 'Saved. Thanks for sharing a new spot.' });
    } catch (err) {
      setStatus({
        type: 'error',
        message: (err as Error).message || 'Something went wrong.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="layout layout-add">
      <section className="panel">
        <div className="panel-header">
          <p className="eyebrow">Contribute</p>
          <h1 className="page-title">Add a third place</h1>
          <p className="lede">
            Share a calm, welcoming space. Your notes help others find places that feel
            safe, comfortable, and worth lingering in.
          </p>
        </div>

        <form onSubmit={save} className="form">
          <div className="field">
            <label className="label" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              className="input"
              placeholder="Discovery Park Library"
              value={form.name}
              onChange={(event) => update('name', event.target.value)}
              required
            />
          </div>

          <div className="field">
            <label className="label" htmlFor="address">
              Address
            </label>
            <input
              id="address"
              className="input"
              placeholder="3801 Discovery Park Blvd"
              value={form.address}
              onChange={(event) => update('address', event.target.value)}
              required
            />
          </div>

          <div className="field-grid">
            <div className="field">
              <label className="label" htmlFor="city">
                City
              </label>
              <input
                id="city"
                className="input"
                value={form.city}
                onChange={(event) => update('city', event.target.value)}
                required
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                className="input"
                value={form.category}
                onChange={(event) => update('category', event.target.value)}
              >
                <option value="library">Library</option>
                <option value="cafe">Cafe</option>
                <option value="park">Park</option>
                <option value="museum lobby">Museum lobby</option>
                <option value="hotel lobby">Hotel lobby</option>
                <option value="community">Community</option>
                <option value="university library">University library</option>
                <option value="cowork">Cowork</option>
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="seating">
                Seating
              </label>
              <select
                id="seating"
                className="input"
                value={form.seating_type}
                onChange={(event) => update('seating_type', event.target.value)}
              >
                <option value="table">Table</option>
                <option value="bar">Bar</option>
                <option value="soft">Soft seating</option>
                <option value="bench">Bench</option>
              </select>
            </div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label className="label" htmlFor="quiet">
                Quiet level (0-3)
              </label>
              <input
                id="quiet"
                type="number"
                min={0}
                max={3}
                className="input"
                value={form.quiet_level}
                onChange={(event) => update('quiet_level', Number(event.target.value))}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="light">
                Lighting (0-3)
              </label>
              <input
                id="light"
                type="number"
                min={0}
                max={3}
                className="input"
                value={form.lighting_level}
                onChange={(event) => update('lighting_level', Number(event.target.value))}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="outlets">
                Outlets (0-3)
              </label>
              <input
                id="outlets"
                type="number"
                min={0}
                max={3}
                className="input"
                value={form.outlets_density}
                onChange={(event) => update('outlets_density', Number(event.target.value))}
              />
            </div>
          </div>

          <div className="field-grid">
            <div className="field">
              <label className="label" htmlFor="wifi">
                Wifi quality (0-3)
              </label>
              <input
                id="wifi"
                type="number"
                min={0}
                max={3}
                className="input"
                value={form.wifi_quality}
                onChange={(event) => update('wifi_quality', Number(event.target.value))}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="safety">
                Evening safety (0-3)
              </label>
              <input
                id="safety"
                type="number"
                min={0}
                max={3}
                className="input"
                value={form.safety_evening}
                onChange={(event) => update('safety_evening', Number(event.target.value))}
              />
            </div>
          </div>

          <div className="check-grid">
            <label className="check">
              <input
                type="checkbox"
                checked={form.linger_ok}
                onChange={(event) => update('linger_ok', event.target.checked)}
              />
              Linger OK
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.low_sensory}
                onChange={(event) => update('low_sensory', event.target.checked)}
              />
              Low-sensory
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.outdoor_seating}
                onChange={(event) => update('outdoor_seating', event.target.checked)}
              />
              Outdoor seating
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.accessible_restroom}
                onChange={(event) => update('accessible_restroom', event.target.checked)}
              />
              Accessible restroom
            </label>
            <label className="check">
              <input
                type="checkbox"
                checked={form.open_late}
                onChange={(event) => update('open_late', event.target.checked)}
              />
              Open late
            </label>
          </div>

          <div className="form-actions">
            <button className="button" type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save place'}
            </button>
            {status.message && (
              <div className={`notice ${status.type === 'error' ? 'notice-error' : ''}`}>
                {status.message}
              </div>
            )}
          </div>
        </form>
      </section>

      <section className="map-panel">
        <div className="map-card">
          <Map
            center={[form.lat, form.lng]}
            markerPosition={[form.lat, form.lng]}
            onPick={updateCoords}
            className="map-shell map-shell-tall"
          />
        </div>
        <p className="map-meta muted">Click the map to set coordinates.</p>
      </section>
    </main>
  );
}
