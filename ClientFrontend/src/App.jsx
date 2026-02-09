import { useEffect, useState } from "react";

export default function App() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [debug, setDebug] = useState([]);

  const log = (...args) => {
    const line = args
      .map((a) => (typeof a === "string" ? a : JSON.stringify(a, null, 2)))
      .join(" ");
    console.log("[DEBUG]", ...args);
    setDebug((prev) => [`${new Date().toISOString()}  ${line}`, ...prev].slice(0, 50));
  };

  // Show env at load time
  useEffect(() => {
    log("Page loaded.");
    log("window.location.origin =", window.location.origin);
    log("import.meta.env.MODE =", import.meta.env.MODE);
    log("import.meta.env.PROD =", import.meta.env.PROD);
    log("VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL ?? "(undefined)");
  }, []);

  const callBackend = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    // Read env
    const baseUrlRaw = import.meta.env.VITE_API_BASE_URL;
    log("Button clicked.");
    log("Raw VITE_API_BASE_URL =", baseUrlRaw ?? "(undefined)");

    // Basic validation
    if (!baseUrlRaw) {
      const msg =
        "VITE_API_BASE_URL is undefined in this build. (This usually means env var not injected at build time.)";
      log(msg);
      setError(msg);
      setLoading(false);
      return;
    }

    const baseUrl = baseUrlRaw.trim().replace(/\/+$/, ""); // remove trailing slash(es)
    const url = `${baseUrl}/`; // hit root
    log("Normalized baseUrl =", baseUrl);
    log("Final request URL =", url);

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        // mode is default "cors" for cross-origin; keeping explicit for clarity
        mode: "cors",
      });

      log("Fetch completed. status =", res.status);
      log("Response ok =", res.ok);

      // Log some headers (useful to see if response is from SWA or App Service)
      try {
        const headersObj = {};
        res.headers.forEach((v, k) => (headersObj[k] = v));
        log("Response headers =", headersObj);
      } catch (hErr) {
        log("Could not read headers:", String(hErr));
      }

      // Try to read body safely (even if not JSON)
      const contentType = res.headers.get("content-type") || "";
      log("content-type =", contentType);

      const text = await res.text();
      log("Raw response body (first 300 chars) =", text.slice(0, 300));

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      // Parse JSON if possible
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      log("Parsed data =", data);
      setMessage(data.message ?? JSON.stringify(data));
    } catch (e) {
      log("ERROR caught =", e?.message || String(e));

      // If it’s CORS, browser throws TypeError: Failed to fetch
      // We'll surface that clearly:
      if ((e?.message || "").toLowerCase().includes("failed to fetch")) {
        setError(
          "Failed to fetch (often CORS or network). Check Network tab for the actual request + CORS error."
        );
      } else {
        setError(e?.message || "Request failed");
      }
    } finally {
      setLoading(false);
      log("Done.");
    }
  };

  return (
    <div style={{ fontFamily: "Arial", padding: 24, maxWidth: 900 }}>
      <h2>ClientFrontend</h2>

      <div style={{ marginBottom: 12, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
        <div><b>UI Origin:</b> {window.location.origin}</div>
        <div><b>VITE_API_BASE_URL:</b> {import.meta.env.VITE_API_BASE_URL ?? "(undefined)"}</div>
      </div>

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

      <details style={{ marginTop: 16 }}>
        <summary style={{ cursor: "pointer" }}><b>Debug log (latest first)</b></summary>
        <pre style={{ whiteSpace: "pre-wrap", background: "#f7f7f7", padding: 12, borderRadius: 8 }}>
          {debug.join("\n\n")}
        </pre>
      </details>
    </div>
  );
}
