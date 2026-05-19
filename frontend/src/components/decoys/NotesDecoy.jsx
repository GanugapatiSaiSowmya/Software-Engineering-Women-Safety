import React, { useState } from 'react';
import { Plus, ChevronLeft, MoreHorizontal } from 'lucide-react';

export default function NotesDecoy({ onUnlock }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSave = () => {
    // Try to unlock using title or body
    if (title) onUnlock(title);
    if (body) onUnlock(body);
  };

  return (
    <div style={{ width: '100%', height: '100vh', background: '#fefefe', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid #eee', background: '#f9f9f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', color: '#eab308', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
          <span style={{ fontSize: 17 }}>Folders</span>
        </div>
        <div style={{ display: 'flex', gap: 15, color: '#eab308', cursor: 'pointer' }}>
          <MoreHorizontal size={24} />
          <Plus size={24} onClick={handleSave} />
        </div>
      </div>

      {/* Editor */}
      <div style={{ padding: '20px 30px', maxWidth: 800, margin: '0 auto' }}>
        <input 
          type="text" 
          placeholder="Title" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          style={{ width: '100%', fontSize: 28, fontWeight: 'bold', border: 'none', outline: 'none', marginBottom: 15, color: '#333' }}
        />
        <div style={{ fontSize: 13, color: '#999', marginBottom: 20 }}>
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </div>
        <textarea 
          placeholder="Start typing..." 
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onBlur={handleSave}
          style={{ width: '100%', minHeight: '60vh', border: 'none', outline: 'none', fontSize: 17, lineHeight: 1.6, color: '#444', resize: 'none' }}
        />
      </div>

    </div>
  );
}
