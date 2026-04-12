import { StatusBadge } from '@/components/StatusBadge';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkflowStep {
  step?: number;
  actor?: string;
  action?: string;
  result?: string;
}

interface FailurePath {
  condition?: string;
  response?: string;
}

interface WorkflowAtomicity {
  strategy?: string;
  retry?: string;
}

interface WorkflowEntry {
  id: string;
  title?: string;
  name?: string;
  trigger?: string;
  actor?: string;
  preconditions?: string[];
  steps?: (string | WorkflowStep)[];
  success_outcome?: string;
  failure_paths?: (string | FailurePath)[];
  postconditions?: string[];
  atomicity?: WorkflowAtomicity;
  legal_note?: string;
}

interface Overview {
  summary?: string;
  legal_basis?: string;
  state_machine_ref?: string;
  states?: string[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepList({ steps }: { steps: (string | WorkflowStep)[] }) {
  return (
    <ol className="space-y-2">
      {steps.map((step, i) => {
        if (typeof step === 'string') {
          return (
            <li key={i} className="flex gap-3 text-sm">
              <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs mt-0.5">
                {i + 1}
              </span>
              <span className="text-gray-700 pt-0.5">{step}</span>
            </li>
          );
        }
        const s = step as WorkflowStep;
        return (
          <li key={i} className="flex gap-3 text-sm">
            <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs mt-0.5">
              {s.step ?? i + 1}
            </span>
            <div className="flex-1 pt-0.5">
              {s.actor && (
                <span className="inline-block text-xs font-medium text-indigo-600 bg-indigo-50 rounded px-1.5 py-0.5 mr-2 mb-1">
                  {s.actor}
                </span>
              )}
              <span className="text-gray-700">{s.action}</span>
              {s.result && (
                <p className="mt-1 text-xs text-green-700 bg-green-50 rounded px-2 py-1">
                  Result: {s.result}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function FailureList({ paths }: { paths: (string | FailurePath)[] }) {
  return (
    <ul className="space-y-2">
      {paths.map((fp, i) => {
        if (typeof fp === 'string') {
          return (
            <li key={i} className="flex gap-2 text-sm">
              <span className="shrink-0 text-red-400 mt-0.5">&#x2715;</span>
              <span className="text-gray-700">{fp}</span>
            </li>
          );
        }
        const f = fp as FailurePath;
        return (
          <li key={i} className="text-sm rounded-md border border-red-100 bg-red-50 px-3 py-2">
            <p className="font-medium text-red-800">{f.condition}</p>
            {f.response && <p className="mt-0.5 text-red-700">{f.response}</p>}
          </li>
        );
      })}
    </ul>
  );
}

function WorkflowCard({ workflow }: { workflow: WorkflowEntry }) {
  const title = workflow.title ?? workflow.name ?? workflow.id;
  const steps = workflow.steps ?? [];
  const failures = workflow.failure_paths ?? [];

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50">
        <span className="font-mono text-xs text-blue-600 bg-blue-50 rounded px-2 py-0.5 shrink-0">
          {workflow.id}
        </span>
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Trigger + Actor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {workflow.trigger && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Trigger</p>
              <p className="text-sm text-gray-700">{workflow.trigger}</p>
            </div>
          )}
          {workflow.actor && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1">Actor</p>
              <p className="text-sm text-indigo-700 font-medium">{workflow.actor}</p>
            </div>
          )}
        </div>

        {/* Preconditions */}
        {workflow.preconditions && workflow.preconditions.length > 0 && (
          <details open>
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 select-none list-none flex items-center gap-1">
              <span>Preconditions ({workflow.preconditions.length})</span>
            </summary>
            <ul className="mt-2 space-y-1">
              {workflow.preconditions.map((pc, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-green-500 shrink-0">&#10003;</span>
                  {pc}
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-3">
              Steps ({steps.length})
            </p>
            <StepList steps={steps} />
          </div>
        )}

        {/* Atomicity */}
        {workflow.atomicity && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-sm">
            <p className="font-semibold text-amber-800 mb-1 text-xs uppercase tracking-wide">Atomicity / Retry</p>
            {workflow.atomicity.strategy && (
              <p className="text-amber-700 mb-1">{workflow.atomicity.strategy}</p>
            )}
            {workflow.atomicity.retry && (
              <p className="text-amber-600 text-xs">{workflow.atomicity.retry}</p>
            )}
          </div>
        )}

        {/* Success outcome */}
        {workflow.success_outcome && (
          <div className="flex gap-2 text-sm">
            <span className="shrink-0 text-green-500 font-bold mt-0.5">&#10003;</span>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 mr-2">Success:</span>
              <span className="text-gray-700">{workflow.success_outcome}</span>
            </div>
          </div>
        )}

        {/* Failure paths */}
        {failures.length > 0 && (
          <details>
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-red-500 mb-2 select-none list-none flex items-center gap-1">
              <span>&#x25B6; Failure Paths ({failures.length})</span>
            </summary>
            <div className="mt-2">
              <FailureList paths={failures} />
            </div>
          </details>
        )}

        {/* Postconditions */}
        {workflow.postconditions && workflow.postconditions.length > 0 && (
          <details>
            <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2 select-none list-none flex items-center gap-1">
              <span>&#x25B6; Postconditions ({workflow.postconditions.length})</span>
            </summary>
            <ul className="mt-2 space-y-1">
              {workflow.postconditions.map((pc, i) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700">
                  <span className="text-blue-400 shrink-0">&#8594;</span>
                  {pc}
                </li>
              ))}
            </ul>
          </details>
        )}

        {/* Legal note */}
        {workflow.legal_note && (
          <div className="rounded-md border border-purple-200 bg-purple-50 px-3 py-2 text-sm text-purple-800">
            <span className="font-semibold">Legal: </span>{workflow.legal_note}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function WorkflowView({
  data,
}: {
  data: Record<string, unknown>;
  section: string;
  slug: string;
}) {
  const meta = data.meta as Record<string, unknown> | undefined;
  const qf = data.quick_facts as Record<string, unknown> | undefined;
  const content = data.content as Record<string, unknown> | undefined;
  const overview = data.overview as Overview | undefined;

  // Workflows can be at top-level or inside content
  const workflows = (
    (data.workflows as WorkflowEntry[] | undefined) ??
    (content?.workflows as WorkflowEntry[] | undefined) ??
    []
  );

  const tldr = (content?.tldr as string | undefined) ?? overview?.summary;

  return (
    <div className="space-y-5">
      {/* ── Overview banner ── */}
      {(tldr || overview?.legal_basis || overview?.states) && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-4 space-y-2">
          {tldr && <p className="text-sm text-blue-900">{tldr}</p>}
          {overview?.legal_basis && (
            <p className="text-xs text-blue-700">
              <span className="font-semibold">Legal basis: </span>{overview.legal_basis}
            </p>
          )}
          {overview?.states && overview.states.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-blue-600 font-semibold">States:</span>
              {overview.states.map((s) => (
                <StatusBadge key={s} status={s} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Quick facts ── */}
      {qf != null && Object.keys(qf).length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(qf).map(([key, val]) => {
            if (Array.isArray(val)) {
              return (
                <div key={key} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400 capitalize">{key.replace(/_/g, ' ')}</p>
                  <p className="mt-0.5 text-sm text-gray-700">{(val as string[]).join(', ')}</p>
                </div>
              );
            }
            return (
              <div key={key} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400 capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="mt-0.5 text-sm font-medium text-gray-800">{String(val)}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Meta info from meta ── */}
      {meta?.owner != null && (
        <p className="text-xs text-gray-400">Owner: <span className="font-mono">{String(meta.owner)}</span></p>
      )}

      {/* ── Workflow cards ── */}
      {workflows.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Workflows ({workflows.length})
          </h2>
          {workflows.map((wf) => (
            <WorkflowCard key={wf.id} workflow={wf} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm">No workflows defined.</p>
      )}
    </div>
  );
}
