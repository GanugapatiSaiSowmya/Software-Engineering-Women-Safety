import React, { useState } from 'react';
import { Search, Menu, Share2, Bookmark } from 'lucide-react';

export default function NewsDecoy({ onUnlock }) {
  const [query, setQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (query) {
      onUnlock(query);
      setQuery('');
    }
  };

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', fontFamily: 'Georgia, serif' }}>
      
      {/* Header */}
      <header style={{ borderBottom: '1px solid #ddd', padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Menu size={24} style={{ cursor: 'pointer' }} />
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0, textTransform: 'uppercase', letterSpacing: 2 }}>Daily Bugle</h1>
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: 20, padding: '5px 15px' }}>
          <Search size={16} color="#888" />
          <input 
            type="text" 
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', padding: '5px 10px', fontSize: 14 }}
          />
        </form>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 20px' }}>
        
        <div style={{ borderBottom: '1px solid #eee', paddingBottom: 30, marginBottom: 30 }}>
          <h2 style={{ fontSize: 36, fontWeight: 'normal', lineHeight: 1.2, marginBottom: 15 }}>Global Markets Rally Amid Tech Innovations</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 15, color: '#666', fontSize: 12, marginBottom: 20, fontFamily: 'sans-serif', textTransform: 'uppercase' }}>
            <span>By Jane Doe</span>
            <span>•</span>
            <span>2 hours ago</span>
          </div>
          <div style={{ width: '100%', height: 350, background: '#e5e7eb', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
            [Image Placeholder]
          </div>
          <p style={{ fontSize: 18, lineHeight: 1.6, color: '#333' }}>
            In a surprising turn of events, global markets have seen a significant upswing today, largely driven by unexpected breakthroughs in the technology sector. Investors are showing renewed confidence...
          </p>
          <div style={{ display: 'flex', gap: 20, marginTop: 20, color: '#555' }}>
            <Share2 size={20} style={{ cursor: 'pointer' }} />
            <Bookmark size={20} style={{ cursor: 'pointer' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 30 }}>
          <div>
            <h3 style={{ fontSize: 20, marginBottom: 10 }}>Local Election Results Expected Tonight</h3>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.5 }}>Voters turned out in record numbers today to cast their ballots in what is proving to be a tightly contested race...</p>
          </div>
          <div>
            <h3 style={{ fontSize: 20, marginBottom: 10 }}>New Study Highlights Benefits of Mediterranean Diet</h3>
            <p style={{ fontSize: 14, color: '#555', lineHeight: 1.5 }}>Researchers have published new findings suggesting that adhering to a Mediterranean diet can significantly improve cardiovascular health...</p>
          </div>
        </div>

      </main>
    </div>
  );
}
