import type { Metadata } from 'next';
import { WikiSidebar } from '@/components/WikiSidebar';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'V-Smart Ledger Wiki', template: '%s — Wiki' },
  description: 'EAM-Tax project knowledge base',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen bg-gray-50">
        <WikiSidebar />
        <main className="flex-1 overflow-y-auto min-h-screen">
          <div className="max-w-4xl mx-auto px-8 py-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
