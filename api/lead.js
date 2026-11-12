import { soloPost, cuerpo, limite, limpio, esTelefono, soloDigitos, guardarLead } from "./_lib.js";

const NECESIDADES = [
  "Landing page",
  "Web Premium con IA",
  "Web corporativa",
  "Auditoría Digital 360",
  "Aún no lo sé, quiero orientación",
];

export default async function handler(req, res) {
  if (!soloPost(req, res)) return;
  if (!limite(req, res, "lead", 6)) return;

  const b = cuerpo(req);
  if (b.sitio) return res.status(200).json({ ok: true }); // campo trampa para bots

  const lead = {
    origen: "contacto",
    nombre: limpio(b.nombre, 80),
    empresa: limpio(b.empresa, 100),
    whatsapp: soloDigitos(b.whatsapp),
    necesidad: NECESIDADES.includes(b.necesidad) ? b.necesidad : NECESIDADES[4],
    consentimiento: b.consentimiento === true,
  };

  if (!lead.nombre || !esTelefono(lead.whatsapp)) {
    return res.status(400).json({ error: "Revisa tu nombre y tu WhatsApp." });
  }
  if (!lead.consentimiento) {
    return res.status(400).json({ error: "Necesitamos tu autorización para tratar tus datos." });
  }

  await guardarLead(lead);
  res.status(200).json({ ok: true });
}
