import { GraduationCap } from 'lucide-react';
import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
      <div className="rounded-lg bg-primary/10 p-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/>
            <path d="M9 3V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <span className="font-headline tracking-tighter">notesight</span>
    </div>
  );
};

export default Logo;
