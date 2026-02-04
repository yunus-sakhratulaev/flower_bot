export default async function handler(req, res) {
  try {
    if (req.method === "OPTIONS") return res.status(204).end();
    if (req.method !== "POST") return res.status(405).json({ detail: "Method not allowed" });

    const backendUrl = process.env.BACKEND_URL; // https://tg-miniapp-backend-production.up.railway.app
    const apiKey = process.env.API_KEY;         // тот же, что на Railway

    if (!backendUrl) return res.status(500).json({ detail: "BACKEND_URL is not set on Vercel" });
    if (!apiKey) return res.status(500).json({ detail: "API_KEY is not set on Vercel" });

    // ✅ гарантируем, что body — объект
    let body = req.body;
    if (!body || typeof body !== "object") {
      try { body = JSON.parse(req.body || "{}"); } catch { body = {}; }
    }

    if (!body.text || !body.buyer_id) {
      return res.status(400).json({ detail: "Missing text or buyer_id", got: body });
    }

    const r = await fetch(`${backendUrl}/api/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,   // FastAPI прочитает как x-api-key (регистр не важен)
      },
      body: JSON.stringify(body),
    });

    const raw = await r.text();
    res.status(r.status);

    // ппробуем отдать JSON, иначе текст
    try { return res.json(JSON.parse(raw)); }
    catch { return res.send(raw); }

  } catch (e) {
    return res.status(500).json({
      detail: String(e),
      stack: e?.stack || null
    });
  }
}
