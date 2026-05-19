import React, { useState } from 'react';
import axios from 'axios';
import CalculatorDecoy from './CalculatorDecoy';
import WeatherDecoy from './WeatherDecoy';
import NotesDecoy from './NotesDecoy';
import NewsDecoy from './NewsDecoy';

const API = "http://127.0.0.1:8000";

const DECOYS = {
  calculator: CalculatorDecoy,
  weather: WeatherDecoy,
  notes: NotesDecoy,
  news: NewsDecoy,
};

export default function DecoyContainer({ skin, email, onUnlockSuccess }) {
  const [loading, setLoading] = useState(false);
  
  // Notice we don't show an explicit error message to preserve the decoy illusion.
  // We just let them fail silently or slightly indicate failure without breaking character.

  const handleUnlock = async (secretKey) => {
    if (loading) return false;
    setLoading(true);

    try {
      const headers = {};
      const token = localStorage.getItem("token");
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await axios.post(`${API}/auth/verify-decoy`, {
        email: email || "unknown",
        secret_key: secretKey
      }, { headers });

      if (res.data.valid) {
        onUnlockSuccess(res.data.stealth_level, res.data.access_token);
        return true;
      }
    } catch (err) {
      // Failed unlock. Ignore silently to keep decoy realistic.
      console.log("Decoy action ignored.");
      return false;
    } finally {
      setLoading(false);
    }
    return false;
  };

  const DecoyComponent = DECOYS[skin] || CalculatorDecoy;

  return (
    <div style={{ position: 'relative' }}>
      {/* We could add a very subtle loading indicator here if needed, but stealth is better */}
      <DecoyComponent onUnlock={handleUnlock} />
    </div>
  );
}
