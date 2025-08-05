
import React from 'react';
import BrandingHeader from './BrandingHeader';
import SidebarComponent from '../scene/global/SidebarComponent';
import { useAuthStore } from '../hooks';

export default function Layout({ children, showFooter = false }) {
  const { userType } = useAuthStore();
  // Sidebar solo para admin/superadmin (puedes agregar coach si lo deseas)
  const showSidebar = userType === 'admin' || userType === 'superadmin';

  return (
    <div style={{ minHeight: '100vh', background: '#232323', display: 'flex', flexDirection: 'column' }}>
      <BrandingHeader />
      <div style={{ display: 'flex', flex: 1 }}>
        {showSidebar && (
          <SidebarComponent isSidebar={true} />
        )}
        <main style={{ flexGrow: 1, padding: 24 }}>
          {children}
        </main>
      </div>
      {showFooter && (
        <footer style={{ background: '#181818', color: '#FFD700', textAlign: 'center', padding: 12 }}>
          © {new Date().getFullYear()} Fit Finance
        </footer>
      )}
    </div>
  );
}
