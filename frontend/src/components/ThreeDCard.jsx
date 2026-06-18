import React, { useRef, useState } from 'react';

const ThreeDCard = ({ children, className = '', style = {}, depth = '25px', ...props }) => {
  const cardRef = useRef(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCoords({ x, y });
    setIsHovered(true);

    const xc = rect.width / 2;
    const yc = rect.height / 2;
    // Rotate up to 10 degrees based on cursor distance from center
    const angleX = (yc - y) / (yc / 10 || 1);
    const angleY = (x - xc) / (xc / 10 || 1);

    card.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-6px) scale(1.015)`;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
  };

  const cardShadow = isHovered 
    ? `0 25px 50px -12px rgba(15, 23, 42, 0.18), 
       0 15px 25px -10px rgba(15, 23, 42, 0.12), 
       inset 0 1px 0 rgba(255, 255, 255, 0.85)`
    : `0 10px 20px -5px rgba(15, 23, 42, 0.08), 
       0 8px 8px -6px rgba(15, 23, 42, 0.05), 
       inset 0 1px 0 rgba(255, 255, 255, 0.7)`;

  const sheenStyle = isHovered
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: `radial-gradient(circle 200px at ${coords.x}px ${coords.y}px, rgba(255, 255, 255, 0.35), transparent 70%)`,
        pointerEvents: 'none',
        zIndex: 2,
        borderRadius: 'inherit',
        mixBlendMode: 'overlay',
        transition: 'background 0.05s ease'
      }
    : {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle 0px at 0px 0px, transparent, transparent)',
        pointerEvents: 'none',
        zIndex: 2,
        borderRadius: 'inherit',
        transition: 'background 0.4s ease'
      };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`premium-card-bg ${className}`}
      style={{
        position: 'relative',
        transition: 'transform 0.1s ease-out, box-shadow 0.1s ease-out, border-color 0.4s ease',
        transformStyle: 'preserve-3d',
        boxShadow: cardShadow,
        ...style
      }}
      {...props}
    >
      {/* Dynamic light reflection sheen overlay */}
      <div style={sheenStyle} />

      {/* Floating Inner Content Wrapper */}
      <div 
        style={{ 
          transform: isHovered ? `translateZ(${depth})` : 'translateZ(0px)', 
          transition: 'transform 0.15s ease-out',
          transformStyle: 'preserve-3d',
          height: '100%',
          width: '100%'
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ThreeDCard;
