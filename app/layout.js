import 'leaflet/dist/leaflet.css';
import './globals.css';
import Sidebar from '../components/Sidebar';
import PwaClient from '../components/PwaClient';
import OfflineSyncClient from '../components/OfflineSyncClient';

export const metadata = {
  title: 'Dopamine CRM PWA',
  description: 'Field force tracking & visits for Dopamine Pharma'
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#020617" />
      </head>
      <body>
        <PwaClient />
        <OfflineSyncClient />
        <div className="app-shell">
          <Sidebar />
          <main className="app-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
