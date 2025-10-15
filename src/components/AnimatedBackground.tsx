"use client";

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 h-full w-full bg-background">
       <div 
        className="absolute inset-0 h-full w-full"
        style={{
          background: 'linear-gradient(-45deg, hsl(var(--background)), #5b2a86, hsl(var(--accent)), hsl(var(--primary)))',
          backgroundSize: '400% 400%',
          animation: 'gradient-animation 15s ease infinite',
        }}
      />
    </div>
  );
}
