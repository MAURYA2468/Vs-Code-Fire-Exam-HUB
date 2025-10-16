import { GraduationCap } from 'lucide-react';
import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
      <GraduationCap className="h-8 w-8 text-primary" />
      <span className="font-headline tracking-tighter">Exam Hub</span>
    </div>
  );
};

export default Logo;
