import { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Lock, FileText, CheckCircle, XCircle } from "lucide-react";
import Toggle from "../components/Toggle";
import { useToast } from "../context/ToastContext";

const API = "http://127.0.0.1:8000";
const MINT = "#2dd4bf";

export default function Settings() {
  const { showToast } = useToast();
  const token = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("stealth");
  const [stealthEnabled, setStealthEnabled] = useState(false);
  const [stealthLevel, setStealthLevel] = useState(1);
  const [decoySkin, setDecoySkin] = useState("calculator");
  const [newSecretKey, setNewSecretKey] = useState("");
  const [stealthSaving, setStealthSaving] = useState(false);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => { fetchStealth(); }, []);
  useEffect(() => { if (activeTab === "logs") fetchLogs(); }, [activeTab]);

  const fetchStealth = async () => {
    try {
      const res = await axios.get(`${API}/auth/stealth`, { headers: { Authorization: `Bearer ${token}` } });
      setStealthEnabled(res.data.stealth_enabled);
      setStealthLevel(res.data.stealth_level);
      setDecoySkin(res.data.decoy_skin);
    } catch (e) { console.error(e); }
  };

  const saveStealth = async () => {
    setStealthSaving(true);
    try {
      const payload = { stealth_enabled: stealthEnabled, stealth_level: stealthLevel, decoy_skin: decoySkin };
      if (newSecretKey) payload.new_secret_key = newSecretKey;
      const res = await axios.post(`${API}/auth/stealth`, payload, { headers: { Authorization: `Bearer ${token}` } });
      localStorage.setItem("stealth_mode", res.data.stealth_enabled);
      localStorage.setItem("stealth_level", res.data.stealth_level);
      localStorage.setItem("stealth_skin", res.data.decoy_skin);
      setNewSecretKey("");
      showToast("Stealth protocols updated.", "success");
    } catch {
      showToast("Failed to save stealth settings.", "alert");
    } finally {
      setStealthSaving(false);
    }
  };

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await axios.get(`${API}/auth/logs`, { headers: { Authorization: `Bearer ${token}` } });
      setLogs(res.data);
    } catch (e) { console.error(e); }
    finally { setLogsLoading(false); }
  };

  const tabs = [
    { id: "stealth", label: "Stealth Protocols", icon: Lock },
    { id: "logs", label: "Access Logs", icon: FileText },
  ];

  const inputClass = "w-full px-4 py-3.5 rounded-lg bg-[#121c2a] text-slate-200 border border-white/10 mono text-sm focus:border-[#2dd4bf]/50 focus:outline-none transition-colors";
  const labelClass = "block text-[11px] mono text-[#2dd4bf] font-bold italic tracking-widest mb-4";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-10 max-w-2xl">

      {/* Tabs */}
      <div className="flex flex-wrap gap-4 border-b border-white/5 pb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-lg mono text-xs tracking-widest font-semibold border transition-colors ${
                active
                  ? "border-[#2dd4bf]/40 bg-[#2dd4bf]/10 text-[#2dd4bf]"
                  : "border-white/5 text-slate-500 hover:text-slate-300"
              }`}
              whileTap={{ scale: 0.98 }}
            >
              <Icon size={16} />
              {tab.label.toUpperCase()}
            </motion.button>
          );
        })}
      </div>

      {/* Stealth tab */}
      {activeTab === "stealth" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card glass-card-mint p-10 md:p-14"
        >
          <h2 className="text-lg font-bold text-[#2dd4bf] tracking-wide mb-10 mono">
            STEALTH PROTOCOLS
          </h2>

          {/* Stealth mode toggle row */}
          <div className="flex items-center justify-between mb-12 p-6 rounded-xl bg-white/[0.02] border border-white/5 gap-6">
            <div>
              <p className="text-sm font-semibold text-white">Stealth Mode</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Hide SHIELD.AI behind a decoy application
              </p>
            </div>
            <Toggle value={stealthEnabled} onChange={setStealthEnabled} activeColor={MINT} />
          </div>

          {stealthEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-0"
            >
              {/* Security level */}
              <div className="mb-20">
                <label className={labelClass}>SECURITY LEVEL</label>
                <select
                  value={stealthLevel}
                  onChange={(e) => setStealthLevel(Number(e.target.value))}
                  className={inputClass}
                >
                  <option value={1}>Level 1 — Standard login</option>
                  <option value={2}>Level 2 (Hidden) — Decoy unlocks normal login</option>
                  <option value={3}>Level 3 (Hidden) — Decoy unlocks biometric verify</option>
                </select>
              </div>

              {(stealthLevel === 2 || stealthLevel === 3) && (
                <>
                  {/* Decoy skin */}
                  <div className="mb-20">
                    <label className={labelClass}>DECOY SKIN</label>
                    <select
                      value={decoySkin}
                      onChange={(e) => setDecoySkin(e.target.value)}
                      className={inputClass}
                    >
                      <option value="calculator">Calculator App</option>
                      <option value="weather">Weather App</option>
                      <option value="notes">Notes App</option>
                      <option value="news">News Reader</option>
                    </select>
                  </div>

                  {/* Secret decoy key */}
                  <div className="mb-10">
                    <label className={labelClass}>SECRET DECOY KEY</label>
                    <input
                      type="password"
                      placeholder="Leave blank to keep current key"
                      value={newSecretKey}
                      onChange={(e) => setNewSecretKey(e.target.value)}
                      className={inputClass}
                    />
                    <p className="text-[11px] text-slate-600 mt-3 leading-relaxed">
                      {decoySkin === "calculator"
                        ? "For Calculator: Type key and press =."
                        : decoySkin === "weather" || decoySkin === "news"
                        ? "Weather/News: search bar"
                        : "Notes: title/body + save"}
                    </p>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Save button */}
          <motion.button
            type="button"
            onClick={saveStealth}
            disabled={stealthSaving}
            className="mt-6 mono text-xs tracking-widest px-8 py-3.5 rounded-md bg-[#2dd4bf] text-[#0a111a] font-bold disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {stealthSaving ? "SAVING…" : "SAVE PROTOCOLS"}
          </motion.button>
        </motion.div>
      )}

      {/* Logs tab */}
      {activeTab === "logs" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-10 md:p-14 overflow-x-auto"
        >
          <h2 className="text-lg font-bold text-[#2dd4bf] tracking-wide mb-10 mono">
            ACCESS LOGS
          </h2>

          {logsLoading ? (
            <p className="text-slate-500 mono text-sm animate-pulse">Loading logs…</p>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-500 mono text-xs tracking-wider text-left">
                  <th className="pb-5 px-3">Timestamp</th>
                  <th className="pb-5 px-3">Event</th>
                  <th className="pb-5 px-3">Status</th>
                  <th className="pb-5 px-3">IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-white/5"
                  >
                    <td className="py-5 px-3 text-slate-400 mono text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-5 px-3 text-slate-300">{log.event_type}</td>
                    <td className={`py-5 px-3 ${log.status === "success" ? "text-[#2dd4bf]" : "text-rose-500"}`}>
                      <span className="flex items-center gap-1.5">
                        {log.status === "success" ? <CheckCircle size={14} /> : <XCircle size={14} />}
                        {log.status}
                      </span>
                    </td>
                    <td className="py-5 px-3 text-slate-500 mono text-xs">
                      {log.ip_address || "Unknown"}
                    </td>
                  </motion.tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-600 mono text-sm">
                      No access logs found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}