'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'لوحة التحكم' },
  { href: '/reps-map', label: 'خريطة المندوبين' },
  { href: '/visits', label: 'الزيارات' },
  { href: '/field-visit', label: 'Field visit' },
  { href: '/settings', label: 'الإعدادات' }
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="logo">DPM</span>
        <span className="subtitle">Field Force</span>
      </div>
      <nav className="sidebar-nav">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={
              'nav-link' + (pathname === link.href ? ' nav-link-active' : '')
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

