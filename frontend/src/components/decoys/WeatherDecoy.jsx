import React, { useState } from 'react';
import { Search, CloudRain, Sun, Wind } from 'lucide-react';

export default function WeatherDecoy({ onUnlock }) {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query) {
      onUnlock(query);
      setQuery('');
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: 'linear-gradient(to bottom, #4facfe 0%, #00f2fe 100%)', color: '#fff', fontFamily: 'sans-serif', padding: 20 }}>
      <div style={{ maxWidth: 400, margin: '40px auto 0', display: 'flex', flexDirection: 'column', gap: 30 }}>
        
        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
          <Search size={20} style={{ position: 'absolute', left: 15, top: 15, color: '#999' }} />
          <input 
            type="text" 
            placeholder="Search City..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: '100%', padding: '15px 20px 15px 45px', borderRadius: 30, border: 'none', fontSize: 16, outline: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}
          />
        </form>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <h2 style={{ fontSize: 36, margin: '0 0 10px 0', fontWeight: 300 }}>London, UK</h2>
          <div style={{ fontSize: 80, fontWeight: 700, margin: '20px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
            <CloudRain size={80} color="#fff" />
            14°C
          </div>
          <p style={{ fontSize: 20, margin: 0, opacity: 0.9 }}>Light Rain</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.2)', padding: 20, borderRadius: 20, marginTop: 40 }}>
          <div style={{ textAlign: 'center' }}>
            <Wind size={24} style={{ marginBottom: 5 }} />
            <div style={{ fontSize: 14 }}>12 km/h</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Wind</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <Sun size={24} style={{ marginBottom: 5 }} />
            <div style={{ fontSize: 14 }}>45%</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Humidity</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <CloudRain size={24} style={{ marginBottom: 5 }} />
            <div style={{ fontSize: 14 }}>80%</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>Precip</div>
          </div>
        </div>

      </div>
    </div>
  );
}
