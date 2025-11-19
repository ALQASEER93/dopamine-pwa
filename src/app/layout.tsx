
import './globals.css';
import Link from 'next/link';
import type { Metadata } from 'next';
import React from 'react';
import { Sidebar } from '../components/Sidebar';

export const metadata: Metadata = {
  title: 'Dopamine Pharma CRM',
  description: 'Internal field-force tracking PWA for Dopamine Pharma',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="layout-root">
          <Sidebar />
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
