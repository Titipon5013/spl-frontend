import React from 'react';
import MainLayout from './MainLayout';

interface LayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, pageTitle = 'ParkPilot' }) => (
  <MainLayout pageTitle={pageTitle}>{children}</MainLayout>
);

export default Layout;
