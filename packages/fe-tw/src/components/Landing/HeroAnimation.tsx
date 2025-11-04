"use client";

import React from "react";

const HeroAnimation = () => {
   return (
      <div className="relative w-full h-full flex items-center justify-center">
         <svg
            viewBox="0 0 400 400"
            className="w-full h-full max-w-[500px] max-h-[500px]"
            xmlns="http://www.w3.org/2000/svg"
         >
            <defs>
               <linearGradient id="houseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#a855f7" />
               </linearGradient>

               <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                  <feMerge>
                     <feMergeNode in="coloredBlur"/>
                     <feMergeNode in="SourceGraphic"/>
                  </feMerge>
               </filter>
            </defs>

            {/* Main house outline - single continuous path */}
            <path
               d="M 200 80 L 320 160 L 320 320 L 220 320 L 220 260 L 180 260 L 180 320 L 80 320 L 80 160 Z M 120 180 L 160 180 L 160 220 L 120 220 Z M 240 180 L 280 180 L 280 220 L 240 220 Z"
               fill="none"
               stroke="url(#houseGradient)"
               strokeWidth="3"
               strokeLinecap="round"
               strokeLinejoin="round"
               className="house-path"
               filter="url(#glow)"
            />

            <style jsx>{`
               @keyframes drawPath {
                  0% {
                     stroke-dasharray: 2000;
                     stroke-dashoffset: 2000;
                  }
                  100% {
                     stroke-dasharray: 2000;
                     stroke-dashoffset: 0;
                  }
               }

               @keyframes glow {
                  0%, 100% {
                     filter: drop-shadow(0 0 8px rgba(139, 92, 246, 0.4));
                  }
                  50% {
                     filter: drop-shadow(0 0 16px rgba(139, 92, 246, 0.6));
                  }
               }

               .house-path {
                  animation: drawPath 3s ease-out forwards, glow 3s ease-in-out 3s infinite;
               }

               @media (prefers-reduced-motion: reduce) {
                  .house-path {
                     animation: none;
                     stroke-dashoffset: 0;
                  }
               }
            `}</style>
         </svg>
      </div>
   );
};

export default HeroAnimation;
