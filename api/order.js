export default async function handler(req, res) {
  try {
    // Проверка ENV
    const backendUrl = process.env.BACKEND_URL;
    const apiKey = process.env.API_KEY;

    if (!backendUrl) {
      return res.status(500).json({ detail: "BACKEND_URL is not set on Vercel" });
    }
    if (!apiKey) {
      return res.status(500).json({ detail: "API_KEY is not set on Vercel" });
    }

    // Важно для Vercel: убедимся, что body объект
    const body = req.body && typeof req.body === "object" ? req.body : (() => {
      try { return JSON.parse(req.body || "{}"); } catch { return {}; }
    })();

    // Мини-валидация
    if (!body.text || !body.buyer_id) {
      return res.status(400).json({ detail: "Missing text or buyer_id", body });
    }

    const r = await fetch(`${backendUrl}/api/order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(body),
    });

    const raw = await r.text();

    // Пробуем вернуть как JSON
    res.status(r.status);
    try {
      return res.json(JSON.parse(raw));
    } catch {
      return res.send(raw);
    }
  } catch (e) {
    // ПОЛНЫЙ текст ошибки наружу
    return res.status(500).json({ detail: String(e), stack: e?.stack || null });
  }
}
