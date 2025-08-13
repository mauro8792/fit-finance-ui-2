/* eslint-disable react/prop-types */
import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within SidebarProvider');
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarWidth = isCollapsed ? 80 : 250;
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <SidebarContext.Provider value={{ 
      isCollapsed, 
      setIsCollapsed, 
      sidebarWidth,
      toggleSidebar: () => setIsCollapsed(!isCollapsed),
        drawerOpen,
          setDrawerOpen
    }}>
      {children}
    </SidebarContext.Provider>
  );
};