'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type EntityType = 'feature' | 'api-contract' | 'decision' | 'bug';

interface ActionDef {
  id: string;
  label: string;
  color: 'green' | 'red' | 'gray';
  buildPatches: (today: string) => Record<string, unknown>;
  hideWhen?: string[];
}

const ACTIONS: Record<EntityType, ActionDef[]> = {
  feature: [
    {
      id: 'approve',
      label: 'Approve',
      color: 'green',
      buildPatches: (today) => ({
        approval: { status: 'approved', approved_at: today },
        meta: { status: 'approved' },
      }),
      hideWhen: ['approved'],
    },
    {
      id: 'reject',
      label: 'Reject',
      color: 'red',
      buildPatches: () => ({
        approval: { status: 'rejected' },
        meta: { status: 'rejected' },
      }),
      hideWhen: ['rejected'],
    },
  ],
  'api-contract': [
    {
      id: 'approve',
      label: 'Approve',
      color: 'green',
      buildPatches: (today) => ({ status: 'approved', updatedAt: today }),
      hideWhen: ['approved'],
    },
    {
      id: 'reject',
      label: 'Reject',
      color: 'red',
      buildPatches: () => ({ status: 'rejected' }),
      hideWhen: ['rejected'],
    },
  ],
  decision: [
    {
      id: 'accept',
      label: 'Accept',
      color: 'green',
      buildPatches: (today) => ({ status: 'accepted', decided_at: today }),
      hideWhen: ['accepted'],
    },
    {
      id: 'reject',
      label: 'Reject',
      color: 'red',
      buildPatches: () => ({ status: 'rejected' }),
      hideWhen: ['rejected'],
    },
  ],
  bug: [
    {
      id: 'resolve',
      label: 'Resolve',
      color: 'green',
      buildPatches: (today) => ({ status: 'resolved', resolved_at: today }),
      hideWhen: ['resolved'],
    },
    {
      id: 'wont-fix',
      label: "Won't Fix",
      color: 'gray',
      buildPatches: () => ({ status: 'wont-fix' }),
      hideWhen: ['wont-fix'],
    },
  ],
};

const BTN_STYLES: Record<string, string> = {
  green: 'bg-green-600 text-white hover:bg-green-700 border-green-600',
  red:   'bg-red-500 text-white hover:bg-red-600 border-red-500',
  gray:  'bg-white text-gray-600 hover:bg-gray-100 border-gray-300',
};

interface Props {
  section: string;
  slug: string;
  entityType: EntityType;
  /** Normalized current status to determine which buttons are available */
  currentStatus?: string;
}

export function AdminActions({ section, slug, entityType, currentStatus }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const defs = ACTIONS[entityType] ?? [];
  const available = defs.filter(
    (d) => !d.hideWhen || !currentStatus || !d.hideWhen.includes(currentStatus)
  );

  if (available.length === 0) return null;

  async function doAction(def: ActionDef) {
    setLoading(def.id);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const patches = def.buildPatches(today);
      const filePath = `${section}/${slug}.json`;
      const res = await fetch('/api/wiki-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, patches }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? 'Update failed');
        return;
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 mr-1">Admin</span>
        {available.map((def) => (
          <button
            key={def.id}
            onClick={() => doAction(def)}
            disabled={loading !== null}
            className={[
              'rounded-md border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50',
              BTN_STYLES[def.color],
            ].join(' ')}
          >
            {loading === def.id ? '…' : def.label}
          </button>
        ))}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
