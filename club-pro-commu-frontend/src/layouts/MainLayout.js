import React from 'react';
import Navbar from '../components/Navbar';

export default function MainLayout({ children }) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <footer style={{marginTop: 40, textAlign: 'center'}}>© Pro Clubs Marketplace</footer>
    </div>
  );
} 