import { useState, useEffect, useRef } from "react";

// PUT YOUR GROQ KEY HERE:
const AI_KEY = "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";

const FREE_LIMIT = 3;
const STORAGE_KEY = "writespark_usage";
const TONES = ["Professional", "Casual", "Witty", "Persuasive", "Empathetic"];
const TYPES = [
  { id: "blog", label: "Blog Post", icon: "✍️" },
  { id: "social", label: "Social Media", icon: "📱" },
  { id: "email", label: "Email Copy", icon: "📧" },
  { id: "product", label: "Product Desc", icon: "🛍️" },
  { id: "ad", label: "Ad Copy", icon: "🎯" },
  { id: "headline", label: "Headlines", icon: "⚡" },
];

function useUsage() {
  const [used, setUsed] = useState(0);
  useEffect(() => {
    const today = new Date().toDateString();
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    if (stored.date === today) setUsed(stored.count || 0);
    else { localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count: 0 })); setUsed(0); }
  }, []);
  const increment = () => {
    const n = used + 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: new Date().toDateString(), count: n }));
    setUsed(n);
  };
  return { used, increment, remaining: Math.max(0, FREE_LIMIT - used), isLimited: used >= FREE_LIMIT };
}

export default function WriteSpark() {
  const { increment, remaining, isLimited } = useUsage();
  const [page, setPage] = useState("home");
  const [type, setType] = useState("blog");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Professional");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [error, setError] = useState("");
  const outputRef = useRef(null);

  const generate = async () => {
    if (!topic.trim()) return;
    if (isLimited) { setShowUpgrade(true); return; }
    setLoading(true);
    setOutput("");
    setError("");
    try {
      const body = {
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "user",
            content: `Write a ${tone.toLowerCase()} ${type} about: ${topic}. Keep it 200-300 words.`
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      };

      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + AI_KEY
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        setError("API Error: " + (data.error?.message || res.status));
        return;
      }

      const text = data.choices?.[0]?.message?.content || "No content returned.";
      setOutput(text);
      increment();
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setError("Network error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (page === "home") return (
    <div style={{ fontFamily: "Georgia,serif", background: "#0a0a0a", minHeight: "100vh", color: "#f5f0e8" }}>
      <style>{`* { margin:0; padding:0; box-sizing:border-box; }`}</style>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 32px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontSize: 22, fontWeight: 700 }}>Write<span style={{ color: "#f5b800" }}>Spark</span></div>
        <button onClick={() => setPage("app")} style={{ background: "#f5b800", color: "#0a0a0a", border: "none", padding: "10px 22px", borderRadius: 6, fontWeight: 700, cursor: "pointer" }}>Try Free →</button>
      </nav>
      <div style={{ textAlign: "center", padding: "80px 24px", maxWidth: 700, margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(36px,6vw,70px)", lineHeight: 1.1, fontWeight: 900, marginBottom: 20 }}>
          Words <span style={{ color: "#f5b800", fontStyle: "italic" }}>that</span> sell.<br />On demand.
        </h1>
        <p style={{ fontSize: 18, color: "rgba(245,240,232,0.6)", lineHeight: 1.7, marginBottom: 36 }}>
          Generate blog posts, ad copy, emails and social content in seconds.
        </p>
        <button onClick={() => setPage("app")} style={{ background: "#f5b800", color: "#0a0a0a", border: "none", padding: "16px 40px", borderRadius: 8, fontWeight: 700, fontSize: 17, cursor: "pointer" }}>
          Start Writing Free
        </button>
        <p style={{ fontSize: 12, color: "rgba(245,240,232,0.3)", marginTop: 14 }}>No credit card · 3 free generations daily</p>
      </div>
      <div style={{ padding: "40px 32px", maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 16 }}>
        {TYPES.map(t => (
          <div key={t.id} onClick={() => setPage("app")} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: "20px 22px", cursor: "pointer" }}>
            <div style={{ fontSize: 26, marginBottom: 8 }}>{t.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ fontFamily: "sans-serif", background: "#0a0a0a", minHeight: "100vh", color: "#f5f0e8" }}>
      <style>{`* { margin:0; padding:0; box-sizing:border-box; } textarea:focus,select:focus{outline:none;}`}</style>
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", borderBottom: "1px solid rgba(255,255,255,0.07)", position: "sticky", top: 0, background: "rgba(10,10,10,0.97)", zIndex: 10 }}>
        <button onClick={() => setPage("home")} style={{ background: "none", border: "none", color: "#f5f0e8", cursor: "pointer", fontSize: 17, fontWeight: 700 }}>
          ← Write<span style={{ color: "#f5b800" }}>Spark</span>
        </button>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#f5b800", background: "rgba(245,184,0,0.1)", border: "1px solid rgba(245,184,0,0.3)", borderRadius: 20, padding: "5px 14px" }}>
            {isLimited ? "⚠️ Limit reached" : `${remaining} free left`}
          </span>
          <button onClick={() => setShowUpgrade(true)} style={{ background: "#f5b800", color: "#0a0a0a", border: "none", padding: "8px 18px", borderRadius: 6, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            Upgrade Pro
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
          {TYPES.map(t => (
            <button key={t.id} onClick={() => setType(t.id)} style={{ background: type === t.id ? "rgba(245,184,0,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${type === t.id ? "#f5b800" : "rgba(255,255,255,0.1)"}`, borderRadius: 8, padding: "9px 16px", color: "#f5f0e8", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: 24, marginBottom: 16 }}>
          <label style={{ fontSize: 11, letterSpacing: 2, color: "rgba(245,240,232,0.4)", display: "block", marginBottom: 8 }}>WHAT ARE YOU WRITING ABOUT?</label>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            placeholder="e.g. how to make money online..."
            rows={3}
            style={{ width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "12px 14px", color: "#f5f0e8", fontSize: 15, lineHeight: 1.6, resize: "vertical" }}
          />
          <div style={{ marginTop: 14 }}>
            <label style={{ fontSize: 11, letterSpacing: 2, color: "rgba(245,240,232,0.4)", display: "block", marginBottom: 8 }}>TONE</label>
            <select value={tone} onChange={e => setTone(e.target.value)} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "10px 14px", color: "#f5f0e8", fontSize: 14, width: "100%" }}>
              {TONES.map(t => <option key={t} value={t} style={{ background: "#111" }}>{t}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={generate}
          disabled={loading || !topic.trim()}
          style={{ width: "100%", padding: 16, background: loading || !topic.trim() ? "rgba(245,184,0,0.3)" : "#f5b800", color: "#0a0a0a", border: "none", borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: loading || !topic.trim() ? "not-allowed" : "pointer", marginBottom: 24 }}
        >
          {loading ? "✨ Writing..." : `Generate ${TYPES.find(t => t.id === type)?.label} ✦`}
        </button>

        {error && (
          <div style={{ background: "rgba(255,80,80,0.1)", border: "1px solid rgba(255,80,80,0.3)", borderRadius: 10, padding: 16, marginBottom: 16, fontSize: 13, color: "#ff8080" }}>
            ⚠️ {error}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: "center", padding: 48, color: "rgba(245,240,232,0.4)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>✨</div>
            Writing your content...
          </div>
        )}

        {output && !loading && (
          <div ref={outputRef} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(245,184,0,0.25)", borderRadius: 12, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
              <span style={{ fontSize: 11, letterSpacing: 2, color: "rgba(245,240,232,0.4)" }}>GENERATED CONTENT</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={copy} style={{ background: copied ? "rgba(245,184,0,0.15)" : "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "6px 14px", color: copied ? "#f5b800" : "#f5f0e8", fontSize: 12, cursor: "pointer" }}>{copied ? "✓ Copied!" : "Copy"}</button>
                <button onClick={generate} style={{ background: "rgba(245,184,0,0.1)", border: "1px solid rgba(245,184,0,0.3)", borderRadius: 6, padding: "6px 14px", color: "#f5b800", fontSize: 12, cursor: "pointer" }}>↻ Regenerate</button>
              </div>
            </div>
            <p style={{ fontSize: 15, lineHeight: 1.85, whiteSpace: "pre-wrap", color: "rgba(245,240,232,0.9)" }}>{output}</p>
          </div>
        )}
      </div>

      {showUpgrade && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={() => setShowUpgrade(false)}>
          <div style={{ background: "#111", border: "1px solid rgba(245,184,0,0.4)", borderRadius: 20, padding: "40px 32px", maxWidth: 400, width: "100%", textAlign: "center" }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🚀</div>
            <h2 style={{ fontSize: 24, marginBottom: 10 }}>Upgrade to Pro</h2>
            <p style={{ color: "rgba(245,240,232,0.6)", fontSize: 14, marginBottom: 28 }}>Unlimited generations for just $12/month.</p>
            <button style={{ width: "100%", background: "#f5b800", color: "#0a0a0a", border: "none", padding: 16, borderRadius: 10, fontWeight: 700, fontSize: 16, cursor: "pointer" }}>Upgrade to Pro — $12/mo</button>
            <button onClick={() => setShowUpgrade(false)} style={{ background: "none", border: "none", color: "rgba(245,240,232,0.4)", fontSize: 13, cursor: "pointer", marginTop: 14 }}>Maybe later</button>
          </div>
        </div>
      )}
    </div>
  );
}
