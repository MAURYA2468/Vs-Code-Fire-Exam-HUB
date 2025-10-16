import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2 text-2xl font-bold text-gray-800">
      <div className="h-8 w-8 rounded-full border-2 border-primary bg-white flex items-center justify-center">
        <div className="h-5 w-5 rounded-full border-2 border-primary"></div>
      </div>
      <span className="font-semibold tracking-wide">LOGO</span>
    </div>
  );
};

export default Logo;
