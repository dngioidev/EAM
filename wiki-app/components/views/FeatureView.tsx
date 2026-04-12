import { StatusBadge } from '@/components/StatusBadge';
import { AdminActions } from '@/components/AdminActions';

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserStory {
  id: string;
  size: string;
  as_a: string;
  i_want: string;
  so_that: string;
  acceptance_criteria?: string[];
  edge_cases?: string[];
  business_rules?: string[];
}

interface Actor {
  role: string;
  vn: string;
  capabilities: string[];
}

interface RbacRow {
  endpoint: string;
  [role: string]: string;
}

interface OpenQuestion {
  id: string;
  question: string;
  status: string;
  decision?: string;
  defer_to?: string;
  default_decision?: string;
}

interface FeatureSection {
  heading: string;
  items?: unknown[];
  rows?: RbacRow[];
  note?: string;
}

interface FeatureMeta {
  id: string;
  status: string;
  owner?: string;
  sprint?: number;
  last_updated?: string;
  tags?: string[];
  blocked_by?: string | null;
  depends_on?: string[];
  related_to?: string[];
}

interface FeatureApproval {
  status: string;
  approved_by?: string;
  approved_at?: string;
  notes?: string;
}

interface AuditEntry {
  date: string;
  role: string;
  action: string;
  description?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const SIZE_STYLES: Record<string, string> = {
  XS: 'bg-slate-100 text-slate-600',
  S:  'bg-green-100 text-green-700',
  M:  'bg-yellow-100 text-yellow-700',
  L:  'bg-orange-100 text-orange-700',
  XL: 'bg-red-100 text-red-700',
};

function SizeChip({ size }: { size: string }) {
  return (
    <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${SIZE_STYLES[size] ?? 'bg-gray-100 text-gray-700'}`}>
      {size}
    </span>
  );
}

function ActorsTable({ items }: { items: Actor[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wide">Role</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wide">Vietnamese</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 uppercase tracking-wide">Capabilities</th>
          </tr>
        </thead>
        <tbody>
          {items.map((actor) => (
            <tr key={actor.role} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 font-mono text-blue-700 text-xs">{actor.role}</td>
              <td className="px-3 py-2 text-gray-700">{actor.vn}</td>
              <td className="px-3 py-2">
                <div className="flex flex-wrap gap-1">
                  {actor.capabilities.map((cap) => (
                    <span key={cap} className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{cap}</span>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UserStoryCard({ story }: { story: UserStory }) {
  return (
    <details className="rounded-lg border border-gray-200 bg-white group">
      <summary className="flex cursor-pointer select-none items-center gap-2.5 px-4 py-3 text-sm list-none">
        <span className="text-gray-300 group-open:rotate-90 transition-transform inline-block">▶</span>
        <span className="font-mono text-xs text-gray-400 shrink-0">{story.id}</span>
        <SizeChip size={story.size} />
        <span className="text-gray-700 min-w-0">
          As a <strong className="text-gray-900">{story.as_a}</strong>, I want {story.i_want}
        </span>
      </summary>

      <div className="border-t border-gray-100 px-4 py-4 space-y-4 text-sm">
        <p className="text-gray-600">
          <span className="font-semibold text-gray-800">So that</span> {story.so_that}
        </p>

        {story.acceptance_criteria && story.acceptance_criteria.length > 0 && (
          <div>
            <p className="font-semibold text-gray-800 mb-2">Acceptance Criteria</p>
            <ul className="space-y-1.5 ml-1">
              {story.acceptance_criteria.map((ac, i) => (
                <li key={i} className="flex gap-2 text-gray-600">
                  <span className="text-green-500 shrink-0 mt-0.5 font-bold">✓</span>
                  <span>{ac}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {story.edge_cases && story.edge_cases.length > 0 && (
          <div>
            <p className="font-semibold text-amber-700 mb-2">Edge Cases</p>
            <ul className="space-y-1.5 ml-1">
              {story.edge_cases.map((ec, i) => (
                <li key={i} className="flex gap-2 text-amber-700">
                  <span className="shrink-0 mt-0.5">⚠</span>
                  <span>{ec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {story.business_rules && story.business_rules.length > 0 && (
          <div>
            <p className="font-semibold text-gray-800 mb-2">Business Rules</p>
            <ul className="space-y-1.5 ml-1">
              {story.business_rules.map((br, i) => (
                <li key={i} className="flex gap-2 text-gray-600">
                  <span className="text-blue-400 shrink-0 mt-0.5">•</span>
                  <span>{br}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </details>
  );
}

function BusinessRulesList({ items }: { items: unknown[] }) {
  return (
    <ul className="space-y-2 text-sm">
      {(items as string[]).map((rule, i) => {
        const match = rule.match(/^(BR-[\w-]+):\s*(.*)/);
        return (
          <li key={i} className="flex gap-3">
            <span className="font-mono text-xs text-blue-600 shrink-0 mt-0.5 w-28">
              {match ? match[1] : String(i + 1) + '.'}
            </span>
            <span className="text-gray-700">{match ? match[2] : rule}</span>
          </li>
        );
      })}
    </ul>
  );
}

const RBAC_ROLE_ORDER = ['admin', 'store-manager', 'cashier', 'accountant', 'viewer'];

function RbacMatrix({ rows, note }: { rows: RbacRow[]; note?: string }) {
  if (!rows.length) return null;
  const roles = RBAC_ROLE_ORDER.filter((r) => r in rows[0]);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 uppercase">Endpoint</th>
              {roles.map((r) => (
                <th key={r} className="px-3 py-2 text-center text-xs font-semibold text-gray-500 border-b border-gray-200 capitalize">{r}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-xs text-gray-700">{row.endpoint}</td>
                {roles.map((r) => (
                  <td key={r} className="px-3 py-2 text-center text-base">{row[r] ?? '—'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className="mt-2 text-xs text-gray-400 italic">{note}</p>}
    </div>
  );
}

const OQ_BADGE: Record<string, string> = {
  deferred: 'bg-orange-100 text-orange-700',
  decided:  'bg-green-100 text-green-700',
  open:     'bg-blue-100 text-blue-700',
};

function OpenQuestionsList({ items }: { items: unknown[] }) {
  return (
    <ul className="space-y-3">
      {(items as OpenQuestion[]).map((oq) => (
        <li key={oq.id} className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm">
          <div className="flex items-start gap-2 flex-wrap">
            <span className="font-mono text-xs text-gray-400 shrink-0 mt-0.5">{oq.id}</span>
            <span className={`rounded px-1.5 py-0.5 text-xs shrink-0 ${OQ_BADGE[oq.status] ?? 'bg-gray-100 text-gray-600'}`}>
              {oq.status}
            </span>
            <p className="text-gray-700 flex-1 min-w-0">{oq.question}</p>
          </div>
          {(oq.decision ?? oq.default_decision) && (
            <p className="mt-1.5 ml-8 text-xs text-gray-500 italic">
              → {oq.decision ?? oq.default_decision}
              {oq.defer_to && (
                <span className="ml-2 rounded bg-orange-50 px-1 py-0.5 text-orange-600">{oq.defer_to}</span>
              )}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function GenericList({ items }: { items: unknown[] }) {
  return (
    <ul className="space-y-1.5 text-sm text-gray-700">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-gray-300 shrink-0 mt-0.5">•</span>
          <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionBlock({ section }: { section: FeatureSection }) {
  const h = section.heading;

  let body: React.ReactNode;
  if (h === 'Actors' && section.items) {
    body = <ActorsTable items={section.items as Actor[]} />;
  } else if (h === 'User Stories' && section.items) {
    body = (
      <div className="space-y-2">
        {(section.items as UserStory[]).map((s) => (
          <UserStoryCard key={s.id} story={s} />
        ))}
      </div>
    );
  } else if (h.includes('Business Rule') && section.items) {
    body = <BusinessRulesList items={section.items} />;
  } else if (h === 'RBAC Matrix' && section.rows) {
    body = <RbacMatrix rows={section.rows} note={section.note} />;
  } else if (h === 'Open Questions' && section.items) {
    body = <OpenQuestionsList items={section.items} />;
  } else if (section.items) {
    body = <GenericList items={section.items} />;
  } else {
    body = <pre className="text-xs text-gray-400 overflow-x-auto">{JSON.stringify(section, null, 2)}</pre>;
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        {h}
      </h3>
      <div className="p-4">{body}</div>
    </section>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function FeatureView({
  data,
  section,
  slug,
}: {
  data: Record<string, unknown>;
  section: string;
  slug: string;
}) {
  const meta = (data.meta ?? {}) as FeatureMeta;
  const qf = (data.quick_facts ?? {}) as Record<string, string>;
  const content = (data.content ?? {}) as {
    title?: string;
    tldr?: string;
    summary?: string;
    do_not?: string[];
    sections?: FeatureSection[];
  };
  const approval = data.approval as FeatureApproval | undefined;
  const audit = data.audit as AuditEntry[] | undefined;

  return (
    <div className="space-y-4">
      {/* ── Header row ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={meta.status} />
            {meta.sprint !== undefined && (
              <span className="text-xs text-gray-400">Sprint {meta.sprint}</span>
            )}
            {meta.owner && (
              <span className="text-xs text-gray-400">· {meta.owner}</span>
            )}
            {meta.blocked_by && (
              <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs text-red-600">
                blocked by {meta.blocked_by}
              </span>
            )}
          </div>
          {meta.tags && meta.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {meta.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-blue-50 px-2 py-0.5 text-xs text-blue-600">
                  {tag}
                </span>
              ))}
            </div>
          )}
          {(meta.depends_on && meta.depends_on.length > 0) ||
           (meta.related_to && meta.related_to.length > 0) ? (
            <div className="flex items-center gap-3 text-xs text-gray-400">
              {meta.depends_on && meta.depends_on.length > 0 && (
                <span>depends on: <strong className="text-gray-600">{meta.depends_on.join(', ')}</strong></span>
              )}
              {meta.related_to && meta.related_to.length > 0 && (
                <span>related: <strong className="text-gray-600">{meta.related_to.join(', ')}</strong></span>
              )}
            </div>
          ) : null}
        </div>

        <AdminActions
          section={section}
          slug={slug}
          entityType="feature"
          currentStatus={approval?.status ?? meta.status}
        />
      </div>

      {/* ── Quick fact ── */}
      {qf.one_line && (
        <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          {qf.one_line}
        </div>
      )}

      {/* ── Summary ── */}
      {(content.tldr || content.summary) && (
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Summary</p>
          {content.tldr && <p className="text-sm text-gray-700 leading-relaxed">{content.tldr}</p>}
          {content.summary && content.summary !== content.tldr && (
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">{content.summary}</p>
          )}
        </div>
      )}

      {/* ── Do NOT rules ── */}
      {content.do_not && content.do_not.length > 0 && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-red-700 mb-2">Do NOT</p>
          <ul className="space-y-1">
            {content.do_not.map((rule, i) => (
              <li key={i} className="flex gap-2 text-sm text-red-700">
                <span className="shrink-0 font-bold">✗</span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Content sections ── */}
      {content.sections?.map((sec, i) => (
        <SectionBlock key={i} section={sec} />
      ))}

      {/* ── Approval box ── */}
      {approval && (
        <div className={`rounded-lg border px-4 py-3 text-sm ${
          approval.status === 'approved'
            ? 'border-green-200 bg-green-50'
            : approval.status === 'rejected'
            ? 'border-red-200 bg-red-50'
            : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Approval</span>
            <StatusBadge status={approval.status} />
          </div>
          {approval.approved_by && (
            <p className="text-gray-600 text-xs">
              By <strong>{approval.approved_by}</strong>
              {approval.approved_at ? ` · ${approval.approved_at}` : ''}
            </p>
          )}
          {approval.notes && (
            <p className="mt-1 text-xs text-gray-500 italic">{approval.notes}</p>
          )}
        </div>
      )}

      {/* ── Audit trail ── */}
      {audit && audit.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Audit Trail
          </h3>
          <ul className="divide-y divide-gray-100">
            {audit.map((entry, i) => (
              <li key={i} className="px-4 py-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium text-gray-800 capitalize">{entry.action}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-blue-600">{entry.role}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400">{entry.date}</span>
                </div>
                {entry.description && (
                  <p className="mt-0.5 text-xs text-gray-500">{entry.description}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
