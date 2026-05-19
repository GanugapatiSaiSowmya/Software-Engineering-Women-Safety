import React, { useEffect, useState } from "react";
import axios from "axios";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f0f11",
    fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    color: "#e8e6e1",
    padding: "0",
  },
  header: {
    borderBottom: "1px solid #1e1e24",
    padding: "20px 40px",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    background: "#0f0f11",
  },
  headerDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#6ee7b7",
    boxShadow: "0 0 8px #6ee7b7",
  },
  headerTitle: {
    fontSize: "13px",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#6b6b7a",
    fontWeight: "500",
  },
  layout: {
    maxWidth: "760px",
    margin: "0 auto",
    padding: "48px 40px 80px",
  },
  hero: {
    marginBottom: "48px",
  },
  heroName: {
    fontSize: "36px",
    fontWeight: "600",
    color: "#f0ede8",
    letterSpacing: "-0.02em",
    margin: "0 0 6px",
  },
  heroBio: {
    fontSize: "15px",
    color: "#6b6b7a",
    margin: "0",
    lineHeight: "1.6",
  },
  section: {
    marginBottom: "40px",
  },
  sectionLabel: {
    fontSize: "11px",
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "#4a4a58",
    fontWeight: "600",
    marginBottom: "16px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  sectionLine: {
    flex: 1,
    height: "1px",
    background: "#1e1e24",
  },
  card: {
    background: "#16161c",
    border: "1px solid #1e1e24",
    borderRadius: "12px",
    padding: "24px",
  },
  field: {
    marginBottom: "20px",
  },
  fieldLast: {
    marginBottom: "0",
  },
  label: {
    display: "block",
    fontSize: "12px",
    color: "#6b6b7a",
    marginBottom: "8px",
    letterSpacing: "0.04em",
  },
  input: {
    width: "100%",
    background: "#0f0f11",
    border: "1px solid #1e1e24",
    borderRadius: "8px",
    color: "#e8e6e1",
    fontSize: "15px",
    padding: "10px 14px",
    outline: "none",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  textarea: {
    width: "100%",
    background: "#0f0f11",
    border: "1px solid #1e1e24",
    borderRadius: "8px",
    color: "#e8e6e1",
    fontSize: "15px",
    padding: "10px 14px",
    outline: "none",
    resize: "vertical",
    minHeight: "90px",
    boxSizing: "border-box",
    fontFamily: "inherit",
    lineHeight: "1.6",
  },
  select: {
    width: "100%",
    background: "#0f0f11",
    border: "1px solid #1e1e24",
    borderRadius: "8px",
    color: "#e8e6e1",
    fontSize: "15px",
    padding: "10px 14px",
    outline: "none",
    cursor: "pointer",
    fontFamily: "inherit",
    appearance: "none",
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 0",
    borderBottom: "1px solid #1e1e24",
  },
  toggleLabel: {
    fontSize: "14px",
    color: "#c4c2be",
  },
  toggleSub: {
    fontSize: "12px",
    color: "#4a4a58",
    marginTop: "2px",
  },
  toggle: {
    position: "relative",
    width: "40px",
    height: "22px",
    flexShrink: 0,
  },
  toggleInput: {
    opacity: 0,
    width: 0,
    height: 0,
    position: "absolute",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px",
  },
  statCard: {
    background: "#16161c",
    border: "1px solid #1e1e24",
    borderRadius: "10px",
    padding: "16px 20px",
  },
  statValue: {
    fontSize: "24px",
    fontWeight: "600",
    color: "#f0ede8",
    letterSpacing: "-0.02em",
    display: "block",
  },
  statLabel: {
    fontSize: "12px",
    color: "#4a4a58",
    marginTop: "4px",
    display: "block",
    letterSpacing: "0.03em",
  },
  saveBtn: {
    background: "#6ee7b7",
    color: "#0a1a12",
    border: "none",
    borderRadius: "8px",
    padding: "12px 28px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    letterSpacing: "0.02em",
    transition: "opacity 0.15s, transform 0.1s",
    fontFamily: "inherit",
  },
  saveBtnDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  loadingWrap: {
    minHeight: "100vh",
    background: "#0f0f11",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#4a4a58",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
    letterSpacing: "0.08em",
  },
  errorWrap: {
    minHeight: "100vh",
    background: "#0f0f11",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: "12px",
    color: "#e57070",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "14px",
  },
  retryBtn: {
    background: "transparent",
    border: "1px solid #2a2a34",
    borderRadius: "6px",
    color: "#6b6b7a",
    padding: "8px 18px",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "13px",
  },
  selectWrap: {
    position: "relative",
  },
  selectArrow: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    color: "#4a4a58",
    fontSize: "12px",
  },
  saveRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginTop: "40px",
  },
  savedMsg: {
    fontSize: "13px",
    color: "#6ee7b7",
    opacity: 0,
    transition: "opacity 0.3s",
  },
};

