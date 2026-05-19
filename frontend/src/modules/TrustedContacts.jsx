import { useState, useEffect } from "react";
import { card, cardTitle, dot, actionBtn } from "../styles/theme";
import { useTheme } from "../context/ThemeContext";

const API = "http://127.0.0.1:8000";
const USER_ID = "default_user";

export default function TrustedContacts() {

  const t = useTheme();

  const [guardians, setGuardians] = useState([]);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  useEffect(() => {
    fetchGuardians();
  }, []);

  const fetchGuardians = async () => {

    try {

      const res = await fetch(
        `${API}/guardians?user_id=${USER_ID}`
      );

      const data = await res.json();

      setGuardians(
        Array.isArray(data)
          ? data
          : []
      );

    }

    catch {

      setError(
        "Could not load trusted contacts."
      );

    }

  };


  const addGuardian = async () => {

    if (
      !newName.trim()
      ||
      !newPhone.trim()
    ) {

      setError(
        "Please enter both name and phone."
      );

      return;

    }

    setLoading(true);

    setError("");

    try {

      await fetch(

        `${API}/guardians/add`,

        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({

            name: newName,

            phone: newPhone,

            user_id: USER_ID

          })

        }

      );

      setNewName("");
      setNewPhone("");

      fetchGuardians();

    }

    catch {

      setError(
        "Failed to add trusted contact."
      );

    }

    finally {

      setLoading(false);

    }

  };


  const removeGuardian = async (id) => {

    await fetch(

      `${API}/guardians/${id}`,

      {
        method: "DELETE"
      }

    );

    fetchGuardians();

  };


  const saveEdit = async (id) => {

    setGuardians(

      prev =>

        prev.map(

          g =>

            g.id === id

              ?

              {

                ...g,

                name: editName,

                phone: editPhone

              }

              :

              g

        )

    );

    setEditingId(null);

  };


  const triggerSOS = async () => {

    try {

      await fetch(

        `${API}/sos/trigger`,

        {

          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            user_id: USER_ID
          })

        }

      );

      alert(
        "🚨 SOS triggered successfully!"
      );

    }

    catch {

      alert(
        "Failed to notify trusted contacts."
      );

    }

  };


  const inputStyle = {

    flex: 1,

    padding: "9px 12px",

    borderRadius: 6,

    fontSize: 12,

    background: t.input,

    color: t.text,

    border: `1px solid ${t.green}`,

    outline: "none"

  };


  return (

    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        <div style={card(t)}>

          <div style={cardTitle(t)}>

            <span style={dot(t.purple)} />

            TRUSTED CONTACTS

          </div>

          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>

            {guardians.length === 0 && (

              <div style={{ fontSize: 11, color: t.textFaint, textAlign: "center" }}>

                No trusted contacts added yet.

              </div>

            )}

            {guardians.map((g) => (

              <div
                key={g.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "12px 14px",
                  borderRadius: 8,
                  background: `${t.purple}0d`,
                  border: `1px solid ${t.purple}40`
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
                    color: t.purple,
                    fontWeight: 700
                  }}
                >
                  {g.name[0].toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>

                  {editingId === g.id ? (

                    <>

                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        style={{ width: "100%", marginBottom: 4, padding: 4 }}
                      />

                      <input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        style={{ width: "100%", padding: 4 }}
                      />

                    </>

                  ) : (

                    <>

                      <div style={{ fontSize: 13, color: t.text, fontWeight: 600 }}>

                        {g.name}

                      </div>

                      <div style={{ fontSize: 10, color: t.textDim }}>

                        {g.phone}

                      </div>

                    </>

                  )}

                </div>

                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: t.green
                  }}
                />

                {editingId === g.id ? (

                  <>

                    <button onClick={() => saveEdit(g.id)}>✔</button>

                    <button onClick={() => setEditingId(null)}>✖</button>

                  </>

                ) : (

                  <>

                    <button
                      onClick={() => {

                        setEditingId(g.id);

                        setEditName(g.name);

                        setEditPhone(g.phone);

                      }}
                    >
                      ✏️
                    </button>

                    <button onClick={() => removeGuardian(g.id)}>×</button>

                  </>

                )}

              </div>

            ))}

            <div style={{ display: "flex", gap: 8 }}>

              <input
                placeholder="Name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                style={inputStyle}
              />

              <input
                placeholder="Phone"
                value={newPhone}
                onChange={e => setNewPhone(e.target.value)}
                style={inputStyle}
              />

            </div>

            {error && <div style={{ color: t.red }}>{error}</div>}

            <button
              onClick={addGuardian}
              disabled={loading}
              style={{ ...actionBtn(t.purple) }}
            >
              {loading ? "Adding…" : "⊕ Add Trusted Contact"}
            </button>

            <button
              onClick={triggerSOS}
              style={{ ...actionBtn(t.red) }}
            >
              🚨 Notify Trusted Contacts
            </button>

          </div>

        </div>

      </div>

    </div>

  );

}