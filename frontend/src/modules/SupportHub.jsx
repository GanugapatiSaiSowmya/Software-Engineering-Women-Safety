import { useState } from "react";
import { HelpCircle, BookOpen, Headset, ChevronDown, ChevronRight, MessageSquare, AlertTriangle, Phone, AlertCircle, CheckCircle } from "lucide-react";
import { SUPPORT_FAQS, SUPPORT_RESOURCES, SUPPORT_CONTACTS } from "../utils/data";

export default function SupportHub() {
  const [activeTab, setActiveTab] = useState("faqs");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [expandedResource, setExpandedResource] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const handleFeedbackSubmit = () => {
    if (feedback.trim()) {
      setFeedbackSubmitted(true);
      setFeedback("");
      setTimeout(() => setFeedbackSubmitted(false), 3000);
    }
  };

  const getTabIcon = (id) => {
    switch (id) {
      case "faqs": return <HelpCircle size={16} />;
      case "resources": return <BookOpen size={16} />;
      case "contacts": return <Headset size={16} />;
      default: return null;
    }
  };

  return (
    <div style={{ maxWidth: 900, paddingBottom: 40 }}>
      {/* Segmented Tab Navigation */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32, background: "var(--bg-navy-light)", padding: 6, borderRadius: 12, border: "1px solid var(--slate-800)" }}>
        {[
          { id: "faqs", label: "INTEL & FAQs" },
          { id: "resources", label: "TACTICAL RESOURCES" },
          { id: "contacts", label: "DIRECT COMMS" }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1, padding: "12px", border: "none", borderRadius: 8,
                background: isActive ? "var(--neon-teal-dim)" : "transparent",
                color: isActive ? "var(--neon-teal)" : "var(--slate-400)",
                fontSize: 13, fontWeight: isActive ? 700 : 500, letterSpacing: 1,
                cursor: "pointer", transition: "all 0.3s ease",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: isActive ? "0 0 15px rgba(0, 255, 204, 0.15)" : "none"
              }}
            >
              {getTabIcon(tab.id)}
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="glass-card" style={{ padding: 32 }}>
        {/* FAQs Tab */}
        {activeTab === "faqs" && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px dashed var(--slate-800)" }}>
              <div style={{ fontSize: 18, color: "#fff", fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <HelpCircle size={20} color="var(--neon-teal)" />
                KNOWLEDGE BASE
              </div>
              <p style={{ color: "var(--slate-400)", fontSize: 13, lineHeight: 1.6, maxWidth: 600 }}>
                Access intelligence reports and common platform queries. If your query is not listed, proceed to DIRECT COMMS.
              </p>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {SUPPORT_FAQS.map((faq, idx) => {
                const isExpanded = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    style={{
                      border: `1px solid ${isExpanded ? "var(--neon-teal)" : "var(--slate-800)"}`,
                      borderRadius: 8, background: isExpanded ? "var(--bg-navy-light)" : "transparent",
                      transition: "all 0.3s ease", overflow: "hidden"
                    }}
                  >
                    <button
                      onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                      style={{
                        width: "100%", padding: "16px 20px", background: "transparent", border: "none",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
                        color: isExpanded ? "#fff" : "var(--slate-300)", fontSize: 14, fontWeight: isExpanded ? 600 : 500,
                        textAlign: "left", transition: "all 0.2s"
                      }}
                      onMouseEnter={e => !isExpanded && (e.currentTarget.style.color = "#fff")}
                      onMouseLeave={e => !isExpanded && (e.currentTarget.style.color = "var(--slate-300)")}
                    >
                      {faq.question}
                      {isExpanded ? <ChevronDown size={18} color="var(--neon-teal)" /> : <ChevronRight size={18} color="var(--slate-500)" />}
                    </button>
                    {isExpanded && (
                      <div className="animate-fade-in" style={{ padding: "0 20px 20px", color: "var(--slate-400)", fontSize: 13, lineHeight: 1.7 }}>
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Learning Resources Tab */}
        {activeTab === "resources" && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: 24, paddingBottom: 24, borderBottom: "1px dashed var(--slate-800)" }}>
              <div style={{ fontSize: 18, color: "#fff", fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                <BookOpen size={20} color="var(--neon-teal)" />
                TACTICAL RESOURCES
              </div>
              <p style={{ color: "var(--slate-400)", fontSize: 13, lineHeight: 1.6, maxWidth: 600 }}>
                Equip yourself with advanced protocols and strategies to maintain digital security and operational integrity.
              </p>
            </div>
            
            <div style={{ display: "grid", gap: 16 }}>
              {SUPPORT_RESOURCES.map((resource, idx) => {
                const isExpanded = expandedResource === idx;
                return (
                  <div
                    key={idx}
                    className="glass-card"
                    style={{
                      border: `1px solid ${isExpanded ? "var(--neon-teal)" : "var(--slate-800)"}`,
                      padding: 20, cursor: "pointer", transition: "all 0.3s",
                      background: isExpanded ? "var(--neon-teal-dim)" : "var(--bg-navy-light)"
                    }}
                    onClick={() => setExpandedResource(isExpanded ? null : idx)}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--neon-teal)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = isExpanded ? "var(--neon-teal)" : "var(--slate-800)"; }}
                  >
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ fontSize: 24, padding: 12, background: "rgba(0,0,0,0.2)", borderRadius: 8, height: "fit-content" }}>
                        {resource.icon}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>{resource.title}</div>
                          <div className="mono" style={{ fontSize: 10, color: "var(--neon-teal)", padding: "4px 8px", border: "1px solid var(--neon-teal)", borderRadius: 4, letterSpacing: 1 }}>
                            {resource.category.toUpperCase()}
                          </div>
                        </div>
                        <div style={{ color: "var(--slate-400)", fontSize: 13, lineHeight: 1.6 }}>
                          {resource.description}
                        </div>
                        
                        {isExpanded && (
                          <div className="animate-fade-in" style={{ marginTop: 16, paddingTop: 16, borderTop: "1px dashed var(--slate-700)", fontSize: 13, color: "var(--slate-300)", lineHeight: 1.7 }}>
                            {resource.details}
                          </div>
                        )}
                        
                        <div style={{ marginTop: 12, fontSize: 12, color: "var(--neon-teal)", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
                          {isExpanded ? "CLOSE BRIEFING" : "EXPAND BRIEFING"} {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Contact & Support Tab */}
        {activeTab === "contacts" && (
          <div className="animate-fade-in">
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, marginBottom: 20, color: "var(--neon-teal)", display: "flex", alignItems: "center", gap: 8 }}>
                <Headset size={18} /> DIRECT COMMS CHANNELS
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {SUPPORT_CONTACTS.map((contact, idx) => (
                  <a
                    key={idx}
                    href={contact.link}
                    target={contact.external ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    className="glass-card"
                    style={{
                      padding: 20, textDecoration: "none", transition: "all 0.3s",
                      display: "flex", flexDirection: "column", gap: 12
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--neon-teal)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{ fontSize: 24 }}>{contact.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{contact.label}</div>
                      <div style={{ fontSize: 12, color: "var(--slate-400)", lineHeight: 1.5, marginBottom: 16 }}>{contact.description}</div>
                    </div>
                    <div className="mono" style={{ fontSize: 11, color: "var(--neon-teal)", fontWeight: 700, marginTop: "auto" }}>
                      &gt; {contact.cta.toUpperCase()}
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Emergency Resources */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, marginBottom: 20, color: "var(--danger-red)", display: "flex", alignItems: "center", gap: 8 }}>
                <AlertCircle size={18} /> EMERGENCY PROTOCOLS
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div className="glass-card-red" style={{ padding: 20, background: "var(--danger-red-dim)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--danger-red)", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
                    <Phone size={16} /> NATIONAL EMERGENCY LINES
                  </div>
                  <div className="mono" style={{ fontSize: 12, color: "var(--slate-300)", lineHeight: 2 }}>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Police:</span><span style={{ color: "var(--danger-red)", fontWeight: 600 }}>100</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Women's Helpline:</span><span style={{ color: "var(--danger-red)", fontWeight: 600 }}>1091</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Cyber Crime:</span><span style={{ color: "var(--danger-red)", fontWeight: 600 }}>1930</span></div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}><span>Sexual Assault:</span><span style={{ color: "var(--danger-red)", fontWeight: 600 }}>181</span></div>
                  </div>
                </div>
                
                <div className="glass-card" style={{ padding: 20, border: "1px solid var(--warning-orange)", background: "rgba(255, 153, 0, 0.05)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--warning-orange)", fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
                    <AlertTriangle size={16} /> CRISIS TEXT LINE
                  </div>
                  <div style={{ fontSize: 13, color: "var(--slate-300)", lineHeight: 1.6 }}>
                    For 24/7 covert crisis support:
                  </div>
                  <div className="mono" style={{ marginTop: 12, padding: 12, background: "rgba(0,0,0,0.3)", borderRadius: 6, color: "var(--warning-orange)", textAlign: "center", fontSize: 14 }}>
                    Text "SAFETY" to 741741
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Form */}
            <div style={{ paddingTop: 32, borderTop: "1px dashed var(--slate-800)" }}>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: 1, marginBottom: 16, color: "#fff", display: "flex", alignItems: "center", gap: 8 }}>
                <MessageSquare size={18} color="var(--neon-teal)" /> TRANSMIT FEEDBACK
              </div>
              
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Submit operational feedback or bug reports..."
                className="mono"
                style={{
                  width: "100%", height: 120, padding: 16, borderRadius: 8, border: "1px solid var(--slate-700)",
                  background: "var(--bg-navy-light)", color: "var(--neon-teal)", fontSize: 13, resize: "vertical", outline: "none",
                  marginBottom: 16, transition: "border 0.3s"
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = "var(--neon-teal)"}
                onBlur={(e) => e.currentTarget.style.borderColor = "var(--slate-700)"}
              />
              
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button
                  onClick={handleFeedbackSubmit}
                  disabled={!feedback.trim()}
                  style={{
                    padding: "12px 24px", borderRadius: 6, background: "var(--neon-teal)", color: "var(--bg-navy)",
                    border: "none", fontSize: 13, fontWeight: 700, letterSpacing: 1, cursor: feedback.trim() ? "pointer" : "not-allowed",
                    opacity: feedback.trim() ? 1 : 0.5, transition: "all 0.2s"
                  }}
                >
                  TRANSMIT
                </button>
                {feedbackSubmitted && (
                  <div className="animate-fade-in mono" style={{ fontSize: 12, color: "var(--neon-teal)", display: "flex", alignItems: "center", gap: 8 }}>
                    <CheckCircle size={16} /> TRANSMISSION SUCCESSFUL
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
