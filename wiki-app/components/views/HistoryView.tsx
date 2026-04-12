// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * History entries may have evolved across sessions — three schemas exist:
 *   A (2026-04-12): { meta, quick_facts, content, audit }
 *   B (2026-04-13): { meta, session, scratch_notes, decisions, … }
 *   C (2026-04-14): { meta, session }
 * All normalisation happens here so the render tree stays clean.
 */
function normalise(data: Record<string, unknown>) {
  const meta   = (data.meta   as Record<string, unknown> | undefined) ?? {};
  const qf     = (data.quick_facts as Record<string, unknown> | undefined);
  const content= (data.content as Record<string, unknown> | undefined);
  const session= (data.session as Record<string, unknown> | undefined);

  // ── Scalar fields ──────────────────────────────────────────────────────────
  const date    = (qf?.date    ?? meta.date    ?? meta.last_updated) as string | undefined;
  const sprint  = (qf?.sprint  ?? meta.sprint  ?? session?.sprint)   as string | number | undefined;
  const author  = (meta.owner  ?? meta.author)                       as string | undefined;
  const triggeredBy = qf?.triggered_by                               as string | undefined;

  // ── Summary ────────────────────────────────────────────────────────────────
  const summary = (
    content?.tldr    ??
    session?.summary ??
    session?.goal
  ) as string | undefined;

  // ── Session quick-facts (goal / branch / outcome) ──────────────────────────
  const sessionGoal    = (session?.goal    && !summary) ? session.goal    as string : undefined;
  const sessionBranch  = session?.branch                as string | undefined;
  const sessionOutcome = session?.outcome               as string | undefined;

  // ── Scratch notes (schema A: content.scratch_notes, schema B: top-level) ──
  const scratchNotes = (
    (content?.scratch_notes as string[] | undefined) ??
    (data.scratch_notes     as string[] | undefined) ??
    []
  );

  // ── Completed tasks / blockers (schema C: session.*) ──────────────────────
  const completedTasks    = session?.completed_tasks     as string[] | undefined;
  const blockersResolved  = session?.blockers_resolved   as string[] | undefined;

  // ── Files (schema A: content.*) ───────────────────────────────────────────
  const filesCreated = [
    ...((content?.files_created          as string[] | undefined) ?? []),
    ...((content?.files_created_session3 as string[] | undefined) ?? []),
    ...((content?.files_created_session4 as string[] | undefined) ?? []),
  ];
  const filesUpdated = (content?.files_updated as string[] | undefined) ?? [];

  // ── Extra top-level keys — render as JSON (schema B extras) ───────────────
  const KNOWN_KEYS = new Set([
    'meta', 'quick_facts', 'content', 'audit', 'session', 'scratch_notes',
  ]);
  const extras = Object.entries(data)
    .filter(([k]) => !KNOWN_KEYS.has(k))
    .map(([k, v]) => ({ key: k, value: v }));

  return {
    date, sprint, author, triggeredBy,
    summary, sessionGoal, sessionBranch, sessionOutcome,
    scratchNotes, completedTasks, blockersResolved,
    filesCreated, filesUpdated, extras,
  };
}

function ScratchLog({ notes }: { notes: string[] }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
      {notes.map((note, i) => {
        const isHeader =
          note.startsWith('SESSION') || note.startsWith('SPRINT') ||
          note.startsWith('ROADMAP') || note.startsWith('BA SESSION') ||
          note.startsWith('NEXT STEP') || note.startsWith('WIKI-APP') ||
          note.startsWith('STATUS:') || note.startsWith('updated wiki/');
        return (
          <div
            key={i}
            className={`px-4 py-2 text-sm ${isHeader ? 'bg-gray-50 font-medium text-gray-700' : 'bg-white text-gray-600'}`}
          >
            <span className="text-gray-300 font-mono text-xs mr-2 select-none">
              {String(i + 1).padStart(3, '0')}
            </span>
            {note}
          </div>
        );
      })}
    </div>
  );
}

