// ─── Types ────────────────────────────────────────────────────────────────────

interface Entity {
  name: string;
  table?: string;
  description?: string;
  key_fields?: string[];
  relations?: string[];
  state_machine?: string | null;
  roles?: string[];
}

interface Actor {
  name: string;
  role_description?: string;
  impact?: string;
  deliverables?: string[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EntityCard({ entity }: { entity: Entity }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div>
          <span className="font-bold text-gray-900 text-sm">{entity.name}</span>
          {entity.table && (
            <span className="ml-2 font-mono text-xs text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">
              {entity.table}
            </span>
          )}
        </div>
        {entity.state_machine && (
          <span className="ml-auto text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded px-2 py-0.5 shrink-0">
            stateful
          </span>
        )}
      </div>

      <div className="px-4 py-3 space-y-3">
        {entity.description && (
          <p className="text-sm text-gray-600">{entity.description}</p>
        )}

        {entity.key_fields && entity.key_fields.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Key Fields</p>
            <div className="flex flex-wrap gap-1.5">
              {entity.key_fields.map((f) => (
                <code key={f} className="text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5 font-mono">{f}</code>
              ))}
            </div>
          </div>
        )}

        {entity.relations && entity.relations.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Relations</p>
            <div className="flex flex-wrap gap-1.5">
              {entity.relations.map((r) => (
                <span key={r} className="text-xs bg-purple-50 text-purple-700 rounded px-2 py-0.5">{r}</span>
              ))}
            </div>
          </div>
        )}

        {entity.roles && entity.roles.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5">Roles</p>
            <div className="flex flex-wrap gap-1.5">
              {entity.roles.map((r) => (
                <span key={r} className="text-xs bg-indigo-50 text-indigo-700 rounded-full px-2 py-0.5">{r}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ActorCard({ actor }: { actor: Actor }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 space-y-2">
      <p className="font-semibold text-gray-900 text-sm">{actor.name}</p>
      {actor.role_description && (
        <p className="text-sm text-gray-600">{actor.role_description}</p>
      )}
      {actor.impact && (
        <div className="flex gap-2 text-sm">
          <span className="text-xs font-semibold text-green-600 shrink-0 uppercase tracking-wide mt-0.5">Impact:</span>
          <span className="text-gray-700">{actor.impact}</span>
        </div>
      )}
      {actor.deliverables && actor.deliverables.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {actor.deliverables.map((d) => (
            <span key={d} className="text-xs bg-blue-50 text-blue-700 rounded px-2 py-0.5">{d}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ImpactMapView({
  data,
}: {
  data: Record<string, unknown>;
  section: string;
  slug: string;
}) {
  const meta = data.meta as Record<string, unknown> | undefined;
  const qf = data.quick_facts as Record<string, unknown> | undefined;
  const content = data.content as Record<string, unknown> | undefined;

  // Entity registry shape
  const entities = content?.entities as Entity[] | undefined;

  // Relations file shape — goal can be a plain string OR an object {statement, metric, deadline}
  const rawGoal = data.goal;
  const goalObj = rawGoal !== null && typeof rawGoal === 'object' && !Array.isArray(rawGoal)
    ? (rawGoal as Record<string, unknown>)
    : undefined;
  const goal: string | undefined = goalObj
    ? (goalObj.statement as string | undefined)
    : (rawGoal as string | undefined);
  const goalMetric: string | undefined = goalObj
    ? (goalObj.metric as string | undefined)
    : (data.goal_metric as string | undefined);
  const goalDeadline: string | undefined = goalObj
    ? (goalObj.deadline as string | undefined)
    : (data.goal_deadline as string | undefined);
  const actors = data.actors as Actor[] | undefined;
  const affectedEntities = data.affected_entities as string[] | undefined;
  const outOfScope = data.out_of_scope as string[] | undefined;

  return (
    <div className="space-y-5">
      {/* ── Meta info ── */}
      {meta?.owner != null && (
        <p className="text-xs text-gray-400">Owner: <span className="font-mono">{String(meta.owner)}</span></p>
      )}

      {/* ── Goal banner (relations files) ── */}
      {goal && (
        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-4 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-600">Goal</p>
          <p className="text-sm text-green-900 font-medium">{goal}</p>
          {goalMetric && (
            <p className="text-xs text-green-700">
              <span className="font-semibold">Metric: </span>{goalMetric}
            </p>
          )}
          {goalDeadline && (
            <p className="text-xs text-green-700">
              <span className="font-semibold">Deadline: </span>{goalDeadline}
            </p>
          )}
        </div>
      )}

      {/* ── Quick facts ── */}
      {qf != null && Object.keys(qf).length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(qf).map(([k, v]) => {
            if (Array.isArray(v)) {
              return (
                <div key={k} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{k.replace(/_/g, ' ')}</p>
                  <p className="mt-0.5 text-sm text-gray-700">{(v as string[]).join(', ')}</p>
                </div>
              );
            }
            return (
              <div key={k} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{k.replace(/_/g, ' ')}</p>
                <p className="mt-0.5 text-sm font-bold text-gray-800">{String(v)}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Entity registry ── */}
      {entities && entities.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Entities ({entities.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {entities.map((e) => (
              <EntityCard key={e.name} entity={e} />
            ))}
          </div>
        </section>
      )}

      {/* ── Actors (relations files) ── */}
      {actors && actors.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Actors ({actors.length})
          </h2>
          <div className="space-y-3">
            {actors.map((a, i) => (
              <ActorCard key={i} actor={a} />
            ))}
          </div>
        </section>
      )}

      {/* ── Affected entities ── */}
      {affectedEntities && affectedEntities.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Affected Entities
          </h3>
          <div className="px-4 py-3 flex flex-wrap gap-2">
            {affectedEntities.map((e) => (
              <span key={e} className="text-xs bg-purple-50 text-purple-700 border border-purple-200 rounded px-2 py-0.5 font-medium">{e}</span>
            ))}
          </div>
        </section>
      )}

      {/* ── Out of scope ── */}
      {outOfScope && outOfScope.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Out of Scope
          </h3>
          <ul className="px-4 py-3 space-y-1.5">
            {outOfScope.map((item, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-500">
                <span className="text-gray-300 shrink-0">&#x2014;</span>
                {item}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
