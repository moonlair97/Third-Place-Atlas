export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabaseClient';
import data from '@/data/places.seattle.json' assert { type: 'json' };

type Filters = {
  quiet: boolean;
  bright: boolean;
  outlets: boolean;
  lowSensory: boolean;
  lingerOk: boolean;
  openLate: boolean;
};

type BBox = { w: number; s: number; e: number; n: number };

const LIMIT = 200;

const parseBBox = (value: string | null): BBox | null => {
  if (!value) return null;
  const [w, s, e, n] = value.split(',').map(Number);
  if ([w, s, e, n].some((num) => Number.isNaN(num))) return null;
  return { w, s, e, n };
};

const parseFilters = (params: URLSearchParams): Filters => ({
  quiet: params.has('quiet'),
  bright: params.has('bright'),
  outlets: params.has('outlets'),
  lowSensory: params.has('lowSensory'),
  lingerOk: params.has('lingerOk'),
  openLate: params.has('openLate'),
});

const applyFiltersToList = (items: any[], filters: Filters, bbox: BBox | null) => {
  let results = items;

  if (bbox) {
    results = results.filter(
      (place) =>
        place.lat >= bbox.s &&
        place.lat <= bbox.n &&
        place.lng >= bbox.w &&
        place.lng <= bbox.e,
    );
  }

  if (filters.quiet) results = results.filter((place) => place.quiet_level >= 2);
  if (filters.bright) results = results.filter((place) => place.lighting_level >= 2);
  if (filters.outlets) results = results.filter((place) => place.outlets_density >= 2);
  if (filters.lowSensory) results = results.filter((place) => place.low_sensory);
  if (filters.lingerOk) results = results.filter((place) => place.linger_ok);
  if (filters.openLate) results = results.filter((place) => place.open_late);

  return results;
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const bbox = parseBBox(searchParams.get('bbox'));
  const filters = parseFilters(searchParams);
  const supabase = getSupabaseClient();

  if (supabase) {
    let query = supabase.from('places').select('*').limit(LIMIT) as any;

    if (bbox) {
      query = query
        .gte('lat', bbox.s)
        .lte('lat', bbox.n)
        .gte('lng', bbox.w)
        .lte('lng', bbox.e);
    }

    if (filters.quiet) query = query.gte('quiet_level', 2);
    if (filters.bright) query = query.gte('lighting_level', 2);
    if (filters.outlets) query = query.gte('outlets_density', 2);
    if (filters.lowSensory) query = query.eq('low_sensory', true);
    if (filters.lingerOk) query = query.eq('linger_ok', true);
    if (filters.openLate) query = query.eq('open_late', true);

    const { data: rows, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ places: rows || [] });
  }

  let places: any[] = data as any[];
  let extraPlaces: any[] = [];

  try {
    const fs = await import('fs');
    const path = (await import('path')).default;
    const filePath = path.join(process.cwd(), 'data', 'user-places.json');
    if (fs.existsSync(filePath)) {
      const extra = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      if (Array.isArray(extra)) {
        extraPlaces = extra;
      }
    }
  } catch {
    // Ignore local file errors in read-only environments.
  }

  places = applyFiltersToList(places.concat(extraPlaces), filters, bbox);
  return NextResponse.json({ places });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const required = ['name', 'address', 'city', 'category', 'lat', 'lng'] as const;

  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      return NextResponse.json({ error: `Missing field: ${field}` }, { status: 400 });
    }
  }

  if (!Number.isFinite(body.lat) || !Number.isFinite(body.lng)) {
    return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 });
  }

  const cleaned = {
    ...body,
    name: String(body.name).trim(),
    address: String(body.address).trim(),
    city: String(body.city).trim(),
    category: String(body.category).trim(),
  };

  const id =
    body.id ||
    cleaned.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  cleaned.id = id;

  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from('places').upsert([cleaned]);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true, id });
  }

  const fs = await import('fs');
  const path = (await import('path')).default;
  const filePath = path.join(process.cwd(), 'data', 'user-places.json');
  let entries: any[] = [];

  if (fs.existsSync(filePath)) {
    try {
      entries = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
      entries = [];
    }
  }

  const existingIndex = entries.findIndex((place) => place.id === id);
  if (existingIndex >= 0) {
    entries[existingIndex] = cleaned;
  } else {
    entries.push(cleaned);
  }

  fs.writeFileSync(filePath, JSON.stringify(entries, null, 2));
  return NextResponse.json({ ok: true, id });
}