function StringList({ items, color }: { items: string[]; color: 'green' | 'amber' | 'blue' | 'gray' }) {
  const cls: Record<string, string> = {
    green: 'bg-green-50 text-green-700 border-green-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    blue:  'bg-blue-50  text-blue-700  border-blue-200',
    gray:  'bg-gray-100 text-gray-600  border-gray-200',
  };
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
      <div className="flex flex-wrap gap-1.5">
        {items.map((f, i) => (
          <code key={i} className={`text-xs border rounded px-1.5 py-0.5 font-mono ${cls[color]}`}>{f}</code>
        ))}
      </div>
    </div>
  );
}

function BulletList({ items, color }: { items: string[]; color: 'green' | 'blue' | 'amber' | 'gray' }) {
  const dot: Record<string, string> = {
    green: 'text-green-400', blue: 'text-blue-400',
    amber: 'text-amber-400', gray: 'text-gray-300',
  };
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="text-sm text-gray-700 flex gap-2">
          <span className={`shrink-0 ${dot[color]}`}>&#x2022;</span>
          {item}
        </li>
      ))}
    </ul>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function HistoryView({
  data,
}: {
  data: Record<string, unknown>;
  section: string;
  slug: string;
}) {
  const {
    date, sprint, author, triggeredBy,
    summary, sessionGoal, sessionBranch, sessionOutcome,
    scratchNotes, completedTasks, blockersResolved,
    filesCreated, filesUpdated, extras,
  } = normalise(data);

  return (
    <div className="space-y-5">
      {/* ── Meta strip ── */}
      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
        {author  && <span>Author: <span className="font-mono">{author}</span></span>}
        {date    && <span className="bg-gray-100 rounded px-2 py-0.5 font-mono">{date}</span>}
        {sprint != null && (
          <span className="bg-blue-50 text-blue-600 rounded px-2 py-0.5">Sprint {sprint}</span>
        )}
        {sessionBranch && (
          <span className="bg-gray-100 rounded px-2 py-0.5 font-mono">&#x2387; {sessionBranch}</span>
        )}
      </div>

      {/* ── Triggered by ── */}
      {triggeredBy && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500 mb-1">Triggered By</p>
          <p className="text-sm text-blue-900">{triggeredBy}</p>
        </div>
      )}

      {/* ── Summary / tldr ── */}
      {(summary ?? sessionGoal) && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1">Summary</p>
          <p className="text-sm text-gray-700">{summary ?? sessionGoal}</p>
        </div>
      )}

      {/* ── Session outcome ── */}
      {sessionOutcome && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-1">Outcome</p>
          <p className="text-sm text-green-900">{sessionOutcome}</p>
        </div>
      )}

      {/* ── Completed tasks (schema C) ── */}
      {completedTasks && completedTasks.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Completed Tasks ({completedTasks.length})
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <BulletList items={completedTasks} color="green" />
          </div>
        </section>
      )}

      {/* ── Blockers resolved (schema C) ── */}
      {blockersResolved && blockersResolved.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Blockers Resolved
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <BulletList items={blockersResolved} color="amber" />
          </div>
        </section>
      )}

      {/* ── Session log / scratch notes ── */}
      {scratchNotes.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Session Log ({scratchNotes.length} entries)
          </h2>
          <ScratchLog notes={scratchNotes} />
        </section>
      )}

      {/* ── Files created ── */}
      {filesCreated.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Files Created ({filesCreated.length})
          </h2>
          <StringList items={filesCreated} color="green" />
        </section>
      )}

      {/* ── Files updated ── */}
      {filesUpdated.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Files Updated ({filesUpdated.length})
          </h2>
          <StringList items={filesUpdated} color="amber" />
        </section>
      )}

      {/* ── Extra schema-B keys (decisions, prerequisite_gaps, …) ── */}
      {extras.map(({ key, value }) => (
        <section key={key}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            {key.replace(/_/g, ' ')}
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            {Array.isArray(value) ? (
              typeof value[0] === 'string' ? (
                <BulletList items={value as string[]} color="gray" />
              ) : (
                <pre className="text-xs text-gray-600 overflow-auto whitespace-pre-wrap">
                  {JSON.stringify(value, null, 2)}
                </pre>
              )
            ) : typeof value === 'object' && value !== null ? (
              <pre className="text-xs text-gray-600 overflow-auto whitespace-pre-wrap">
                {JSON.stringify(value, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-gray-700">{String(value)}</p>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}
