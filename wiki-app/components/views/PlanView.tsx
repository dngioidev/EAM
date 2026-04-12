import { StatusBadge } from '@/components/StatusBadge';

// ─── Types ────────────────────────────────────────────────────────────────────

interface BacklogItem {
  id: string;
  title: string;
  epic?: string;
  priority?: number;
  sprint?: number;
  status?: string;
  size?: string;
  depends_on?: string[];
}

interface Epic {
  id: string;
  title: string;
  sprints?: number[];
  features?: string[];
}

interface CommittedFeature {
  id: string;
  title: string;
  priority?: number;
  rationale?: string;
  size?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SIZE_COLORS: Record<string, string> = {
  XS: 'bg-gray-100 text-gray-500',
  S:  'bg-green-50 text-green-600',
  M:  'bg-blue-50 text-blue-600',
  L:  'bg-orange-50 text-orange-600',
  XL: 'bg-red-50 text-red-600',
};

function SizeChip({ size }: { size: string }) {
  const cls = SIZE_COLORS[size] ?? 'bg-gray-100 text-gray-500';
  return (
    <span className={`text-xs font-bold rounded px-1.5 py-0.5 ${cls}`}>{size}</span>
  );
}

// ─── Backlog sub-view ─────────────────────────────────────────────────────────

function BacklogView({
  epics,
  items,
}: {
  epics: Epic[];
  items: BacklogItem[];
}) {
  // Group items by epic
  const byEpic = new Map<string, BacklogItem[]>();
  const noEpic: BacklogItem[] = [];

  for (const item of items) {
    if (item.epic) {
      const arr = byEpic.get(item.epic) ?? [];
      arr.push(item);
      byEpic.set(item.epic, arr);
    } else {
      noEpic.push(item);
    }
  }

  const epicOrder = epics.map((e) => e.id);

  return (
    <div className="space-y-6">
      {epicOrder.map((epicId) => {
        const epic = epics.find((e) => e.id === epicId);
        const epicItems = byEpic.get(epicId) ?? [];
        if (!epic) return null;
        return (
          <section key={epicId}>
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-sm font-bold text-gray-800">{epic.title}</h2>
              {epic.sprints && epic.sprints.length > 0 && (
                <span className="text-xs text-gray-400">
                  Sprint {epic.sprints.join(', ')}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {epicItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3"
                >
                  <span className="text-xs font-mono text-gray-300 w-5 shrink-0 mt-0.5">
                    {item.priority}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{item.title}</span>
                      {item.status && <StatusBadge status={item.status} />}
                      {item.size && <SizeChip size={item.size} />}
                      {item.sprint != null && (
                        <span className="text-xs text-gray-400">Sprint {item.sprint}</span>
                      )}
                    </div>
                    {item.depends_on && item.depends_on.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span className="text-xs text-gray-400">Depends on:</span>
                        {item.depends_on.map((d) => (
                          <code key={d} className="text-xs bg-gray-100 text-gray-500 rounded px-1 py-0.5 font-mono">{d}</code>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
      {noEpic.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-gray-800 mb-3">Uncategorised</h2>
          <div className="space-y-2">
            {noEpic.map((item) => (
              <div key={item.id} className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3">
                <span className="text-sm font-semibold text-gray-900">{item.title}</span>
                {item.status && <StatusBadge status={item.status} />}
                {item.size && <SizeChip size={item.size} />}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// ─── Sprint sub-view ──────────────────────────────────────────────────────────

function SprintView({
  qf,
  content,
}: {
  qf: Record<string, unknown>;
  content: Record<string, unknown>;
}) {
  const committed = content.features_committed as CommittedFeature[] | undefined;
  const outOfScope = content.out_of_scope as string[] | undefined;
  // Support both field names used across sprint files
  const dependencies = [
    ...((content.dependencies as string[] | undefined) ?? []),
    ...((content.prerequisites as string[] | undefined) ?? []),
  ];
  const riskNotes = [
    ...((content.risks as string[] | undefined) ?? []),
    ...((content.risk_notes as string[] | undefined) ?? []),
  ];

  return (
    <div className="space-y-5">
      {/* Quick facts grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Object.entries(qf).map(([k, v]) => {
          if (v === null || v === undefined) return null;
          const label = k.replace(/_/g, ' ');
          const display = typeof v === 'object' ? JSON.stringify(v) : String(v);
          return (
            <div key={k} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
              {k === 'status' ? (
                <div className="mt-0.5"><StatusBadge status={display} /></div>
              ) : (
                <p className="mt-0.5 text-sm font-bold text-gray-800">{display}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Committed features */}
      {committed && committed.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Committed Features ({committed.length})
          </h2>
          <div className="space-y-2">
            {committed.map((f, i) => (
              <div key={f.id} className="rounded-lg border border-gray-200 bg-white px-4 py-3 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-300 font-mono w-4 shrink-0">{i + 1}</span>
                  <span className="text-sm font-semibold text-gray-900">{f.title}</span>
                  {f.size && <SizeChip size={f.size} />}
                </div>
                {f.rationale && (
                  <p className="text-xs text-gray-500 ml-6">{f.rationale}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Out of scope */}
      {outOfScope && outOfScope.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Out of Scope
          </h3>
          <ul className="px-4 py-3 space-y-1.5">
            {outOfScope.map((item, i) => (
              <li key={i} className="text-sm text-gray-500 flex gap-2">
                <span className="text-gray-300 shrink-0">&#x2014;</span>{item}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Dependencies / Prerequisites */}
      {dependencies.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Dependencies
          </h3>
          <ul className="px-4 py-3 space-y-1.5">
            {dependencies.map((d, i) => (
              <li key={i} className="text-sm text-gray-600 flex gap-2">
                <span className="text-gray-300 shrink-0">&#x2022;</span>{d}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Risks */}
      {riskNotes.length > 0 && (
        <section className="rounded-lg border border-amber-200 bg-amber-50 overflow-hidden">
          <h3 className="border-b border-amber-100 bg-amber-100 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-600">
            Risks
          </h3>
          <ul className="px-4 py-3 space-y-1.5">
            {riskNotes.map((r, i) => (
              <li key={i} className="text-sm text-amber-800 flex gap-2">
                <span className="text-amber-400 shrink-0">&#x26A0;</span>{r}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function PlanView({
  data,
}: {
  data: Record<string, unknown>;
  section: string;
  slug: string;
}) {
  const meta = data.meta as Record<string, unknown> | undefined;
  const qf = data.quick_facts as Record<string, unknown> | undefined;
  const content = data.content as Record<string, unknown> | undefined;

  const tldr = content?.tldr as string | undefined;

  // Detect backlog shape (has epics + items)
  const epics = content?.epics as Epic[] | undefined;
  const items = content?.items as BacklogItem[] | undefined;

  return (
    <div className="space-y-5">
      {/* ── Meta strip ── */}
      {meta?.owner != null && (
        <p className="text-xs text-gray-400">Owner: <span className="font-mono">{String(meta.owner)}</span></p>
      )}

      {/* ── Summary ── */}
      {tldr && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Summary</p>
          <p className="text-sm text-gray-700">{tldr}</p>
        </div>
      )}

      {/* ── Status summary chips (backlog) ── */}
      {qf?.status_summary != null && typeof qf.status_summary === 'object' && !Array.isArray(qf.status_summary) && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(qf.status_summary as Record<string, unknown>).map(([k, v]) => (
            <div key={k} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-center min-w-[80px]">
              <p className="text-lg font-bold text-gray-900">{String(v)}</p>
              <p className="text-xs text-gray-400 capitalize">{k.replace(/_/g, ' ')}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Backlog view OR sprint view ── */}
      {epics != null && items != null ? (
        <BacklogView epics={epics} items={items} />
      ) : qf != null && content != null ? (
        <SprintView qf={qf} content={content} />
      ) : null}
    </div>
  );
}
