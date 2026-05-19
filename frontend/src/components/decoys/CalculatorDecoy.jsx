import React, { useState } from 'react';

export default function CalculatorDecoy({ onUnlock }) {
  const [display, setDisplay] = useState('');

  const handlePress = (val) => {
    if (val === 'C') {
      setDisplay('');
    } else if (val === '=') {
      // Try to unlock when equals is pressed
      if (display.length > 0) {
        onUnlock(display);
      }
    } else {
      setDisplay((prev) => prev + val);
    }
  };

  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    'C', '0', '=', '+'
  ];

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f3f4f6', fontFamily: 'sans-serif' }}>
      <div style={{ width: 320, background: '#fff', borderRadius: 16, boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: 20 }}>
        <div style={{ background: '#1f2937', color: '#fff', fontSize: 32, padding: '20px 15px', textAlign: 'right', borderRadius: 8, marginBottom: 20, minHeight: 76, wordWrap: 'break-word' }}>
          {display || '0'}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {buttons.map((btn) => (
            <button
              key={btn}
              onClick={() => handlePress(btn)}
              style={{
                padding: '20px 0',
                fontSize: 20,
                border: 'none',
                borderRadius: 8,
                background: ['/', '*', '-', '+', '='].includes(btn) ? '#3b82f6' : btn === 'C' ? '#ef4444' : '#e5e7eb',
                color: ['/', '*', '-', '+', '=', 'C'].includes(btn) ? '#fff' : '#1f2937',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'filter 0.2s'
              }}
              onMouseOver={(e) => e.target.style.filter = 'brightness(0.9)'}
              onMouseOut={(e) => e.target.style.filter = 'brightness(1)'}
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
