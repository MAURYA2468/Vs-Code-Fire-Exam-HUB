import { GraduationCap } from 'lucide-react';
import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2 text-2xl font-bold text-foreground">
      <div className="rounded-lg bg-primary p-2">
        <GraduationCap className="h-6 w-6 text-primary-foreground" />
      </div>
      <span className="font-headline">OfflineExamPro</span>
    </div>
  );
};

export default Logo;
