// ─── Main export ──────────────────────────────────────────────────────────────

export function DesignView({
  data,
}: {
  data: Record<string, unknown>;
  section: string;
  slug: string;
}) {
  const meta = data.meta as Record<string, unknown> | undefined;
  const qf = data.quick_facts as Record<string, unknown> | undefined;
  const content = data.content as Record<string, unknown> | undefined;

  const colorPalette = content?.color_palette as Record<string, string> | undefined;
  const typography = content?.typography as Record<string, string> | undefined;
  const spacing = content?.spacing as string | undefined;
  const conventions = content?.component_conventions as string[] | undefined;

  // Color dot helper: extract hex from value string if present
  function extractHex(val: string): string | null {
    const m = val.match(/#[0-9A-Fa-f]{6}/);
    return m ? m[0] : null;
  }

  return (
    <div className="space-y-5">
      {/* ── Meta strip ── */}
      {meta?.owner != null && (
        <p className="text-xs text-gray-400">Owner: <span className="font-mono">{String(meta.owner)}</span></p>
      )}

      {/* ── Tech quick facts ── */}
      {qf != null && Object.keys(qf).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(qf).map(([k, v]) => (
            <div key={k} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{k.replace(/_/g, ' ')}</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-800">{String(v)}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Color palette ── */}
      {colorPalette != null && Object.keys(colorPalette).length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Color Palette</h2>
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
            {Object.entries(colorPalette).map(([name, val]) => {
              const hex = extractHex(val);
              return (
                <div key={name} className="flex items-center gap-3 px-4 py-2.5">
                  {hex && (
                    <span
                      className="w-5 h-5 rounded-full border border-gray-200 shrink-0"
                      style={{ backgroundColor: hex }}
                    />
                  )}
                  <span className="text-sm font-semibold text-gray-700 capitalize w-24 shrink-0">{name}</span>
                  <span className="text-sm text-gray-500 font-mono">{val}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Typography ── */}
      {typography != null && Object.keys(typography).length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Typography</h2>
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
            {Object.entries(typography).map(([k, v]) => (
              <div key={k} className="flex items-start gap-3 px-4 py-2.5">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36 shrink-0 pt-0.5">{k.replace(/_/g, ' ')}</span>
                <span className="text-sm text-gray-700">{v}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Spacing ── */}
      {spacing && (
        <section className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Spacing</h3>
          <p className="px-4 py-3 text-sm text-gray-700">{spacing}</p>
        </section>
      )}

      {/* ── Component conventions ── */}
      {conventions && conventions.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Component Conventions
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden divide-y divide-gray-100">
            {conventions.map((rule, i) => (
              <div key={i} className="flex gap-3 px-4 py-2.5">
                <span className="text-blue-300 shrink-0 mt-0.5">&#x2713;</span>
                <span className="text-sm text-gray-700">{rule}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
