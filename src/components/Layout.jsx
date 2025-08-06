

import React from 'react';
import BrandingHeader from './BrandingHeader';
import SidebarComponent from '../scene/global/SidebarComponent';
import { useAuthStore } from '../hooks';
import { InstallPWAAlert } from './InstallPWAAlert';

export default function Layout({ children, showFooter = false }) {
  const { userType } = useAuthStore();
  // Sidebar solo para admin/superadmin (puedes agregar coach si lo deseas)
  const showSidebar = userType === 'admin' || userType === 'superadmin';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <BrandingHeader />
      <InstallPWAAlert />
      <div style={{ display: 'flex', flex: 1, minHeight: '100vh' }}>
        {showSidebar && (
          <SidebarComponent isSidebar={true} />
        )}
        <main style={{ flexGrow: 1,  overflow: 'auto', minHeight: '100vh',  }}>
          {children}
        </main>
      </div>
      {showFooter && (
        <footer style={{ background: '#181818ff', color: '#FFD700', textAlign: 'center', padding: 12 }}>
          © {new Date().getFullYear()} Fit Finance
        </footer>
      )}
    </div>
  );
}
