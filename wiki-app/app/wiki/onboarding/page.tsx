import type { Metadata } from 'next';
import { getEntry } from '@/lib/db';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Developer Onboarding' };

interface OnboardingStep {
  step: number;
  title: string;
  command?: string;
  notes?: string;
}

interface CommonIssue {
  issue: string;
  fix: string;
}

interface Onboarding {
  meta: { title: string; last_updated: string };
  quick_facts: {
    estimated_time: string;
    prerequisites: string[];
    contact: string;
  };
  content: {
    tldr: string;
    steps: OnboardingStep[];
    common_issues?: CommonIssue[];
    next_steps?: string[];
  };
}

export default function OnboardingPage() {
  const raw = getEntry('onboarding', '_index');
  if (!raw) notFound();
  const data = raw as unknown as Onboarding;
  const { meta, quick_facts: qf, content } = data;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{meta.title}</h1>
        <span className="text-xs text-gray-400 shrink-0 ml-4">Updated {meta.last_updated}</span>
      </div>

      {/* ── Quick facts ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Estimated Time</p>
          <p className="mt-1 text-lg font-bold text-gray-900">{qf.estimated_time}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 sm:col-span-2">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400 mb-1.5">Prerequisites</p>
          <div className="flex flex-wrap gap-1.5">
            {qf.prerequisites.map((p) => (
              <span key={p} className="text-xs bg-blue-50 text-blue-700 rounded-full px-2.5 py-0.5 border border-blue-200">
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── TLDR ── */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 mb-6">
        <p className="text-sm text-blue-900 font-medium">{content.tldr}</p>
      </div>

      {/* ── Steps ── */}
      <section className="mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">
          Setup Steps ({content.steps.length})
        </h2>
        <div className="space-y-3">
          {content.steps.map((step) => (
            <div key={step.step} className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs shrink-0">
                  {step.step}
                </span>
                <h3 className="font-semibold text-gray-900 text-sm">{step.title}</h3>
              </div>
              <div className="px-4 py-3 space-y-2">
                {step.command && (
                  <code className="block rounded bg-gray-900 text-green-300 font-mono text-xs px-3 py-2 overflow-x-auto">
                    {step.command}
                  </code>
                )}
                {step.notes && (
                  <p className="text-sm text-gray-600">{step.notes}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Common issues ── */}
      {content.common_issues && content.common_issues.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Common Issues
          </h2>
          <div className="space-y-2">
            {content.common_issues.map((issue, i) => (
              <details key={i} className="rounded-lg border border-amber-200 bg-amber-50 overflow-hidden group">
                <summary className="px-4 py-3 cursor-pointer select-none flex items-center gap-2 text-sm font-medium text-amber-800">
                  <span className="text-amber-400 group-open:rotate-90 transition-transform inline-block shrink-0">&#x25B6;</span>
                  {issue.issue}
                </summary>
                <div className="border-t border-amber-200 px-4 py-3">
                  <code className="block rounded bg-gray-900 text-green-300 font-mono text-xs px-3 py-2 overflow-x-auto">
                    {issue.fix}
                  </code>
                </div>
              </details>
            ))}
          </div>
        </section>
      )}

      {/* ── Next steps ── */}
      {content.next_steps && content.next_steps.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">
            Next Steps
          </h2>
          <ul className="space-y-1.5">
            {content.next_steps.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-gray-700">
                <span className="text-blue-400 shrink-0">&#8594;</span>
                {s}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Contact line */}
      {qf.contact && (
        <p className="mt-6 text-xs text-gray-400">
          Questions? Contact: <span className="font-medium text-gray-600">{qf.contact}</span>
        </p>
      )}
    </div>
  );
}
