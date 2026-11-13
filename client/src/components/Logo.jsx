import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'md', showTagline = true, to = '/' }) {
  const sizeClasses = {
    sm: { img: 'w-9 h-9', title: 'text-lg', tag: 'text-[9px]' },
    md: { img: 'w-12 h-12', title: 'text-2xl', tag: 'text-xs' },
    lg: { img: 'w-20 h-20', title: 'text-4xl', tag: 'text-sm' },
    xl: { img: 'w-28 h-28', title: 'text-5xl', tag: 'text-base' }
  }[size] || { img: 'w-12 h-12', title: 'text-2xl', tag: 'text-xs' };

  const content = (
    <div className="flex items-center gap-3 group select-none">
      <div className={`relative ${sizeClasses.img} flex-shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        <img
          src="/logo-badge.png"
          alt="Trio Treats Official Logo"
          className="w-full h-full object-contain rounded-full shadow-md border border-[#FAD2E1] bg-[#FFF9F2]"
          onError={(e) => {
            // Fallback to logo.png if badge has any issue
            e.target.src = '/logo.png';
          }}
        />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F4AEC5] opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D68C98]"></span>
        </span>
      </div>

      <div className="flex flex-col">
        <span className={`font-serif font-bold tracking-wider text-[#3D2314] leading-none ${sizeClasses.title} group-hover:text-[#5C3419] transition-colors`}>
          TRIO TREATS
        </span>
        {showTagline && (
          <span className={`font-hand text-[#7B4B29] tracking-wide mt-0.5 italic ${sizeClasses.tag}`}>
            "A Little Bite of Happiness"
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="inline-block">{content}</Link>;
  }

  return content;
}