function Toggle({ checked, onChange }) {
  const trackStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: checked ? "#6ee7b7" : "#1e1e24",
    borderRadius: "11px",
    transition: "background 0.2s",
    cursor: "pointer",
  };
  const thumbStyle = {
    position: "absolute",
    width: "16px",
    height: "16px",
    borderRadius: "50%",
    background: checked ? "#0a1a12" : "#4a4a58",
    top: "3px",
    left: checked ? "21px" : "3px",
    transition: "left 0.2s, background 0.2s",
  };
  return (
    <div style={styles.toggle}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={styles.toggleInput}
      />
      <div style={trackStyle} onClick={onChange}>
        <div style={thumbStyle} />
      </div>
    </div>
  );
}

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/profile/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProfile(res.data);
    } catch (err) {
      console.error(err);
      setError("Couldn't load your profile. Check that the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem("token");
      await axios.put("http://127.0.0.1:8000/profile/update", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      alert("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const set = (key, val) => setProfile((p) => ({ ...p, [key]: val }));

  if (loading) {
    return (
      <div style={styles.loadingWrap}>
        <span>Loading profile…</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={styles.errorWrap}>
        <span>{error || "Profile not found."}</span>
        <button style={styles.retryBtn} onClick={fetchProfile}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerDot} />
        <span style={styles.headerTitle}>Profile Settings</span>
      </div>

      <div style={styles.layout}>
        {/* Hero */}
        <div style={styles.hero}>
          <h1 style={styles.heroName}>{profile.name || "Your Profile"}</h1>
          <p style={styles.heroBio}>
            {profile.bio || "No bio set yet."}
          </p>
        </div>

        {/* Personal */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>
            Personal
            <div style={styles.sectionLine} />
          </div>
          <div style={styles.card}>
            <div style={styles.field}>
              <label style={styles.label}>Display name</label>
              <input
                style={styles.input}
                value={profile.name || ""}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Your name"
                onFocus={(e) => (e.target.style.borderColor = "#6ee7b7")}
                onBlur={(e) => (e.target.style.borderColor = "#1e1e24")}
              />
            </div>
            <div style={styles.fieldLast}>
              <label style={styles.label}>Bio</label>
              <textarea
                style={styles.textarea}
                value={profile.bio || ""}
                onChange={(e) => set("bio", e.target.value)}
                placeholder="A short bio about you…"
                onFocus={(e) => (e.target.style.borderColor = "#6ee7b7")}
                onBlur={(e) => (e.target.style.borderColor = "#1e1e24")}
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>
            Security
            <div style={styles.sectionLine} />
          </div>
          <div style={styles.card}>
            <div style={styles.toggleRow}>
              <div>
                <div style={styles.toggleLabel}>Enable decoy UI</div>
                <div style={styles.toggleSub}>
                  Show a disguised interface when triggered
                </div>
              </div>
              <Toggle
                checked={!!profile.decoy_enabled}
                onChange={() => set("decoy_enabled", !profile.decoy_enabled)}
              />
            </div>

            <div style={{ ...styles.toggleRow, borderBottom: "none" }}>
              <div style={{ flex: 1, marginRight: "24px" }}>
                <div style={styles.toggleLabel}>Decoy UI type</div>
                <div style={styles.toggleSub}>
                  Interface shown when decoy is active
                </div>
              </div>
              <div style={{ ...styles.selectWrap, minWidth: "160px" }}>
                <select
                  style={{
                    ...styles.select,
                    opacity: profile.decoy_enabled ? 1 : 0.4,
                  }}
                  value={profile.decoy_ui || "calculator"}
                  onChange={(e) => set("decoy_ui", e.target.value)}
                  disabled={!profile.decoy_enabled}
                >
                  <option value="calculator">Calculator</option>
                  <option value="notes">Notes</option>
                  <option value="weather">Weather</option>
                </select>
                <span style={styles.selectArrow}>▾</span>
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid #1e1e24",
                paddingTop: "20px",
                marginTop: "4px",
              }}
            >
              <label style={styles.label}>Secret key</label>
              <input
                style={styles.input}
                type="password"
                value={profile.secret_key || ""}
                onChange={(e) => set("secret_key", e.target.value)}
                placeholder="Enter secret key"
                onFocus={(e) => (e.target.style.borderColor = "#6ee7b7")}
                onBlur={(e) => (e.target.style.borderColor = "#1e1e24")}
              />
            </div>
          </div>
        </div>

        {/* Analytics */}
        <div style={styles.section}>
          <div style={styles.sectionLabel}>
            Analytics
            <div style={styles.sectionLine} />
          </div>
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <span style={styles.statValue}>
                {profile.upload_count ?? "—"}
              </span>
              <span style={styles.statLabel}>Photos uploaded</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statValue}>
                {profile.guardian_count ?? "—"}
              </span>
              <span style={styles.statLabel}>Guardian contacts</span>
            </div>
            <div style={styles.statCard}>
              <span style={styles.statValue}>
                {profile.takedown_reports ?? "—"}
              </span>
              <span style={styles.statLabel}>Takedown reports</span>
            </div>
          </div>
        </div>

        {/* Save */}
        <div style={styles.saveRow}>
          <button
            style={{
              ...styles.saveBtn,
              ...(saving ? styles.saveBtnDisabled : {}),
            }}
            onClick={saveProfile}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          <span
            style={{
              ...styles.savedMsg,
              opacity: saved ? 1 : 0,
            }}
          >
            ✓ Saved
          </span>
        </div>
      </div>
    </div>
  );
}
