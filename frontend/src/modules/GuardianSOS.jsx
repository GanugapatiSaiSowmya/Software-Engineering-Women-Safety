import { useState, useEffect } from "react";
import Toggle from "../components/Toggle";
import { card, cardTitle, dot, actionBtn } from "../styles/theme";
import { useTheme } from "../context/ThemeContext";

const API      = "http://127.0.0.1:8000";
const USER_ID  = "default_user"; // replace with real user id from auth token later

export default function GuardianSOS() {
  const t = useTheme();

  const [highAlert, setHighAlert] = useState(false);
  const [guardians, setGuardians] = useState([]);
  const [newName,   setNewName]   = useState("");
  const [newPhone,  setNewPhone]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  // ── Fetch guardians from PostgreSQL on load ───────────────────────────────
  useEffect(() => {
    fetchGuardians();
    fetchHighAlert();
  }, []);

  const fetchGuardians = async () => {
    try {
      const res  = await fetch(`${API}/guardians?user_id=${USER_ID}`);
      const data = await res.json();
      setGuardians(Array.isArray(data) ? data : []);
    } catch { setError("Could not load guardians."); }
  };

  const fetchHighAlert = async () => {
    try {
      const res  = await fetch(`${API}/high-alert/${USER_ID}`);
      const data = await res.json();
      setHighAlert(data.enabled || false);
    } catch {}
  };

  // ── Add guardian ─────────────────────────────────────────────────────────
  const addGuardian = async () => {
    if (!newName.trim() || !newPhone.trim()) {
      setError("Please enter both a name and a phone number.");
      return;
    }
    setError(""); setLoading(true);
    try {
      await fetch(`${API}/guardians/add`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name: newName.trim(), phone: newPhone.trim(), user_id: USER_ID }),
      });
      setNewName(""); setNewPhone("");
      await fetchGuardians();
    } catch { setError("Failed to add guardian."); }
    finally  { setLoading(false); }
  };

  // ── Remove guardian ───────────────────────────────────────────────────────
  const removeGuardian = async (id) => {
    try {
      await fetch(`${API}/guardians/${id}`, { method: "DELETE" });
      await fetchGuardians();
    } catch { setError("Failed to remove guardian."); }
  };

  // ── Toggle high alert ─────────────────────────────────────────────────────
  const toggleHighAlert = async (val) => {
    setHighAlert(val);
    try {
      await fetch(`${API}/high-alert/toggle`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ user_id: USER_ID, enabled: val }),
      });
    } catch { setError("Failed to update high alert."); }
  };

  // ── Trigger SOS ───────────────────────────────────────────────────────────
  const triggerSOS = async () => {
    try {
      const res  = await fetch(`${API}/sos/trigger`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ user_id: USER_ID }),
      });
      const data = await res.json();
      alert(`🚨 SOS sent to ${data.notified?.length || 0} guardian(s)!`);
    } catch { setError("Failed to trigger SOS."); }
  };

  const inputStyle = {
    flex: 1, padding: "9px 12px", borderRadius: 6, fontSize: 12,
    background: t.input, color: t.text, border: `1px solid ${t.borderMid}`,
    fontFamily: "'Courier New', monospace", outline: "none",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Friendly intro */}
      {/* <div style={{ padding: "14px 18px", borderRadius: 10, background: `${t.green}08`, border: `1px solid ${t.green}22`, display: "flex", alignItems: "flex-start", gap: 12 }}>
        <div style={{ fontSize: 20, marginTop: 1 }}>🤝</div>
        <div>
          <div style={{ fontSize: 13, color: t.text, fontWeight: 700, marginBottom: 4 }}>You're never alone in this</div>
          <div style={{ fontSize: 12, color: t.textDim, lineHeight: 1.7 }}>
            Add people you trust. If you feel unsafe or a serious threat is detected, they'll be notified instantly with your location.
          </div>
        </div>
      </div> */}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* Trusted Circle */}
        <div style={{ ...card(t) }}>
          <div style={{ ...cardTitle(t) , color: t.textDim }}><span style={dot(t.purple)} />TRUSTED CIRCLE</div>
          <div style={{ fontSize: 11, color: t.textDim, marginTop: 6, marginBottom: 14, lineHeight: 1.6 }}>
            These people will be contacted if you send an emergency alert.
          </div>
          {/* Guardian list */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {guardians.length === 0 && (
              <div style={{ fontSize: 11, color: t.textFaint, textAlign: "center", padding: "12px 0" }}>
                No guardians added yet.
              </div>
            )}
            {guardians.map((g) => (
              <div key={g.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 8, background: `${t.purple}0d`, border: `1px solid ${t.purple}22` }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${t.purple}22`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: t.purple, fontWeight: 700, flexShrink: 0 }}>
                  {g.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>{g.name}</div>
                  <div style={{ fontSize: 10, color: t.textDim, fontFamily: "monospace" }}>{g.phone}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: t.green, boxShadow: `0 0 6px ${t.green}` }} />
                <button onClick={() => removeGuardian(g.id)}
                  style={{ background: "transparent", border: "none", color: t.textFaint, cursor: "pointer", fontSize: 16, padding: "0 4px", lineHeight: 1 }} title="Remove">
                  ×
                </button>
              </div>
            ))}

            {/* Add guardian inputs */}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <input placeholder="Name"  value={newName}  onChange={e => setNewName(e.target.value)}  style={inputStyle} />
              <input placeholder="Phone" value={newPhone} onChange={e => setNewPhone(e.target.value)} style={inputStyle} />
            </div>

            {error && <div style={{ fontSize: 11, color: t.red }}>{error}</div>}

            <button onClick={addGuardian} disabled={loading}
              style={{ ...actionBtn(t.purple), padding: "9px", fontSize: 11, textAlign: "center", opacity: loading ? 0.6 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "Adding…" : "⊕ Add Guardian"}
            </button>

            <button onClick={triggerSOS}
              style={{ ...actionBtn(t.red), padding: "9px", fontSize: 11, textAlign: "center" }}>
              🚨 Trigger SOS Now
            </button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Live Location Map
          <div style={{ ...card(t), background: "#0a1628" }}>
            <div style={{ ...cardTitle(t), color: "#ffffff" }}><span style={dot(highAlert ? t.green : t.textFaint)} />LIVE LOCATION BROADCAST</div>
            <div style={{ fontSize: 11, color: "#dcd4d4", marginTop: 6, marginBottom: 12, lineHeight: 1.6 }}>
              {highAlert ? "Your location is being shared in real time." : "Your location will appear here when High-Alert is on."}
            </div>
            <div style={{ borderRadius: 8, overflow: "hidden", height: 150, background: t.dark ? "linear-gradient(135deg, #0a1628, #0f2040)" : "linear-gradient(135deg, #dce8f8, #c8d8ec)", position: "relative", border: `1px solid ${t.border}` }}>
              {[...Array(6)].map((_, i) => <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: `${i * 20}%`, height: 1, background: `${t.green}15` }} />)}
              {[...Array(8)].map((_, i) => <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: `${i * 14}%`, width: 1, background: `${t.green}15` }} />)}
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: highAlert ? t.red : t.green, boxShadow: `0 0 ${highAlert ? 16 : 8}px ${highAlert ? t.red : t.green}`, zIndex: 2 }} />
                {highAlert && <div style={{ position: "absolute", inset: -10, borderRadius: "50%", border: `2px solid ${t.red}44`, animation: "ripple 1.5s ease-out infinite" }} />}
              </div>
              {!highAlert && <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: t.textFaint, fontSize: 11, letterSpacing: 1 }}>Standby</div>}
            </div>
            {highAlert && <div style={{ marginTop: 10, fontSize: 11, color: t.green, fontFamily: "monospace" }}>📍 Location sharing active · {guardians.length} guardian(s) notified</div>}
          </div> */}

          {/* Help Resources */}
          {/* <div style={{ ...card(t), background: "#0a1628" }}>
            <div style={{ ...cardTitle(t), color: "#ffffff" }}><span style={dot(t.amber)} />NEED MORE HELP?</div>
            <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Women's Helpline",   value: "181",               color: t.red    },
                { label: "Cyber Crime Portal", value: "cybercrime.gov.in", color: t.purple },
                { label: "Emergency Services", value: "112",               color: t.red    },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", borderRadius: 6, background: t.bgCard, border: `1px solid ${t.border}` }}>
                  <span style={{ fontSize: 11, color: "#dcd4d4" }}>{r.label}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: r.color, fontFamily: "monospace" }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}