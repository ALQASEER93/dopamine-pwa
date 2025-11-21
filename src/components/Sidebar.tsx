
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const links = [
  { href: '/', label: 'لوحة التحكم' },
  { href: '/reps-map', label: 'خريطة المندوبين' },
  { href: '/visits', label: 'الزيارات' },
  { href: '/settings', label: 'الإعدادات' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="sidebar-logo-dot" />
        <span>DOPAMINE&nbsp;PHARMA</span>
      </div>
      <nav className="sidebar-menu">
        {links.map((link) => {
          const currentPath = pathname || '';
          const active = currentPath === link.href || (link.href !== '/' && currentPath.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${active ? 'active' : ''}`}
            >
              <span className="label">
                <span className="dot" />
                {link.label}
              </span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <div>Executive Director – Omar Alqaseer</div>
        <div>DPM • Internal PWA</div>
      </div>
    </aside>
  );
}
