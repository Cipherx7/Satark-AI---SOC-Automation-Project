"use client";

import { useState, useEffect } from "react";

/* ── Types ── */
interface Recommendation {
  action: string;
  priority: number;
}

interface Alert {
  alert_id: string;
  severity: string;
  category: string;
  confidence: number;
  summary: string;
  is_true_positive: boolean;
  ml_prediction: string;
  ml_confidence: number;
  mitre_techniques: string[];
  recommendations: Recommendation[];
}

/* ── Hexagon SVG ── */
function Hexagon({
  size,
  fill,
  opacity,
  className,
  style,
}: {
  size: number;
  fill: string;
  opacity: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const points = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    points.push(
      `${size / 2 + (size / 2) * Math.cos(angle)},${size / 2 + (size / 2) * Math.sin(angle)}`
    );
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={className} style={style}>
      <polygon points={points.join(" ")} fill={fill} opacity={opacity} />
    </svg>
  );
}

/* ── Confidence Ring ── */
function ConfidenceRing({ value, label, color }: { value: number; label: string; color: string }) {
  const pct = Math.round(value * 100);
  const offset = 283 - (283 * pct) / 100;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="confidence-ring">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" className="ring-bg" />
          <circle cx="50" cy="50" r="45" className="ring-fill" stroke={color} style={{ strokeDashoffset: offset }} />
        </svg>
        <span className="ring-label">{pct}%</span>
      </div>
      <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--gray-600)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {label}
      </span>
    </div>
  );
}

