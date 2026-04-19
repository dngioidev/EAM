import type { Metadata } from 'next';
import { WikiSidebar } from '@/components/WikiSidebar';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'EAM Wiki', template: '%s — Wiki' },
  description: 'EAM project knowledge base',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="flex min-h-screen bg-gray-50">
        <WikiSidebar />
        <main className="flex-1 overflow-y-auto min-h-screen pt-12 lg:pt-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
