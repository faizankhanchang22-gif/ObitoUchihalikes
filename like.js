import fetch from "node-fetch";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "Only POST allowed" });
  }

  try {
    const { uid, server_name } = req.body;

    if (!uid || !server_name) {
      return res.status(400).json({ ok: false, error: "Missing uid or server_name" });
    }

    const url = `http://69.62.118.156:19126/like?uid=${encodeURIComponent(uid)}&server_name=${encodeURIComponent(server_name)}&key=freeapi`;

    const response = await fetch(url);
    const text = await response.text();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      result = { raw: text }; // fallback if response isn't JSON
    }

    return res.status(200).json({
      ok: true,
      status: response.status,
      result,
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
}
