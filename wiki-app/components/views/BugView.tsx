// ─── Types ────────────────────────────────────────────────────────────────────

interface BugAuditEntry {
  version: number;
  timestamp: string;
  author: string;
  action: string;
  note: string;
}

// ─── Severity badge ───────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: 'bg-red-100 text-red-700 border-red-300',
    high:     'bg-orange-100 text-orange-700 border-orange-300',
    medium:   'bg-yellow-100 text-yellow-700 border-yellow-300',
    low:      'bg-gray-100 text-gray-600 border-gray-300',
  };
  const cls = map[severity] ?? map.low;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ${cls}`}>
      {severity}
    </span>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    open:        'bg-red-50 text-red-600 border-red-200',
    'in-progress': 'bg-blue-50 text-blue-600 border-blue-200',
    fixed:       'bg-green-50 text-green-700 border-green-200',
    verified:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    'wont-fix':  'bg-gray-100 text-gray-500 border-gray-200',
  };
  const cls = map[status] ?? 'bg-gray-100 text-gray-500 border-gray-200';
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {status}
    </span>
  );
}

// ─── Section block ────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {title}
      </h3>
      <div className="px-4 py-3">{children}</div>
    </section>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function BugView({
  data,
}: {
  data: Record<string, unknown>;
  section: string;
  slug: string;
}) {
  const meta    = data.meta    as Record<string, unknown> | undefined;
  const qf      = data.quick_facts as Record<string, unknown> | undefined;
  const content = data.content as Record<string, unknown> | undefined;
  const audit   = data.audit   as BugAuditEntry[] | undefined;

  const bugId    = qf?.bug_id   as string | undefined;
  const severity = qf?.severity as string | undefined;
  const status   = qf?.status   as string | undefined;
  const sprint   = qf?.sprint   as string | undefined;

  const tldr              = content?.tldr              as string | undefined;
  const environment       = content?.environment       as string | undefined;
  const stepsRaw          = content?.steps_to_reproduce;
  const steps             = Array.isArray(stepsRaw) ? (stepsRaw as string[]) : [];
  const expectedBehavior  = content?.expected_behavior as string | undefined;
  const actualBehavior    = content?.actual_behavior   as string | undefined;
  const rootCause         = content?.root_cause        as string | undefined;
  const fixDescription    = content?.fix_description   as string | undefined;

  const isFixed = status === 'fixed' || status === 'verified';

  return (
    <div className="space-y-5">
      {/* ── Quick-fact strip ── */}
      <div className="flex flex-wrap items-center gap-3">
        {bugId && (
          <span className="font-mono text-sm font-bold text-gray-700 bg-gray-100 rounded px-2 py-0.5">
            {bugId}
          </span>
        )}
        {severity && <SeverityBadge severity={severity} />}
        {status   && <StatusBadge   status={status}   />}
        {sprint && (
          <span className="text-xs text-gray-400">Sprint {sprint}</span>
        )}
        {meta?.owner != null && (
          <span className="text-xs text-gray-400 font-mono ml-auto">
            {String(meta.owner)}
          </span>
        )}
      </div>

      {/* ── TLDR ── */}
      {tldr && (
        <div className={`rounded-lg border px-4 py-3 ${isFixed ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${isFixed ? 'text-green-600' : 'text-red-500'}`}>
            Summary
          </p>
          <p className={`text-sm font-medium ${isFixed ? 'text-green-900' : 'text-red-900'}`}>{tldr}</p>
        </div>
      )}

      {/* ── Environment ── */}
      {environment && (
        <Section title="Environment">
          <p className="text-sm text-gray-700 font-mono">{environment}</p>
        </Section>
      )}

      {/* ── Steps to reproduce ── */}
      {steps.length > 0 && (
        <Section title="Steps to Reproduce">
          <ol className="list-decimal list-inside space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="text-sm text-gray-700 leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </Section>
      )}

      {/* ── Expected vs actual ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {expectedBehavior && (
          <Section title="Expected Behavior">
            <p className="text-sm text-gray-700 leading-relaxed">{expectedBehavior}</p>
          </Section>
        )}
        {actualBehavior && (
          <Section title="Actual Behavior">
            <p className="text-sm text-red-700 leading-relaxed">{actualBehavior}</p>
          </Section>
        )}
      </div>

      {/* ── Root cause ── */}
      {rootCause && (
        <Section title="Root Cause">
          <p className="text-sm text-gray-700 leading-relaxed font-mono whitespace-pre-wrap">{rootCause}</p>
        </Section>
      )}

      {/* ── Fix description ── */}
      {fixDescription && (
        <Section title="Fix">
          <p className="text-sm text-gray-700 leading-relaxed font-mono whitespace-pre-wrap">{fixDescription}</p>
        </Section>
      )}

      {/* ── Audit trail ── */}
      {audit && audit.length > 0 && (
        <Section title="Audit Trail">
          <ol className="relative border-l border-gray-200 ml-2 space-y-4">
            {audit.map((entry, i) => (
              <li key={i} className="pl-5">
                <span className="absolute -left-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-gray-300 ring-2 ring-white" />
                <div className="flex flex-wrap items-baseline gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-gray-700 capitalize">{entry.action}</span>
                  <span className="text-xs text-gray-400 font-mono">{entry.author}</span>
                  <span className="text-xs text-gray-300">{entry.timestamp.slice(0, 10)}</span>
                </div>
                <p className="text-sm text-gray-600">{entry.note}</p>
              </li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}
