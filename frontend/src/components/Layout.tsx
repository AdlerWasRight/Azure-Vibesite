import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <main>
        {children}
      </main>
      {/* You could add a Footer component here if needed */}
    </div>
  );
};

export default Layout; 