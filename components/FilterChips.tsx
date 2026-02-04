'use client';

export type Filters = {
  quiet: boolean;
  bright: boolean;
  outlets: boolean;
  lowSensory: boolean;
  lingerOk: boolean;
  openLate: boolean;
};

type ChipProps = {
  active: boolean;
  label: string;
  onClick: () => void;
};

function Chip({ active, label, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`chip ${active ? 'chip-active' : ''}`}
    >
      {label}
    </button>
  );
}

export default function FilterChips({
  value,
  onChange,
}: {
  value: Filters;
  onChange: (value: Filters) => void;
}) {
  const toggle = (key: keyof Filters) => onChange({ ...value, [key]: !value[key] });

  return (
    <div className="chips">
      <Chip active={value.quiet} label="Quiet" onClick={() => toggle('quiet')} />
      <Chip active={value.bright} label="Bright" onClick={() => toggle('bright')} />
      <Chip active={value.outlets} label="Outlets" onClick={() => toggle('outlets')} />
      <Chip active={value.lowSensory} label="Low-sensory" onClick={() => toggle('lowSensory')} />
      <Chip active={value.lingerOk} label="Linger OK" onClick={() => toggle('lingerOk')} />
      <Chip active={value.openLate} label="Open late" onClick={() => toggle('openLate')} />
    </div>
  );
}
