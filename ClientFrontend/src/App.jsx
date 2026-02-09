import { useState } from "react";

export default function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const callBackend = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const res = await fetch(`${baseUrl}/`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      setMessage(data.message ?? JSON.stringify(data));
    } catch (e) {
      setError(e.message || "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "Arial", padding: 24 }}>
      <h2>ClientFrontend</h2>

      <button onClick={callBackend} disabled={loading}>
        {loading ? "Calling..." : "Call Backend"}
      </button>

      {message && (
        <p style={{ marginTop: 16 }}>
          ✅ Response: <b>{message}</b>
        </p>
      )}

      {error && (
        <p style={{ marginTop: 16, color: "red" }}>
          ❌ Error: <b>{error}</b>
        </p>
      )}
    </div>
  );
}
