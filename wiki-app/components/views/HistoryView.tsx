// ─── Types ────────────────────────────────────────────────────────────────────

interface QuickFacts {
  date?: string;
  sprint?: string | number;
  triggered_by?: string;
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function HistoryView({
  data,
}: {
  data: Record<string, unknown>;
  section: string;
  slug: string;
}) {
  const meta = data.meta as Record<string, unknown> | undefined;
  const qf = data.quick_facts as QuickFacts | undefined;
  const content = data.content as Record<string, unknown> | undefined;

  const tldr = content?.tldr as string | undefined;
  const scratchNotes = content?.scratch_notes as string[] | undefined;
  const filesCreated = [
    ...((content?.files_created as string[] | undefined) ?? []),
    ...((content?.files_created_session3 as string[] | undefined) ?? []),
    ...((content?.files_created_session4 as string[] | undefined) ?? []),
  ];
  const filesUpdated = content?.files_updated as string[] | undefined;

  return (
    <div className="space-y-5">
      {/* ── Meta strip ── */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        {meta?.owner != null && (
          <span>Owner: <span className="font-mono">{String(meta.owner)}</span></span>
        )}
        {qf?.date && (
          <span className="bg-gray-100 rounded px-2 py-0.5 font-mono">{qf.date}</span>
        )}
        {qf?.sprint != null && (
          <span className="bg-blue-50 text-blue-600 rounded px-2 py-0.5">Sprint {qf.sprint}</span>
        )}
      </div>

      {/* ── Triggered by ── */}
      {qf?.triggered_by && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-1">Triggered By</p>
          <p className="text-sm text-blue-900">{qf.triggered_by}</p>
        </div>
      )}

      {/* ── Summary ── */}
      {tldr && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Summary</p>
          <p className="text-sm text-gray-700">{tldr}</p>
        </div>
      )}

      {/* ── Session log / scratch notes ── */}
      {scratchNotes && scratchNotes.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Session Log ({scratchNotes.length} entries)
          </h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
            {scratchNotes.map((note, i) => {
              const isSection = note.startsWith('SESSION') || note.startsWith('SPRINT') ||
                note.startsWith('ROADMAP') || note.startsWith('BA SESSION') ||
                note.startsWith('NEXT STEP') || note.startsWith('WIKI-APP') ||
                note.startsWith('STATUS:') || note.startsWith('updated wiki/changelog');
              return (
                <div
                  key={i}
                  className={`px-4 py-2 text-sm ${isSection ? 'bg-gray-50 font-medium text-gray-700' : 'bg-white text-gray-600'}`}
                >
                  <span className="text-gray-300 font-mono text-xs mr-2 select-none">{String(i + 1).padStart(3, '0')}</span>
                  {note}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Files created ── */}
      {filesCreated.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Files Created ({filesCreated.length})
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <div className="flex flex-wrap gap-1.5">
              {filesCreated.map((f) => (
                <code key={f} className="text-xs bg-green-50 text-green-700 border border-green-200 rounded px-1.5 py-0.5 font-mono">{f}</code>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Files updated ── */}
      {filesUpdated && filesUpdated.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Files Updated ({filesUpdated.length})
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <div className="flex flex-wrap gap-1.5">
              {filesUpdated.map((f) => (
                <code key={f} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 font-mono">{f}</code>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
