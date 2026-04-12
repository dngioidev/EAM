import { StatusBadge } from '@/components/StatusBadge';
import { AdminActions } from '@/components/AdminActions';

// ─── Types ───────────────────────────────────────────────────────────────────

interface FieldDef {
  type?: string;
  format?: string;
  required?: boolean;
  nullable?: boolean;
  minLength?: number;
  enum?: string[];
  description?: string;
}

interface RequestBody {
  contentType?: string;
  schema?: Record<string, FieldDef | Record<string, unknown>>;
}

interface PathParams {
  [key: string]: FieldDef;
}

interface QueryParams {
  [key: string]: FieldDef;
}

interface ResponseDef {
  description: string;
  schema?: unknown;
}

interface Endpoint {
  id: string;
  method: string;
  path: string;
  auth: 'public' | 'bearer' | string;
  roles?: string[];
  summary: string;
  request?: {
    body?: RequestBody;
    pathParams?: PathParams;
    queryParams?: QueryParams;
  };
  responses?: Record<string, ResponseDef>;
}

interface Contract {
  module: string;
  version?: string;
  status: string;
  baseUrl: string;
  description?: string;
  businessRules?: string[];
  endpoints: Endpoint[];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const METHOD_STYLES: Record<string, string> = {
  GET:    'bg-blue-100 text-blue-700',
  POST:   'bg-green-100 text-green-700',
  PUT:    'bg-yellow-100 text-yellow-700',
  PATCH:  'bg-orange-100 text-orange-700',
  DELETE: 'bg-red-100 text-red-700',
};

function MethodBadge({ method }: { method: string }) {
  const style = METHOD_STYLES[method.toUpperCase()] ?? 'bg-gray-100 text-gray-600';
  return (
    <span className={`rounded px-1.5 py-0.5 font-mono text-xs font-bold shrink-0 ${style}`}>
      {method.toUpperCase()}
    </span>
  );
}

function AuthBadge({ auth, roles }: { auth: string; roles?: string[] }) {
  if (auth === 'public') {
    return <span className="ml-auto rounded-full bg-gray-50 border border-gray-200 px-2 py-0.5 text-xs text-gray-400 shrink-0">public</span>;
  }
  return (
    <span className="ml-auto flex items-center gap-1 shrink-0">
      <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs text-amber-700">🔒 JWT</span>
      {roles?.map((r) => (
        <span key={r} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-600">{r}</span>
      ))}
    </span>
  );
}

function SchemaTable({ schema }: { schema: Record<string, unknown> }) {
  // Only render flat field-def style schemas (not deeply nested response schemas)
  const entries = Object.entries(schema);
  const isFieldDef = entries.every(([, v]) => v && typeof v === 'object' && ('type' in (v as object) || 'required' in (v as object)));
  if (!isFieldDef) {
    return <pre className="text-xs text-gray-400 overflow-x-auto">{JSON.stringify(schema, null, 2)}</pre>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-2 py-1.5 text-left font-semibold text-gray-500 border-b border-gray-200">Field</th>
            <th className="px-2 py-1.5 text-left font-semibold text-gray-500 border-b border-gray-200">Type</th>
            <th className="px-2 py-1.5 text-center font-semibold text-gray-500 border-b border-gray-200">Req</th>
            <th className="px-2 py-1.5 text-left font-semibold text-gray-500 border-b border-gray-200">Notes</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([field, def]) => {
            const d = def as FieldDef;
            const notes = [
              d.format,
              d.enum ? `[${d.enum.join(', ')}]` : null,
              d.minLength !== undefined ? `min ${d.minLength}` : null,
              d.nullable ? 'nullable' : null,
              d.description,
            ].filter(Boolean);
            return (
              <tr key={field} className="border-b border-gray-100">
                <td className="px-2 py-1.5 font-mono text-gray-800">{field}</td>
                <td className="px-2 py-1.5 text-blue-600">{d.type ?? '—'}</td>
                <td className="px-2 py-1.5 text-center">
                  {d.required ? <span className="text-red-500 font-bold">✓</span> : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-2 py-1.5 text-gray-400">{notes.join(' · ')}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function ResponseList({ responses }: { responses: Record<string, ResponseDef> }) {
  return (
    <div className="space-y-1">
      {Object.entries(responses).map(([code, resp]) => (
        <div key={code} className="flex items-baseline gap-2 text-sm">
          <span className={`font-mono rounded px-1.5 py-0.5 text-xs shrink-0 ${
            code.startsWith('2') ? 'bg-green-100 text-green-700' :
            code.startsWith('4') ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>{code}</span>
          <span className="text-gray-600">{resp.description}</span>
        </div>
      ))}
    </div>
  );
}

function EndpointCard({ endpoint, baseUrl }: { endpoint: Endpoint; baseUrl: string }) {
  const hasDetails =
    endpoint.request?.body?.schema ||
    endpoint.request?.pathParams ||
    endpoint.request?.queryParams ||
    endpoint.responses;

  return (
    <details className="rounded-lg border border-gray-200 bg-white group" open={false}>
      <summary className={[
        'flex cursor-pointer select-none items-center gap-2.5 px-4 py-3',
        hasDetails ? '' : 'cursor-default',
      ].join(' ')}>
        {hasDetails && (
          <span className="text-gray-300 group-open:rotate-90 transition-transform inline-block shrink-0">▶</span>
        )}
        {!hasDetails && <span className="w-3 shrink-0" />}
        <span className="font-mono text-xs text-gray-400 shrink-0 w-20">{endpoint.id}</span>
        <MethodBadge method={endpoint.method} />
        <code className="text-sm text-gray-700 font-mono">{baseUrl}{endpoint.path}</code>
        <span className="text-sm text-gray-400 hidden sm:inline">— {endpoint.summary}</span>
        <AuthBadge auth={endpoint.auth} roles={endpoint.roles} />
      </summary>

      {hasDetails && (
        <div className="border-t border-gray-100 px-4 py-4 space-y-4 text-sm">
          {/* Summary line for small screens */}
          <p className="text-gray-500 sm:hidden">{endpoint.summary}</p>

          {endpoint.request?.pathParams && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Path Parameters</p>
              <SchemaTable schema={endpoint.request.pathParams} />
            </div>
          )}

          {endpoint.request?.queryParams && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Query Parameters</p>
              <SchemaTable schema={endpoint.request.queryParams} />
            </div>
          )}

          {endpoint.request?.body?.schema && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                Request Body
                {endpoint.request.body.contentType && (
                  <span className="font-normal text-gray-400 ml-2 normal-case">{endpoint.request.body.contentType}</span>
                )}
              </p>
              <SchemaTable schema={endpoint.request.body.schema as Record<string, unknown>} />
            </div>
          )}

          {endpoint.responses && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Responses</p>
              <ResponseList responses={endpoint.responses} />
            </div>
          )}
        </div>
      )}
    </details>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────

export function ApiContractView({
  data,
  section,
  slug,
}: {
  data: Record<string, unknown>;
  section: string;
  slug: string;
}) {
  const contract = data as unknown as Contract;

  return (
    <div className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={contract.status} />
            {contract.version && (
              <span className="text-xs text-gray-400">v{contract.version}</span>
            )}
          </div>
          {contract.description && (
            <p className="text-sm text-gray-600">{contract.description}</p>
          )}
          <code className="inline-block rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 font-mono">
            {contract.baseUrl}
          </code>
        </div>

        <AdminActions
          section={section}
          slug={slug}
          entityType="api-contract"
          currentStatus={contract.status}
        />
      </div>

      {/* ── Business rules ── */}
      {contract.businessRules && contract.businessRules.length > 0 && (
        <section className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Business Rules
          </h3>
          <ul className="px-4 py-3 space-y-2">
            {contract.businessRules.map((rule, i) => {
              const match = rule.match(/^(BR-[\w-]+):\s*(.*)/);
              return (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="font-mono text-xs text-blue-600 shrink-0 mt-0.5 w-32">
                    {match ? match[1] : `${i + 1}.`}
                  </span>
                  <span className="text-gray-700">{match ? match[2] : rule}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* ── Endpoints ── */}
      <section className="rounded-lg border border-gray-200 overflow-hidden">
        <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Endpoints ({contract.endpoints?.length ?? 0})
        </h3>
        <div className="p-3 space-y-2">
          {contract.endpoints?.map((ep) => (
            <EndpointCard key={ep.id} endpoint={ep} baseUrl={contract.baseUrl} />
          ))}
        </div>
      </section>
    </div>
  );
}
