import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "w-12 h-12 rounded-full" }) => {
  return (
    <div className={`${className} relative`}>
      <img 
        src="https://i.postimg.cc/nc22Md9h/Whats-App-Image-2025-09-16-22-00-33-a4e28ce0.jpg" 
        alt="APUIC CAPITAL" 
        className="w-full rounded-full h-full object-contain"
      />
    </div>
  );
};