// ─── Types ────────────────────────────────────────────────────────────────────

interface RuleObject {
  id?: string;
  rule?: string;
  enforcer?: string;
  // for tech-stack decision style
  category?: string;
  chosen?: string;
  alternatives_rejected?: string[];
  reason?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Renders content.rules — handles both string[] and {id,rule,enforcer}[] */
function RulesList({ rules }: { rules: (string | RuleObject)[] }) {
  const hasIds = rules.some(
    (r) => typeof r === 'object' && r !== null && 'id' in r
  );

  if (hasIds) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 w-24">ID</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-gray-200">Rule</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 w-40">Enforcer</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r, i) => {
              const rule = typeof r === 'object' ? (r as RuleObject) : null;
              const text = typeof r === 'string' ? r : rule?.rule ?? '';
              return (
                <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-xs text-blue-600 align-top">
                    {rule?.id ?? String(i + 1)}
                  </td>
                  <td className="px-3 py-2 text-gray-800 align-top">{text}</td>
                  <td className="px-3 py-2 text-gray-400 text-xs align-top font-mono">
                    {rule?.enforcer ?? ''}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  // Plain string list
  return (
    <ul className="space-y-2">
      {rules.map((r, i) => (
        <li key={i} className="flex gap-3 text-sm">
          <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-500 text-xs font-bold mt-0.5">
            {i + 1}
          </span>
          <span className="text-gray-700">{typeof r === 'string' ? r : (r as RuleObject).rule ?? ''}</span>
        </li>
      ))}
    </ul>
  );
}

/** Renders a string array as a simple numbered list */
function StringSection({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 text-sm">
          <span className="shrink-0 text-gray-300 font-bold mt-0.5">{i + 1}.</span>
          <span className="text-gray-700">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Renders content.decisions — tech stack decision table */
function DecisionTable({ decisions }: { decisions: RuleObject[] }) {
  return (
    <div className="space-y-3">
      {decisions.map((d, i) => (
        <div key={i} className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <div className="flex items-start gap-3 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide w-36 shrink-0 mt-0.5">
              {d.category}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-gray-900">{d.chosen}</span>
                {d.alternatives_rejected && d.alternatives_rejected.length > 0 && (
                  <span className="text-xs text-gray-400">
                    vs {d.alternatives_rejected.join(', ')}
                  </span>
                )}
              </div>
              {d.reason && (
                <p className="text-sm text-gray-600">{d.reason}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Renders a port exposure policy object */
function PortPolicy({ policy }: { policy: Record<string, unknown> }) {
  const title = policy.title as string | undefined;
  const principle = policy.principle as string | undefined;
  const exposed = policy.exposed_ports as Record<string, string> | undefined;
  const internal = policy.internal_only as Record<string, string> | undefined;
  const rules = policy.rules as string[] | undefined;

  return (
    <div className="space-y-3">
      {title && <h4 className="font-semibold text-gray-800 text-sm">{title}</h4>}
      {principle && (
        <p className="text-sm text-gray-700 bg-gray-50 rounded px-3 py-2 border border-gray-100">{principle}</p>
      )}
      {exposed && Object.keys(exposed).length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-2">Exposed Ports</p>
          <div className="overflow-x-auto">
            <table className="text-sm w-full border-collapse">
              <tbody>
                {Object.entries(exposed).map(([port, desc]) => (
                  <tr key={port} className="border-b border-gray-100">
                    <td className="py-1.5 pr-4 font-mono text-blue-600 w-16">{port}</td>
                    <td className="py-1.5 text-gray-700">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {internal && Object.keys(internal).length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Internal Only</p>
          <div className="overflow-x-auto">
            <table className="text-sm w-full border-collapse">
              <tbody>
                {Object.entries(internal).map(([port, desc]) => (
                  <tr key={port} className="border-b border-gray-100">
                    <td className="py-1.5 pr-4 font-mono text-gray-500 w-16">{port}</td>
                    <td className="py-1.5 text-gray-500">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {rules && rules.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Rules</p>
          <StringSection items={rules} />
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function RulebookView({
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

  // Collect rendered sections
  const sections: { label: string; node: React.ReactNode }[] = [];

  if (content) {
    for (const [key, val] of Object.entries(content)) {
      if (key === 'tldr') continue;

      if (key === 'rules' && Array.isArray(val)) {
        sections.push({
          label: 'Rules',
          node: <RulesList rules={val as (string | RuleObject)[]} />,
        });
        continue;
      }

      if (key === 'decisions' && Array.isArray(val)) {
        sections.push({
          label: 'Tech Stack Decisions',
          node: <DecisionTable decisions={val as RuleObject[]} />,
        });
        continue;
      }

      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') {
        sections.push({
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
          node: <StringSection items={val as string[]} />,
        });
        continue;
      }

      if (
        val !== null &&
        typeof val === 'object' &&
        !Array.isArray(val) &&
        ('principle' in (val as object) || 'exposed_ports' in (val as object) || 'rules' in (val as object))
      ) {
        sections.push({
          label: key.replace(/_/g, ' '),
          node: <PortPolicy policy={val as Record<string, unknown>} />,
        });
        continue;
      }
    }
  }

  return (
    <div className="space-y-5">
      {/* ── Quick facts strip ── */}
      {qf != null && Object.keys(qf).length > 0 && (
        <div className="flex flex-wrap gap-3">
          {Object.entries(qf).map(([k, v]) => (
            <div key={k} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{k.replace(/_/g, ' ')}</p>
              <p className="mt-0.5 text-sm font-medium text-gray-800">{String(v)}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Owner ── */}
      {meta?.owner != null && (
        <p className="text-xs text-gray-400">Owner: <span className="font-mono">{String(meta.owner)}</span></p>
      )}

      {/* ── TLDR ── */}
      {tldr && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm text-blue-900">{tldr}</p>
        </div>
      )}

      {/* ── Content sections ── */}
      {sections.map(({ label, node }) => (
        <section key={label} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 capitalize">
            {label}
          </h3>
          <div className="px-4 py-4">{node}</div>
        </section>
      ))}

      {sections.length === 0 && (
        <p className="text-sm text-gray-400">No content sections found.</p>
      )}
    </div>
  );
}
