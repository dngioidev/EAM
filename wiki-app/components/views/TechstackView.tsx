// ─── Types ────────────────────────────────────────────────────────────────────

interface Package {
  package: string;
  version?: string;
  purpose?: string;
}

interface Service {
  name: string;
  image?: string;
  port?: number;
  purpose?: string;
}

interface Volume {
  name: string;
  mounted_to?: string;
}

interface Network {
  name: string;
  driver?: string;
  purpose?: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function QuickFactsGrid({ qf }: { qf: Record<string, unknown> }) {
  const entries = Object.entries(qf);
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {entries.map(([key, val]) => (
        <div key={key} className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 capitalize">
            {key.replace(/_/g, ' ')}
          </p>
          <p className="mt-0.5 text-sm font-semibold text-gray-800">{String(val)}</p>
        </div>
      ))}
    </div>
  );
}

function PackageTable({ packages }: { packages: Package[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-gray-200">Package</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 w-24">Version</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-gray-200">Purpose</th>
          </tr>
        </thead>
        <tbody>
          {packages.map((pkg, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 font-mono text-blue-700 text-xs">{pkg.package}</td>
              <td className="px-3 py-2 text-gray-500 text-xs">{pkg.version ?? '—'}</td>
              <td className="px-3 py-2 text-gray-700">{pkg.purpose ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ServiceTable({ services }: { services: Service[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-gray-200">Service</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-gray-200">Image</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-gray-200 w-20">Port</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500 border-b border-gray-200">Purpose</th>
          </tr>
        </thead>
        <tbody>
          {services.map((svc, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-3 py-2 font-mono font-bold text-gray-800 text-xs">{svc.name}</td>
              <td className="px-3 py-2 font-mono text-gray-500 text-xs">{svc.image ?? '—'}</td>
              <td className="px-3 py-2 text-blue-600 font-mono text-xs">{svc.port ?? '—'}</td>
              <td className="px-3 py-2 text-gray-700">{svc.purpose ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProjectStructure({ structure }: { structure: Record<string, unknown> }) {
  return (
    <div className="rounded-md bg-gray-900 text-green-300 font-mono text-xs px-4 py-3 overflow-x-auto">
      {Object.entries(structure).map(([key, val]) => (
        <div key={key} className="mb-0.5">
          <span className="text-gray-400">{key}: </span>
          <span>{String(val)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function TechstackView({
  data,
}: {
  data: Record<string, unknown>;
  section: string;
  slug: string;
}) {
  const meta = data.meta as Record<string, unknown> | undefined;
  const qf = data.quick_facts as Record<string, unknown> | undefined;
  const content = data.content as Record<string, unknown> | undefined;

  const packages = content?.key_packages as Package[] | undefined;
  const structure = content?.project_structure as Record<string, unknown> | undefined;
  const services = content?.services as Service[] | undefined;
  const volumes = content?.volumes as Volume[] | undefined;
  const networks = content?.networks as Network[] | undefined;
  const port = content?.port as number | undefined;
  const apiPrefix = content?.api_prefix as string | undefined;

  return (
    <div className="space-y-5">
      {/* ── Meta info ── */}
      {meta?.owner != null && (
        <p className="text-xs text-gray-400">Owner: <span className="font-mono">{String(meta.owner)}</span></p>
      )}

      {/* ── Quick facts grid ── */}
      {qf != null && Object.keys(qf).length > 0 && (
        <section className="rounded-lg border border-gray-200 overflow-hidden">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Stack Overview
          </h3>
          <div className="p-4">
            <QuickFactsGrid qf={qf} />
          </div>
        </section>
      )}

      {/* ── Port / API prefix ── */}
      {(port !== undefined || apiPrefix) && (
        <div className="flex gap-3 flex-wrap">
          {port !== undefined && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
              <p className="text-xs text-blue-500 font-semibold uppercase">Dev Port</p>
              <p className="text-lg font-bold text-blue-700 font-mono">{port}</p>
            </div>
          )}
          {apiPrefix && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
              <p className="text-xs text-blue-500 font-semibold uppercase">API Prefix</p>
              <p className="text-lg font-bold text-blue-700 font-mono">{apiPrefix}</p>
            </div>
          )}
        </div>
      )}

      {/* ── Key packages ── */}
      {packages && packages.length > 0 && (
        <section className="rounded-lg border border-gray-200 overflow-hidden">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Key Packages ({packages.length})
          </h3>
          <PackageTable packages={packages} />
        </section>
      )}

      {/* ── Services (infra) ── */}
      {services && services.length > 0 && (
        <section className="rounded-lg border border-gray-200 overflow-hidden">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Services ({services.length})
          </h3>
          <ServiceTable services={services} />
        </section>
      )}

      {/* ── Volumes ── */}
      {volumes && volumes.length > 0 && (
        <section className="rounded-lg border border-gray-200 overflow-hidden">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Volumes
          </h3>
          <div className="px-4 py-3 space-y-1">
            {volumes.map((v, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="font-mono text-blue-600 w-32 shrink-0">{v.name}</span>
                <span className="text-gray-600">{v.mounted_to}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Networks ── */}
      {networks && networks.length > 0 && (
        <section className="rounded-lg border border-gray-200 overflow-hidden">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Networks
          </h3>
          <div className="px-4 py-3 space-y-2">
            {networks.map((n, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <span className="font-mono font-bold text-gray-800 w-32 shrink-0">{n.name}</span>
                <span className="text-gray-500 text-xs mr-2">{n.driver}</span>
                <span className="text-gray-600">{n.purpose}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Project structure ── */}
      {structure && Object.keys(structure).length > 0 && (
        <section className="rounded-lg border border-gray-200 overflow-hidden">
          <h3 className="border-b border-gray-100 bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Project Structure
          </h3>
          <div className="p-4">
            <ProjectStructure structure={structure} />
          </div>
        </section>
      )}
    </div>
  );
}
