import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { SUPPORT_FAQS, SUPPORT_RESOURCES, SUPPORT_CONTACTS } from "../utils/data";

export default function SupportHub() {
  const t = useTheme();
  const [activeTab, setActiveTab] = useState("faqs");
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [expandedResource, setExpandedResource] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const tabStyle = (tab) => ({
    padding: "10px 16px",
    border: "none",
    background: activeTab === tab ? `${t.green}20` : "transparent",
    borderBottom: activeTab === tab ? `2px solid ${t.green}` : `2px solid ${t.border}`,
    color: activeTab === tab ? t.green : t.textDim,
    cursor: "pointer",
    fontSize: 12,
    fontWeight: activeTab === tab ? 600 : 400,
    letterSpacing: 0.5,
    transition: "all 0.2s",
  });

  const handleFeedbackSubmit = () => {
    if (feedback.trim()) {
      setFeedbackSubmitted(true);
      setFeedback("");
      setTimeout(() => setFeedbackSubmitted(false), 3000);
    }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      {/* Tab Navigation */}
      <div style={{ display: "flex", gap: 0, marginBottom: 32 }}>
        <button onClick={() => setActiveTab("faqs")} style={tabStyle("faqs")}>
          ❓ FAQs
        </button>
        <button onClick={() => setActiveTab("resources")} style={tabStyle("resources")}>
          📚 Learning Resources
        </button>
        <button onClick={() => setActiveTab("contacts")} style={tabStyle("contacts")}>
          ☎ Contact & Support
        </button>
      </div>

      {/* FAQs Tab */}
      {activeTab === "faqs" && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: t.textDim, fontSize: 12, lineHeight: 1.6 }}>
              Find answers to common questions about using the platform. If you can't find what you're looking for, reach out to our support team.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {SUPPORT_FAQS.map((faq, idx) => (
              <div
                key={idx}
                style={{
                  border: `1px solid ${t.green}`,
                  borderRadius: 6,
                  overflow: "hidden",
                  background: t.dark ? "#061228" : "#ffffff",
                  boxShadow: `0 0 12px ${t.green}15`,
                }}
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    color: t.text,
                    fontSize: 13,
                    fontWeight: 500,
                    textAlign: "left",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ color: t.green, fontSize: 14 }}>
                    {expandedFaq === idx ? "▼" : "▶"}
                  </span>
                  {faq.question}
                </button>
                {expandedFaq === idx && (
                  <div style={{ padding: "0 16px 14px", borderTop: `1px solid ${t.border}`, color: t.textDim, fontSize: 12, lineHeight: 1.6 }}>
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Resources Tab */}
      {activeTab === "resources" && (
        <div>
          <div style={{ marginBottom: 24 }}>
            <p style={{ color: t.textDim, fontSize: 12, lineHeight: 1.6 }}>
              Learn how to protect yourself online with curated resources, guides, and expert tips.
            </p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {SUPPORT_RESOURCES.map((resource, idx) => (
              <div
                key={idx}
                style={{
                  border: `1px solid ${t.green}`,
                  borderRadius: 6,
                  padding: 16,
                  background: t.dark ? "#061228" : "#f9fafb",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  boxShadow: `0 0 12px ${t.green}15`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = t.green;
                  e.currentTarget.style.boxShadow = `0 0 16px ${t.green}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${t.green}`;
                  e.currentTarget.style.boxShadow = `0 0 12px ${t.green}15`;
                }}
              >
                <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 18 }}>{resource.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>
                      {resource.title}
                    </div>
                    <div style={{ fontSize: 10, color: t.green, marginTop: 4 }}>
                      {resource.category}
                    </div>
                  </div>
                </div>
                <div style={{ color: t.textDim, fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>
                  {resource.description}
                </div>
                <button
                  onClick={() => setExpandedResource(expandedResource === idx ? null : idx)}
                  style={{
                    background: `${t.green}20`,
                    color: t.green,
                    border: `1px solid ${t.green}`,
                    padding: "6px 12px",
                    borderRadius: 4,
                    fontSize: 11,
                    cursor: "pointer",
                    fontWeight: 500,
                    transition: "all 0.2s",
                  }}
                >
                  {expandedResource === idx ? "Hide Details" : "Learn More"}
                </button>
                {expandedResource === idx && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${t.border}`, fontSize: 12, color: t.textDim, lineHeight: 1.6 }}>
                    {resource.details}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact & Support Tab */}
      {activeTab === "contacts" && (
        <div>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: t.text }}>
              📞 Direct Contact Channels
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              {SUPPORT_CONTACTS.map((contact, idx) => (
                <div
                  style={{
                    border: `1px solid ${t.green}`,
                    borderRadius: 6,
                    padding: 16,
                    background: t.dark ? "#061228" : "#f9fafb",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    boxShadow: `0 0 12px ${t.green}15`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = t.green;
                    e.currentTarget.style.boxShadow = `0 0 16px ${t.green}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${t.green}`;
                    e.currentTarget.style.boxShadow = `0 0 12px ${t.green}15`;
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{contact.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: t.text }}>
                    {contact.label}
                  </div>
                  <div style={{ fontSize: 11, color: t.textDim, marginBottom: 8 }}>
                    {contact.description}
                  </div>
                  <a
                    href={contact.link}
                    target={contact.external ? "_blank" : "_self"}
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-block",
                      background: `${t.green}20`,
                      color: t.green,
                      padding: "6px 12px",
                      borderRadius: 4,
                      fontSize: 10,
                      textDecoration: "none",
                      fontWeight: 500,
                      transition: "all 0.2s",
                      border: `1px solid ${t.green}`,
                    }}
                  >
                    {contact.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Resources */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 16, color: t.text }}>
              🚨 Emergency Resources
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ background: `#d63031${t.dark ? "20" : "10"}`, border: `2px solid ${t.dark ? "#d63031" : "#d63031"}`, borderRadius: 6, padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#d63031", marginBottom: 4 }}>
                  🆘 National Emergency Numbers
                </div>
                <div style={{ fontSize: 11, color: t.textDim, lineHeight: 1.6 }}>
                  <div>Police: 100</div>
                  <div>Women's Helpline: 1091</div>
                  <div>Cyber Crime: 1930</div>
                  <div>Sexual Assault: 181</div>
                </div>
              </div>
              <div style={{ background: `#fdcb6e${t.dark ? "20" : "10"}`, border: `2px solid ${t.dark ? "#fdcb6e" : "#fdcb6e"}`, borderRadius: 6, padding: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#e8b71a", marginBottom: 4 }}>
                  ⚠ Crisis Text Line
                </div>
                <div style={{ fontSize: 11, color: t.textDim, lineHeight: 1.6 }}>
                  Text "SAFETY" to 741741 for 24/7 crisis support
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Form */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: `2px solid ${t.green}` }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: t.text }}>
              💬 Send Us Your Feedback
            </div>
            <div style={{ marginBottom: 12 }}>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Help us improve by sharing your thoughts, suggestions, or concerns..."
                style={{
                  width: "100%",
                  minHeight: 100,
                  padding: 12,
                  border: `1px solid ${t.green}`,
                  borderRadius: 6,
                  background: t.dark ? "#0a0e17" : "#f9fafb",
                  color: t.text,
                  fontSize: 12,
                  fontFamily: "'Courier New', monospace",
                  resize: "vertical",
                  outline: "none",
                  boxShadow: `0 0 12px ${t.green}15`,
                  transition: "all 0.2s",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = t.green;
                  e.currentTarget.style.boxShadow = `0 0 16px ${t.green}30`;
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = `${t.green}40`;
                  e.currentTarget.style.boxShadow = `0 0 12px ${t.green}15`;
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button
                onClick={handleFeedbackSubmit}
                disabled={!feedback.trim()}
                style={{
                  padding: "8px 16px",
                  background: feedback.trim() ? t.green : `${t.green}40`,
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: feedback.trim() ? "pointer" : "not-allowed",
                  transition: "all 0.2s",
                  opacity: feedback.trim() ? 1 : 0.5,
                }}
              >
                📤 Submit Feedback
              </button>
              {feedbackSubmitted && (
                <div style={{ fontSize: 11, color: t.green }}>
                  ✓ Thank you for your feedback!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
