import { useState, useEffect } from "react";
import { ShieldAlert, Users, Phone, User, Plus, Trash2, Edit2, Check, X, BellRing } from "lucide-react";

const API = "http://127.0.0.1:8000";
const USER_ID = "default_user";

export default function GuardianSOS() {
  const [highAlert, setHighAlert] = useState(false);
  const [guardians, setGuardians] = useState([]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sosActive, setSosActive] = useState(false);

  // ✏️ EDIT STATE
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    fetchGuardians();
    fetchHighAlert();
  }, []);

  const fetchGuardians = async () => {
    try {
      const res = await fetch(`${API}/guardians?user_id=${USER_ID}`);
      const data = await res.json();
      setGuardians(Array.isArray(data) ? data : []);
    } catch {
      setError("Could not load guardians.");
    }
  };

  const fetchHighAlert = async () => {
    try {
      const res = await fetch(`${API}/high-alert/${USER_ID}`);
      const data = await res.json();
      setHighAlert(data.enabled || false);
    } catch {}
  };

  const addGuardian = async () => {
    if (!newName.trim() || !newPhone.trim()) {
      setError("Please enter both a name and a phone number.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await fetch(`${API}/guardians/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          phone: newPhone,
          user_id: USER_ID
        })
      });

      setNewName("");
      setNewPhone("");
      fetchGuardians();
    } catch {
      setError("Failed to add guardian.");
    } finally {
      setLoading(false);
    }
  };

  const removeGuardian = async (id) => {
    await fetch(`${API}/guardians/${id}`, { method: "DELETE" });
    fetchGuardians();
  };

  const saveEdit = async (id) => {
    if (!editName || !editPhone) return;

    await fetch(`${API}/guardians/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        phone: editPhone,
        user_id: USER_ID
      })
    });

    setEditingId(null);
    fetchGuardians();
  };

  const triggerSOS = async () => {
    setSosActive(true);
    try {
      const res = await fetch(`${API}/sos/trigger`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: USER_ID }),
      });
      const data = await res.json();

      if (res.ok) {
        setTimeout(() => {
          alert("🚨 SOS SIGNAL TRANSMITTED SUCCESSFULLY!");
          setSosActive(false);
        }, 1500);
      } else {
        alert(data.detail || "Failed to trigger SOS");
        setSosActive(false);
      }
    } catch (error) {
      console.error("SOS Error:", error);
      alert("Backend connection failed.");
      setSosActive(false);
    }
  };

  const toggleHighAlert = async (val) => {
    setHighAlert(val);
    await fetch(`${API}/high-alert/toggle`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: USER_ID, enabled: val })
    });
  };

  const inputStyle = {
    flex: 1, padding: "12px 16px", borderRadius: 8, fontSize: 13,
    background: "var(--bg-navy)", color: "#fff", border: `1px solid var(--slate-800)`,
    outline: "none", transition: "border 0.2s"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, paddingBottom: 40 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>

        {/* LEFT: Trusted Circle */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 12 }}>
            <Users size={20} color="var(--neon-teal)" />
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 2, color: "#fff" }}>TRUSTED CIRCLE</span>
          </div>

          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
            {guardians.length === 0 && (
              <div style={{ fontSize: 13, color: "var(--slate-400)", textAlign: "center", padding: 32 }}>
                No guardians initialized. Add trusted contacts to enable SOS protocols.
              </div>
            )}

            {guardians.map((g) => (
              <div key={g.id} style={{
                display: "flex", alignItems: "center", gap: 16, padding: "16px",
                borderRadius: 12, background: "var(--bg-navy-light)", border: `1px solid var(--slate-800)`,
                transition: "all 0.2s ease"
              }}>
                {/* Avatar */}
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", background: "var(--neon-teal-dim)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, color: "var(--neon-teal)", fontWeight: 700, border: "1px solid rgba(0,255,204,0.2)"
                }}>
                  {g.name[0].toUpperCase()}
                </div>

                {/* TEXT / EDIT */}
                <div style={{ flex: 1 }}>
                  {editingId === g.id ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input
                        value={editName} onChange={(e) => setEditName(e.target.value)}
                        style={{ ...inputStyle, padding: "8px 12px" }}
                      />
                      <input
                        value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                        style={{ ...inputStyle, padding: "8px 12px" }}
                      />
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize: 15, color: "#fff", fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                        {g.name}
                        {/* STATUS DOT */}
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--neon-teal)", boxShadow: "0 0 8px var(--neon-teal)" }} />
                      </div>
                      <div className="mono" style={{ fontSize: 12, color: "var(--slate-400)", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                        <Phone size={12} /> {g.phone}
                      </div>
                    </>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div style={{ display: "flex", gap: 8 }}>
                  {editingId === g.id ? (
                    <>
                      <button onClick={() => saveEdit(g.id)} style={{ background: "var(--neon-teal-dim)", border: "1px solid var(--neon-teal)", color: "var(--neon-teal)", padding: 8, borderRadius: 6, cursor: "pointer" }}><Check size={16} /></button>
                      <button onClick={() => setEditingId(null)} style={{ background: "transparent", border: "1px solid var(--slate-800)", color: "var(--slate-400)", padding: 8, borderRadius: 6, cursor: "pointer" }}><X size={16} /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(g.id); setEditName(g.name); setEditPhone(g.phone); }} style={{ background: "transparent", border: "1px solid var(--slate-800)", color: "var(--slate-300)", padding: 8, borderRadius: 6, cursor: "pointer" }}>
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => removeGuardian(g.id)} style={{ background: "transparent", border: "1px solid var(--danger-red-dim)", color: "var(--danger-red)", padding: 8, borderRadius: 6, cursor: "pointer" }}>
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            <div style={{ height: 1, background: "var(--border-color)", margin: "8px 0" }} />

            {/* ADD INPUT */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ flex: 1, position: "relative" }}>
                  <User size={16} color="var(--slate-400)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input placeholder="Guardian Name" value={newName} onChange={e => setNewName(e.target.value)} style={{ ...inputStyle, paddingLeft: 40 }} />
                </div>
                <div style={{ flex: 1, position: "relative" }}>
                  <Phone size={16} color="var(--slate-400)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input placeholder="Phone Number" value={newPhone} onChange={e => setNewPhone(e.target.value)} style={{ ...inputStyle, paddingLeft: 40 }} />
                </div>
              </div>

              {error && <div style={{ color: "var(--danger-red)", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}><ShieldAlert size={14} /> {error}</div>}

              <button onClick={addGuardian} disabled={loading} style={{
                padding: "14px", borderRadius: 8, background: "var(--bg-navy-light)", color: "var(--neon-teal)",
                border: "1px dashed var(--neon-teal)", fontSize: 13, fontWeight: 700, letterSpacing: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, transition: "all 0.2s"
              }} onMouseEnter={e => !loading && (e.currentTarget.style.background = "var(--neon-teal-dim)")} onMouseLeave={e => !loading && (e.currentTarget.style.background = "var(--bg-navy-light)")}>
                {loading ? "INITIALIZING..." : <><Plus size={18} /> ADD GUARDIAN</>}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: SOS Trigger */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: 12 }}>
            <ShieldAlert size={20} color="var(--danger-red)" />
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: 2, color: "#fff" }}>EMERGENCY OVERRIDE</span>
          </div>
          
          <div style={{ padding: 40, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 8 }}>GUARDIAN PROTOCOL</div>
              <div style={{ fontSize: 14, color: "var(--slate-400)", maxWidth: 300, margin: "0 auto", lineHeight: 1.6 }}>
                Transmits immediate distress signal with location data to all initialized contacts.
              </div>
            </div>

            <div style={{ position: "relative", width: 200, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Ripple Effect Layers */}
              {sosActive && (
                <>
                  <div className="animate-ripple-red" style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", background: "transparent", zIndex: 1 }} />
                  <div className="animate-ripple-red" style={{ position: "absolute", width: "100%", height: "100%", borderRadius: "50%", background: "transparent", animationDelay: "0.5s", zIndex: 1 }} />
                </>
              )}
              
              <button 
                onClick={triggerSOS}
                disabled={sosActive}
                style={{ 
                  width: 160, height: 160, borderRadius: "50%",
                  background: sosActive ? "var(--danger-red)" : "var(--bg-navy-light)",
                  border: `4px solid ${sosActive ? "var(--danger-red)" : "var(--danger-red-dim)"}`,
                  boxShadow: sosActive ? "0 0 60px rgba(255, 51, 51, 0.8)" : "0 0 20px rgba(255, 51, 51, 0.2)",
                  color: sosActive ? "#fff" : "var(--danger-red)",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
                  cursor: sosActive ? "not-allowed" : "pointer", transition: "all 0.3s ease", zIndex: 2
                }}
                onMouseEnter={e => !sosActive && (e.currentTarget.style.background = "rgba(255, 51, 51, 0.1)")}
                onMouseLeave={e => !sosActive && (e.currentTarget.style.background = "var(--bg-navy-light)")}
                onMouseDown={e => !sosActive && (e.currentTarget.style.transform = "scale(0.95)")}
                onMouseUp={e => !sosActive && (e.currentTarget.style.transform = "scale(1)")}
              >
                <BellRing size={48} className={sosActive ? "animate-pulse" : ""} />
                <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: 2 }}>SOS NOW</span>
              </button>
            </div>

            {sosActive && (
              <div className="mono" style={{ marginTop: 40, fontSize: 14, color: "var(--danger-red)", fontWeight: 700, letterSpacing: 2, textAlign: "center", animation: "pulse 1s infinite" }}>
                BROADCASTING DISTRESS SIGNAL...
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}