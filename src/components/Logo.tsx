import React from 'react';
import { GraduationCap } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">
      <GraduationCap className="h-8 w-8 text-primary" />
      <span className="font-semibold tracking-wide">Exam Hub</span>
    </div>
  );
};

export default Logo;
