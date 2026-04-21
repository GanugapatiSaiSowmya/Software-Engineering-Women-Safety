import { useState, useEffect } from "react";
import Toggle from "../components/Toggle";
import { card, cardTitle, dot, actionBtn } from "../styles/theme";
import { useTheme } from "../context/ThemeContext";

const API = "http://127.0.0.1:8000";

export default function GuardianSOS() {
  const t = useTheme();

  const [highAlert, setHighAlert] = useState(false);
  const [guardians, setGuardians] = useState([]);

  // ✅ NEW STATES (for UI input)
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  // 🔄 Fetch guardians on load
  useEffect(() => {
    fetch(`${API}/guardians`)
      .then(res => res.json())
      .then(data => setGuardians(data))
      .catch(err => console.error(err));
  }, []);

  // 🚨 Trigger SOS
  const triggerSOS = async () => {
    const res = await fetch(`${API}/sos/trigger`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ user_id: "user_123" })
    });

    const data = await res.json();
    alert("SOS Sent to Guardians!");
    console.log(data);
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
      
      {/* LEFT SIDE - GUARDIANS */}
      <div style={card(t)}>
        <div style={cardTitle(t)}>
          <span style={dot(t.purple)} />
          TRUSTED CIRCLE
        </div>

        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          
          {guardians.map((g, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 8,
                background: `${t.purple}0d`,
                border: `1px solid ${t.purple}33`
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: `${t.purple}22`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: t.purple
                }}
              >
                {g.name[0]}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: t.text }}>{g.name}</div>
                <div style={{ fontSize: 10, color: t.textDim, fontFamily: "monospace" }}>
                  {g.phone}
                </div>
              </div>

              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: t.green,
                  boxShadow: `0 0 6px ${t.green}`
                }}
              />

              {/* ❌ DELETE BUTTON */}
              <button
                onClick={async () => {
                  await fetch(`${API}/guardians/${g.id}`, {
                    method: "DELETE"
                  });

                  const res = await fetch(`${API}/guardians`);
                  setGuardians(await res.json());
                }}
                style={{ fontSize: 10, marginLeft: 8 }}
              >
                ❌
              </button>
            </div>
          ))}

          {/* ✅ INPUT FIELDS (REPLACES PROMPT) */}
          <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
            <input
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              style={{ flex: 1, padding: 6, borderRadius: 6 }}
            />
            <input
              placeholder="Phone"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              style={{ flex: 1, padding: 6, borderRadius: 6 }}
            />
          </div>

          {/* ✅ ADD GUARDIAN BUTTON */}
          <button
            onClick={async () => {
              if (!newName || !newPhone) return;

              await fetch(`${API}/guardians/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newName, phone: newPhone })
              });

              setNewName("");
              setNewPhone("");

              const res = await fetch(`${API}/guardians`);
              setGuardians(await res.json());
            }}
            style={{ ...actionBtn(t.purple), marginTop: 6, fontSize: 11 }}
          >
            ⊕ ADD GUARDIAN
          </button>

          {/* SOS BUTTON */}
          <button
            onClick={triggerSOS}
            style={{ ...actionBtn(t.red), marginTop: 6, fontSize: 11 }}
          >
            🚨 TRIGGER SOS
          </button>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        
        {/* HIGH ALERT */}
        <div
          style={{
            ...card(t),
            border: `1px solid ${highAlert ? t.red + "66" : t.border}`,
            transition: "border-color 0.4s"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <div style={cardTitle(t)}>
                <span style={dot(highAlert ? t.red : t.textFaint)} />
                HIGH-ALERT MODE
              </div>

              <div style={{ fontSize: 11, color: t.textDim, marginTop: 4 }}>
                Auto-broadcasts GPS on Level 10 threat
              </div>
            </div>

            <Toggle
              value={highAlert}
              onChange={async (val) => {
                setHighAlert(val);

                await fetch(`${API}/high-alert/toggle`, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    user_id: "user_123",
                    enabled: val
                  })
                });
              }}
              activeColor={t.red}
            />
          </div>

          {highAlert && (
            <div
              style={{
                marginTop: 14,
                padding: "10px 14px",
                borderRadius: 8,
                background: `${t.red}14`,
                border: `1px solid ${t.red}44`,
                fontSize: 11,
                color: t.red,
                animation: "pulse 2s ease-in-out infinite"
              }}
            >
              ⚠ HIGH-ALERT ACTIVE — Guardians will be alerted automatically
            </div>
          )}
        </div>

        {/* LIVE LOCATION (UI ONLY) */}
        <div style={card(t)}>
          <div style={cardTitle(t)}>
            <span style={dot(highAlert ? t.green : t.textFaint)} />
            LIVE LOCATION BROADCAST
          </div>

          <div
            style={{
              marginTop: 14,
              borderRadius: 8,
              overflow: "hidden",
              height: 160,
              background: t.dark
                ? "linear-gradient(135deg, #0a1628, #0f2040)"
                : "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
              position: "relative",
              border: `1px solid ${t.border}`
            }}
          >
            {[...Array(6)].map((_, i) => (
              <div key={`h${i}`} style={{ position: "absolute", left: 0, right: 0, top: `${i * 20}%`, height: 1, background: `${t.green}18` }} />
            ))}
            {[...Array(8)].map((_, i) => (
              <div key={`v${i}`} style={{ position: "absolute", top: 0, bottom: 0, left: `${i * 14}%`, width: 1, background: `${t.green}18` }} />
            ))}

            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: highAlert ? t.red : t.green,
                  boxShadow: `0 0 ${highAlert ? 16 : 8}px ${highAlert ? t.red : t.green}`
                }}
              />
            </div>

            {!highAlert && (
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: t.textFaint,
                fontSize: 12,
                letterSpacing: 1.5
              }}>
                STANDBY
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}