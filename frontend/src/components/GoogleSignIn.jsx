import { useEffect, useState, useRef } from "react";

export default function GoogleSignIn({ onAuthSuccess, onError, baseUrl }) {
  const [loading, setLoading] = useState(false);
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const buttonRef = useRef(null);

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "409055532839-fje03tsrgk8mkmn90dqbd4q5g7k1eq5h.apps.googleusercontent.com";

  const handleCredentialResponse = async (credential) => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();
      if (res.ok && data.access_token) {
        onAuthSuccess(data);
      } else {
        onError(data.detail || "Google authentication failed. Please try again.");
      }
    } catch (err) {
      onError("Unable to connect to authentication server. Verify backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!googleClientId) return;

    let intervalId = null;
    const initGsi = () => {
      if (window.google?.accounts?.id && buttonRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: googleClientId,
            callback: (response) => {
              if (response.credential) {
                handleCredentialResponse(response.credential);
              }
            },
          });

          // Render Google GIS button into container
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: "standard",
            theme: "filled_black",
            size: "large",
            text: "continue_with",
            shape: "rectangular",
            logo_alignment: "left",
            width: 380,
          });
        } catch (e) {
          console.warn("Google Sign-In initialization note:", e);
        }
        return true;
      }
      return false;
    };

    if (!initGsi()) {
      intervalId = setInterval(() => {
        if (initGsi()) clearInterval(intervalId);
      }, 300);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [googleClientId]);

  // Fallback / Custom styled Google button handler
  const handleCustomGoogleClick = () => {
    if (!googleClientId) {
      setShowConfigHelp(true);
      return;
    }

    // Trigger Google Prompt if GIS is loaded
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If prompt blocked or dismissed, display helper
          setShowConfigHelp(true);
        }
      });
    } else {
      setShowConfigHelp(true);
    }
  };

  return (
    <div style={{ width: "100%", marginTop: 4 }}>
      {/* Native GIS Render Target (when client ID is configured and GIS loaded) */}
      {googleClientId && (
        <div
          ref={buttonRef}
          id="googleSignInDiv"
          style={{ width: "100%", display: "flex", justifyContent: "center", minHeight: 44 }}
        />
      )}

      {/* Branded Google Sign-In Button (matches LogiTrack Prime Dark Terminal Aesthetic) */}
      {(!googleClientId || !window.google?.accounts?.id) && (
        <button
          type="button"
          onClick={handleCustomGoogleClick}
          disabled={loading}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            padding: "11px 16px",
            background: "#131a2a",
            color: "#f8fafc",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s ease",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#1a233a";
            e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#131a2a";
            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.12)";
          }}
        >
          {loading ? (
            <div
              style={{
                width: 16,
                height: 16,
                border: "2px solid #ffffff",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spinSlow 0.6s linear infinite",
              }}
            />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.43 7.37 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.57 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
          )}
          <span>Continue with Google</span>
        </button>
      )}

      {/* Help Modal / Tooltip when Client ID is missing */}
      {showConfigHelp && (
        <div
          style={{
            marginTop: 12,
            padding: "14px 16px",
            background: "rgba(30, 41, 59, 0.95)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            borderRadius: 8,
            fontSize: 12,
            color: "#94a3b8",
            lineHeight: 1.5,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <span style={{ color: "#f8fafc", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <span className="ms ms-16" style={{ color: "#6366f1" }}>info</span>
              Google OAuth Configuration
            </span>
            <button
              onClick={() => setShowConfigHelp(false)}
              style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 14 }}
            >
              ✕
            </button>
          </div>
          <p style={{ margin: "4px 0 8px 0" }}>
            To enable real Google Sign-In, add your client ID from the Google Cloud Console to{" "}
            <code style={{ color: "#38bdf8", background: "rgba(0,0,0,0.3)", padding: "2px 4px", borderRadius: 4 }}>
              frontend/.env
            </code>
            :
          </p>
          <pre
            style={{
              background: "#090d16",
              padding: "6px 10px",
              borderRadius: 6,
              color: "#38bdf8",
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              overflowX: "auto",
            }}
          >
            VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
          </pre>
        </div>
      )}
    </div>
  );
}
