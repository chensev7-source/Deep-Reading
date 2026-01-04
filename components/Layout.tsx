
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, headerTitle = "INTERACTIVE NARRATIVE LAB" }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center py-10 px-4 md:px-0">
      <header className="text-center mb-8 opacity-40 tracking-widest text-xs uppercase font-medium">
        <h1>{headerTitle}</h1>
      </header>
      
      <main className="container bg-white w-full max-auto max-w-4xl p-8 md:p-16 rounded shadow-xl relative min-h-[600px] book-spine flex flex-col transition-all duration-500 overflow-hidden">
        {children}
      </main>
      
      <footer className="mt-8 text-slate-400 text-[10px] tracking-widest text-center uppercase">
        © 2024 Time-Bound Old Books Experience. All rights reserved.
      </footer>
    </div>
  );
};

export default Layout;