/* ── Helpers ── */
function sevBadge(s: string) {
  switch (s.toLowerCase()) {
    case "critical": return "badge-critical";
    case "high": return "badge-high";
    case "medium": return "badge-medium";
    case "low": return "badge-low";
    default: return "badge-info";
  }
}
function sevIcon(s: string) {
  switch (s.toLowerCase()) {
    case "critical": return "🔥";
    case "high": return "🔴";
    case "medium": return "🟡";
    case "low": return "🟢";
    default: return "🔵";
  }
}
function sevOrder(s: string) {
  switch (s.toLowerCase()) {
    case "critical": return 0;
    case "high": return 1;
    case "medium": return 2;
    case "low": return 3;
    default: return 4;
  }
}
function prioClass(p: number) {
  return p === 1 ? "p1" : p === 2 ? "p2" : "p3";
}
function prioLabel(p: number) {
  return p === 1 ? "Critical" : p === 2 ? "High" : "Medium";
}
function categoryLabel(c: string) {
  return c.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

/* ── MITRE technique name lookup ── */
function mitreName(t: string) {
  const map: Record<string, string> = {
    "T1110.001": "Brute Force: Password Guessing",
    "T1059.004": "Command & Scripting: Unix Shell",
    "T1486": "Data Encrypted for Impact",
    "T1078": "Valid Accounts",
    "T1078.003": "Valid Accounts: Local Accounts",
    "T1048.003": "Exfiltration Over Alternative Protocol: DNS",
    "T1071.004": "Application Layer Protocol: DNS",
    "T1068": "Exploitation for Privilege Escalation",
    "T1548.001": "Abuse Elevation Control: Setuid/Setgid",
    "T1046": "Network Service Discovery",
  };
  return map[t] || t;
}

/* ════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════ */
export default function Home() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selected, setSelected] = useState<Alert | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/alerts")
      .then((r) => r.json())
      .then((data) => {
        const arr = Array.isArray(data) ? data : [data];
        arr.sort((a: Alert, b: Alert) => sevOrder(a.severity) - sevOrder(b.severity));
        setAlerts(arr);
      })
      .catch(() => { })
      .finally(() => setLoaded(true));
  }, []);

  /* ── counts for stat bar ── */
  const countBySev = (s: string) => alerts.filter((a) => a.severity.toLowerCase() === s).length;

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* ═══ HERO ═══ */}
      <header style={{ position: "relative", overflow: "hidden", background: "linear-gradient(180deg, var(--softbg) 0%, var(--white) 100%)", paddingBottom: "40px" }}>
        {/* Floating hexagons */}
        <Hexagon size={80} fill="#F5B800" opacity={0.25} className="hex" style={{ top: 30, left: "5%", animationDelay: "0s" }} />
        <Hexagon size={50} fill="#1E5BFF" opacity={0.2} className="hex-reverse" style={{ top: 60, left: "15%", animationDelay: "1s" }} />
        <Hexagon size={120} fill="#0F2B46" opacity={0.08} className="hex" style={{ top: 20, right: "8%", animationDelay: "2s" }} />
        <Hexagon size={40} fill="#F5B800" opacity={0.35} className="hex-reverse" style={{ top: 100, right: "20%", animationDelay: "0.5s" }} />
        <Hexagon size={65} fill="#1E5BFF" opacity={0.12} className="hex" style={{ top: 10, left: "45%", animationDelay: "3s" }} />
        <Hexagon size={35} fill="#0F2B46" opacity={0.15} className="hex-reverse" style={{ top: 120, left: "70%", animationDelay: "1.5s" }} />

        {/* Nav */}
        <nav style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px 48px", maxWidth: 1300, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }} onClick={() => setSelected(null)}>
            <svg width="36" height="36" viewBox="0 0 36 36">
              <polygon points="18,2 32,10 32,26 18,34 4,26 4,10" fill="#F5B800" stroke="#0F2B46" strokeWidth="2" />
              <text x="18" y="22" textAnchor="middle" fill="#0F2B46" fontWeight="800" fontSize="14" fontFamily="Inter, sans-serif">S</text>
            </svg>
            <span style={{ fontSize: 20, fontWeight: 800, color: "var(--navy)", letterSpacing: "-0.02em" }}>
              SOC<span style={{ color: "var(--primary)" }}>Alert</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {selected && (
              <button className="btn-pill btn-primary" style={{ padding: "10px 24px", fontSize: 14 }} onClick={() => setSelected(null)}>
                ← All Alerts
              </button>
            )}
            <button className="btn-pill btn-navy" style={{ padding: "10px 24px", fontSize: 14 }}>
              🔔 Live Alerts
            </button>
          </div>
        </nav>

        {/* Hero text */}
        {!selected && (
          <div className={loaded ? "animate-slide-up" : ""} style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "24px 24px 0", maxWidth: 800, margin: "0 auto", opacity: loaded ? undefined : 0 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "var(--white)", padding: "8px 20px", borderRadius: 999, fontSize: 13, fontWeight: 600, color: "var(--gray-600)", boxShadow: "var(--shadow-sm)", border: "1px solid var(--gray-200)", marginBottom: 20 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", animation: "pulse-ring 2s ease-in-out infinite" }} />
              AI-Powered Threat Intelligence
            </div>
            <h1 style={{ fontSize: "clamp(28px, 4.5vw, 48px)", fontWeight: 800, color: "var(--navy)", lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: 12 }}>
              SOC Alert Intelligence{" "}
              <span style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Dashboard</span>
            </h1>
            <p style={{ fontSize: 16, color: "var(--gray-600)", lineHeight: 1.6, maxWidth: 580, margin: "0 auto" }}>
              Real-time security event monitoring with AI-driven analysis, MITRE ATT&CK mapping, and actionable recommendations.
            </p>
          </div>
        )}
      </header>

      {/* ═══ MAIN ═══ */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px 80px", marginTop: -10, position: "relative", zIndex: 10 }}>

        {/* ── Stat Bar (hidden in detail view) ── */}
        {!selected && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Total Alerts", value: alerts.length, color: "var(--navy)", bg: "var(--white)", icon: "📊" },
              { label: "Critical", value: countBySev("critical"), color: "var(--red)", bg: "var(--red-bg)", icon: "🔥" },
              { label: "High", value: countBySev("high"), color: "#DC2626", bg: "#FEF2F2", icon: "🔴" },
              { label: "Medium", value: countBySev("medium"), color: "var(--orange)", bg: "var(--orange-bg)", icon: "🟡" },
              { label: "Low", value: countBySev("low"), color: "var(--green)", bg: "var(--green-bg)", icon: "🟢" },
            ].map((s) => (
              <div key={s.label} className="card" style={{ padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize: 12, color: "var(--gray-500)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>{s.label}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── TABLE VIEW ── */}
        {!selected && (
          <div className="card animate-slide-up" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "22px 28px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid var(--gray-200)" }}>
              <div className="section-title" style={{ marginBottom: 0 }}>All Security Alerts</div>
              <span style={{ fontSize: 13, color: "var(--gray-400)" }}>{alerts.length} alerts</span>
            </div>

            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 160px 120px 100px 80px", padding: "12px 28px", background: "var(--softbg)", borderBottom: "1px solid var(--gray-200)", fontSize: 12, fontWeight: 700, color: "var(--gray-500)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              <span>Alert ID</span>
              <span>Summary</span>
              <span>Category</span>
              <span>Severity</span>
              <span>Confidence</span>
              <span style={{ textAlign: "center" }}>Details</span>
            </div>

            {/* Rows */}
            {alerts.map((a, i) => (
              <div
                key={a.alert_id}
                onClick={() => setSelected(a)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr 160px 120px 100px 80px",
                  padding: "16px 28px",
                  alignItems: "center",
                  borderBottom: i < alerts.length - 1 ? "1px solid var(--gray-100)" : "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  background: "var(--white)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--softbg)";
                  e.currentTarget.style.transform = "scale(1.005)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--white)";
                  e.currentTarget.style.transform = "scale(1)";
                }}
              >
                <span style={{ fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: 600, color: "var(--navy)" }}>
                  {a.alert_id}
                </span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "var(--dark)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 16 }}>
                  {a.summary}
                </span>
                <span style={{ fontSize: 13, color: "var(--gray-600)" }}>
                  {categoryLabel(a.category)}
                </span>
                <span className={`badge ${sevBadge(a.severity)}`} style={{ justifySelf: "start" }}>
                  {sevIcon(a.severity)} {a.severity.toUpperCase()}
                </span>
                <span style={{ fontSize: 14, fontWeight: 700, color: a.confidence >= 0.9 ? "var(--red)" : a.confidence >= 0.7 ? "var(--orange)" : "var(--green)" }}>
                  {Math.round(a.confidence * 100)}%
                </span>
                <div style={{ textAlign: "center" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 10, background: "var(--softbg)", border: "1px solid var(--gray-200)", transition: "all 0.2s ease" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--navy)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── DETAIL VIEW ── */}
        {selected && (
          <div className="animate-slide-up">
            {/* Back button */}
            <button
              onClick={() => setSelected(null)}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "var(--gray-500)", background: "none", border: "none", cursor: "pointer", marginBottom: 20, padding: "6px 0", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--navy)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gray-500)")}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Back to All Alerts
            </button>

            {/* Alert Header */}
            <div className="card" style={{ marginBottom: 24, background: "linear-gradient(135deg, var(--navy), var(--navy-light))", color: "var(--white)", border: "none" }}>
              <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: "rgba(245,184,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🛡️</div>
                  <div>
                    <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", opacity: 0.7, marginBottom: 4 }}>Alert ID</div>
                    <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'Courier New', monospace", letterSpacing: "0.05em" }}>{selected.alert_id}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <span className={`badge ${sevBadge(selected.severity)}`}>{sevIcon(selected.severity)} {selected.severity.toUpperCase()}</span>
                  <span className="badge badge-info" style={{ background: "rgba(30,91,255,0.15)", color: "#93B4FF" }}>📁 {categoryLabel(selected.category)}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="card" style={{ marginBottom: 24 }}>
              <div className="section-title">Alert Summary</div>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: 20, background: "linear-gradient(135deg, #FFF9E6, #FFFDF5)", borderRadius: 14, border: "1px solid rgba(245,184,0,0.2)" }}>
                <div style={{ width: 44, height: 44, minWidth: 44, borderRadius: 12, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>⚡</div>
                <div>
                  <p style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.5, color: "var(--dark)", marginBottom: 8 }}>{selected.summary}</p>
                  <p style={{ fontSize: 14, color: "var(--gray-500)", lineHeight: 1.5 }}>
                    This alert was flagged as a{" "}
                    <strong style={{ color: selected.is_true_positive ? "var(--red)" : "var(--green)" }}>
                      {selected.is_true_positive ? "True Positive" : "False Positive"}
                    </strong>{" "}
                    with {Math.round(selected.confidence * 100)}% confidence. {selected.is_true_positive ? "Immediate investigation is recommended." : "Review and validate before escalation."}
                  </p>
                </div>
              </div>
            </div>

            {/* Confidence + Status */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 24 }}>
              <div className="card">
                <div className="section-title">Confidence Scores</div>
                <div style={{ display: "flex", justifyContent: "center", gap: 48, padding: "20px 0" }}>
                  <ConfidenceRing value={selected.confidence} label="Alert Confidence" color="var(--primary)" />
                  <ConfidenceRing value={selected.ml_confidence} label="ML Confidence" color="var(--royal)" />
                </div>
              </div>
              <div className="card">
                <div className="section-title">Analysis Status</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderRadius: 14, background: selected.is_true_positive ? "var(--red-bg)" : "var(--green-bg)", border: `1px solid ${selected.is_true_positive ? "rgba(239,68,68,0.2)" : "rgba(34,197,94,0.2)"}` }}>
                    <div>
                      <div style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 4 }}>True Positive</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: selected.is_true_positive ? "var(--red)" : "var(--green)" }}>
                        {selected.is_true_positive ? "⚠️ Confirmed" : "✅ Not Confirmed"}
                      </div>
                    </div>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: selected.is_true_positive ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                      {selected.is_true_positive ? "🚨" : "✅"}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderRadius: 14, background: selected.ml_prediction === "BENIGN" ? "var(--green-bg)" : "var(--red-bg)", border: `1px solid ${selected.ml_prediction === "BENIGN" ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                    <div>
                      <div style={{ fontSize: 13, color: "var(--gray-500)", marginBottom: 4 }}>ML Prediction</div>
                      <div style={{ fontSize: 18, fontWeight: 700, color: selected.ml_prediction === "BENIGN" ? "var(--green)" : "var(--red)" }}>
                        {selected.ml_prediction === "BENIGN" ? "🟢" : "🔴"} {selected.ml_prediction}
                      </div>
                    </div>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: selected.ml_prediction === "BENIGN" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                      🤖
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* MITRE + Recommendations */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 24 }}>
              <div className="card">
                <div className="section-title">MITRE ATT&CK Techniques</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 8 }}>
                  {selected.mitre_techniques.map((t) => (
                    <a key={t} href={`https://attack.mitre.org/techniques/${t.replace(".", "/")}/`} target="_blank" rel="noopener noreferrer" className="mitre-badge">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                      {t}
                      <span style={{ fontSize: 12, opacity: 0.7, marginLeft: "auto" }}>{mitreName(t)}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17l9.2-9.2M17 17V7H7" /></svg>
                    </a>
                  ))}
                </div>
              </div>
              <div className="card">
                <div className="section-title">Recommended Actions</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {selected.recommendations.map((rec, i) => (
                    <div key={i} className="rec-card">
                      <div className={`rec-number ${prioClass(rec.priority)}`}>{rec.priority}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "var(--dark)", marginBottom: 4 }}>{rec.action}</div>
                        <span className={`badge ${rec.priority === 1 ? "badge-danger" : rec.priority === 2 ? "badge-high" : "badge-info"}`} style={{ fontSize: 11, padding: "3px 10px" }}>
                          Priority: {prioLabel(rec.priority)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Raw JSON */}
            <div className="card">
              <div className="section-title">Raw Alert Data</div>
              <div style={{ background: "var(--navy)", borderRadius: 14, padding: 24, overflow: "auto" }}>
                <pre style={{ color: "#E5E7EB", fontSize: 13, fontFamily: "'Courier New', monospace", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  <code>
                    {JSON.stringify(selected, null, 2).split("\n").map((line, i) => (
                      <span key={i}>
                        <span style={{ color: "var(--gray-500)", userSelect: "none" }}>{String(i + 1).padStart(2, " ")} │ </span>
                        {line.includes(":") ? (
                          <>
                            <span style={{ color: "#93B4FF" }}>{line.substring(0, line.indexOf(":") + 1)}</span>
                            <span style={{ color: "#FFD54F" }}>{line.substring(line.indexOf(":") + 1)}</span>
                          </>
                        ) : (
                          <span>{line}</span>
                        )}
                        {"\n"}
                      </span>
                    ))}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: "var(--navy)", color: "var(--white)", padding: "40px 24px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 16 }}>
            <svg width="28" height="28" viewBox="0 0 36 36">
              <polygon points="18,2 32,10 32,26 18,34 4,26 4,10" fill="#F5B800" stroke="#F5B800" strokeWidth="1" />
              <text x="18" y="22" textAnchor="middle" fill="#0F2B46" fontWeight="800" fontSize="14" fontFamily="Inter, sans-serif">S</text>
            </svg>
            <span style={{ fontSize: 18, fontWeight: 700 }}>SOC<span style={{ color: "var(--primary)" }}>Alert</span></span>
          </div>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>AI-Powered SOC Automation — Wazuh + N8N + Azure</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 12 }}>Built with 🛡️ for Security Operations</p>
        </div>
      </footer>
    </div>
  );
}
