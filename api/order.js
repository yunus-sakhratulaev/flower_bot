export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ detail: "Method not allowed" });
  }

  try {
    const backendUrl = process.env.BACKEND_URL;   // например: https://tg-miniapp-backend-production.up.railway.app
    const apiKey = process.env.API_KEY;          // тот же ключ, что на Railway

    if (!backendUrl) {
      return res.status(500).json({ detail: "BACKEND_URL is not set on Vercel" });
    }
    if (!apiKey) {
      return res.status(500).json({ detail: "API_KEY is not set on Vercel" });
    }

    const r = await fetch(`${backendUrl}/api/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(req.body),
    });

    const text = await r.text();
    res.status(r.status);

    // если backend вернул json — отдадим как json, иначе как текст
    try {
      return res.json(JSON.parse(text));
    } catch {
      return res.send(text);
    }
  } catch (e) {
    return res.status(500).json({ detail: String(e) });
  }
}
