import React from 'react';

export default function GymLogo({ height = 48 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <img src="/WHITE.png" alt="Logo Gorila Blanco" style={{ height, width: 'auto', maxHeight: height }} />
    </div>
  );
}
