const STYLES: Record<string, string> = {
  approved:      'bg-green-100 text-green-800',
  accepted:      'bg-green-100 text-green-800',
  passing:       'bg-green-100 text-green-700',
  active:        'bg-green-100 text-green-700',
  done:          'bg-emerald-100 text-emerald-800',
  resolved:      'bg-emerald-100 text-emerald-800',
  planning:      'bg-blue-100 text-blue-800',
  proposed:      'bg-purple-100 text-purple-800',
  backlog:       'bg-slate-100 text-slate-600',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  decided:       'bg-teal-100 text-teal-800',
  deferred:      'bg-orange-100 text-orange-700',
  blocked:       'bg-red-100 text-red-700',
  rejected:      'bg-red-100 text-red-800',
  failing:       'bg-red-100 text-red-700',
  'wont-fix':    'bg-gray-200 text-gray-600',
  inactive:      'bg-gray-100 text-gray-500',
  'not-started': 'bg-gray-100 text-gray-400',
};

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? 'bg-gray-100 text-gray-700';
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${style}`}>
      {status}
    </span>
  );
}
