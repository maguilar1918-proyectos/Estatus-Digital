// Utilidades compartidas por las funciones /api (Vercel las ignora como ruta por el guion bajo).
import { appendFile } from "node:fs/promises";

export const PLANES = {
  express: {
    nombre: "Landing Express",
    inversion: "S/ 500 a S/ 700",
    plazo: "2 a 3 días",
    incluye: "1 página con 3 a 4 secciones (inicio, servicios, contacto) y formulario simple",
  },
  estandar: {
    nombre: "Landing Estándar",
    inversion: "S/ 1,000 a S/ 1,500",
    plazo: "4 a 5 días",
    incluye: "1 página con 5 a 7 secciones, testimonios, preguntas frecuentes, textos del rubro y botón de WhatsApp",
  },
  premium: {
    nombre: "Web Premium con IA",
    inversion: "S/ 2,500 a S/ 4,000",
    plazo: "7 a 10 días",
    incluye: "todo lo de la Landing Estándar más herramienta interactiva con IA (diagnóstico, calculadora o cotizador), animaciones y chat",
  },
  corporativa: {
    nombre: "Web Corporativa Multi-página",
    inversion: "S/ 3,500 a S/ 6,000",
    plazo: "10 a 15 días",
    incluye: "varias páginas (inicio, servicios detallados, nosotros, casos, contacto) con estructura SEO más amplia",
  },
  auditoria: {
    nombre: "Auditoría Digital 360",
    inversion: "S/ 300 a S/ 600",
    plazo: "a coordinar",
    incluye: "SEO técnico, experiencia de usuario y conversión, con plan de acción priorizado",
  },
};

export function textoPlanes() {
  return Object.values(PLANES)
    .map((p) => `- ${p.nombre}: ${p.inversion}, entrega ${p.plazo}. Incluye ${p.incluye}.`)
    .join("\n");
}

/* ---------- HTTP ---------- */
export function soloPost(req, res) {
  if (req.method === "POST") return true;
  res.setHeader("Allow", "POST");
  res.status(405).json({ error: "Método no permitido" });
  return false;
}

export function cuerpo(req) {
  const b = req.body;
  if (!b) return {};
  if (typeof b === "string") {
    try {
      return JSON.parse(b);
    } catch {
      return {};
    }
  }
  return b;
}

export function ip(req) {
  const xf = req.headers["x-forwarded-for"];
  return (Array.isArray(xf) ? xf[0] : xf || "").split(",")[0].trim() || req.socket?.remoteAddress || "desconocida";
}

// Límite de uso por IP. Vive en memoria de la instancia: frena abusos simples, no es un control exacto.
const ventanas = new Map();
export function limite(req, res, clave, max, ventanaMs = 10 * 60 * 1000) {
  const k = `${clave}:${ip(req)}`;
  const ahora = Date.now();
  const lista = (ventanas.get(k) || []).filter((t) => ahora - t < ventanaMs);
  if (lista.length >= max) {
    res.status(429).json({ error: "Demasiadas solicitudes. Inténtalo en unos minutos o escríbenos por WhatsApp." });
    return false;
  }
  lista.push(ahora);
  ventanas.set(k, lista);
  if (ventanas.size > 5000) ventanas.clear();
  return true;
}

/* ---------- Validación ---------- */
export const limpio = (v, max = 200) =>
  String(v ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, max);

export const esEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 120;
export const soloDigitos = (v) => String(v ?? "").replace(/\D/g, "");
export const esTelefono = (v) => {
  const d = soloDigitos(v);
  return d.length >= 9 && d.length <= 13;
};

/* ---------- Gemini ---------- */
export async function gemini({ sistema, contenidos, json, esquema, temperatura = 0.6, maxTokens = 1024 }) {
  const clave = process.env.GEMINI_API_KEY;
  if (!clave) throw new Error("GEMINI_API_KEY no configurada");
  const modelo = process.env.GEMINI_MODEL || "gemini-flash-latest";
  const base = process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com";

  const generationConfig = { temperature: temperatura, maxOutputTokens: maxTokens };
  if (json) {
    generationConfig.responseMimeType = "application/json";
    if (esquema) generationConfig.responseSchema = esquema;
  }

  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), 25000);
  try {
    const r = await fetch(`${base}/v1beta/models/${modelo}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": clave },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: sistema }] },
        contents: contenidos,
        generationConfig,
      }),
      signal: control.signal,
    });
    if (!r.ok) throw new Error(`Gemini respondió ${r.status}`);
    const data = await r.json();
    const texto = (data.candidates?.[0]?.content?.parts || [])
      .filter((p) => !p.thought)
      .map((p) => p.text || "")
      .join("")
      .trim();
    if (!texto) throw new Error("Gemini devolvió una respuesta vacía");
    return texto;
  } finally {
    clearTimeout(reloj);
  }
}

/* ---------- Leads ---------- */
// Envía el lead al webhook configurado (por ejemplo, un Google Apps Script que escribe en una hoja de cálculo).
// Siempre queda además en los registros de la función como respaldo.
export async function guardarLead(lead) {
  const registro = { fecha: new Date().toISOString(), ...lead };
  console.log("[LEAD]", JSON.stringify(registro));

  if (process.env.LEADS_LOCAL_FILE) {
    await appendFile(process.env.LEADS_LOCAL_FILE, JSON.stringify(registro) + "\n").catch(() => {});
  }

  const url = process.env.LEADS_WEBHOOK_URL;
  if (!url) return { guardado: false, motivo: "sin_webhook" };
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registro),
      signal: AbortSignal.timeout(8000),
    });
    return { guardado: r.ok };
  } catch (e) {
    console.error("[LEAD] No se pudo enviar al webhook:", e.message);
    return { guardado: false, motivo: "error_webhook" };
  }
}
