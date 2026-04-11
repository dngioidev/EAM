'use client';

interface JsonBlockProps {
  data: unknown;
}

const PRIMITIVES = new Set(['string', 'number', 'boolean']);

function JsonValue({ value, depth = 0 }: { value: unknown; depth?: number }) {
  if (value === null) return <span className="text-gray-400">null</span>;
  if (typeof value === 'boolean')
    return <span className="text-purple-600">{String(value)}</span>;
  if (typeof value === 'number')
    return <span className="text-blue-600">{value}</span>;
  if (typeof value === 'string')
    return <span className="text-green-700">"{value}"</span>;

  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-500">[]</span>;
    // Flat array of primitives → inline
    if (value.every((v) => PRIMITIVES.has(typeof v))) {
      return (
        <span>
          [{value.map((v, i) => (
            <span key={i}>
              {i > 0 && <span className="text-gray-400">, </span>}
              <JsonValue value={v} />
            </span>
          ))}
          ]
        </span>
      );
    }
    return (
      <ul className="ml-4 space-y-1 border-l border-gray-100 pl-3">
        {value.map((v, i) => (
          <li key={i}>
            <JsonValue value={v} depth={depth + 1} />
          </li>
        ))}
      </ul>
    );
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return <span className="text-gray-400">{'{}'}</span>;
    return (
      <dl className="ml-4 space-y-1 border-l border-gray-100 pl-3">
        {entries.map(([k, v]) => (
          <div key={k} className="flex flex-wrap items-baseline gap-1">
            <dt className="shrink-0 font-medium text-gray-700">{k}:</dt>
            <dd>
              <JsonValue value={v} depth={depth + 1} />
            </dd>
          </div>
        ))}
      </dl>
    );
  }

  return <span>{String(value)}</span>;
}

/** Top-level sections rendered as expandable cards */
export function JsonBlock({ data }: JsonBlockProps) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-4 font-mono text-sm">
        <JsonValue value={data} />
      </div>
    );
  }

  const entries = Object.entries(data as Record<string, unknown>);

  // Render top-level "audit" array as a separate timeline
  const mainEntries = entries.filter(([k]) => k !== 'audit');
  const auditEntry = entries.find(([k]) => k === 'audit');

  return (
    <div className="space-y-4 font-mono text-sm">
      {mainEntries.map(([key, value]) => (
        <section key={key} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            {key}
          </h3>
          <div className="p-4">
            <JsonValue value={value} />
          </div>
        </section>
      ))}

      {auditEntry && (
        <section className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            audit trail
          </h3>
          <ul className="divide-y divide-gray-100">
            {(auditEntry[1] as Record<string, unknown>[]).map((entry, i) => (
              <li key={i} className="px-4 py-3 text-xs">
                <span className="font-medium text-gray-800">{String(entry.action)}</span>
                {' · '}
                <span className="text-gray-500">{String(entry.author)}</span>
                {' · '}
                <span className="text-gray-400">{String(entry.timestamp)}</span>
                {entry.note && (
                  <p className="mt-0.5 text-gray-500">{String(entry.note)}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
