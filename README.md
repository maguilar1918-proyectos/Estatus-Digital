# Estatus Digital — landing

Landing de la agencia con asistente de chat y diagnóstico digital express con IA (Google Gemini).
Sitio estático más tres funciones de servidor en `/api`, listo para Vercel. Sin dependencias.

## Estructura

| Ruta | Qué es |
| --- | --- |
| `index.html`, `privacidad.html` | Páginas |
| `assets/css/styles.css` | Diseño (mobile first) |
| `assets/js/config.js` | **Datos del negocio**: WhatsApp, correo, RUC, IDs de GA4 y Meta Pixel |
| `assets/js/main.js` | Interacción: chat, diagnóstico, portafolio, formularios, eventos |
| `api/chat.js` | Asistente (Gemini) |
| `api/diagnostico.js` | Diagnóstico con IA y guardado del lead |
| `api/lead.js` | Formulario de contacto |
| `api/_lib.js` | Planes y precios, validación, Gemini y envío de leads |

## Variables de entorno (en el hosting, nunca en el código)

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `GEMINI_API_KEY` | Sí, para la IA | Clave gratuita de Google AI Studio |
| `GEMINI_MODEL` | No | Por defecto `gemini-flash-latest` |
| `LEADS_WEBHOOK_URL` | Recomendada | URL que recibe cada lead en JSON (por ejemplo, Google Apps Script) |

Sin `GEMINI_API_KEY` la web sigue funcionando: el chat responde con respuestas predefinidas y el
diagnóstico se calcula por reglas. Sin `LEADS_WEBHOOK_URL` los leads solo quedan en los registros
de las funciones (líneas `[LEAD]`).

### Guardar los leads en Google Sheets

1. Crea una hoja de cálculo, abre Extensiones > Apps Script y pega:

```js
function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].appendRow([
    d.fecha, d.origen, d.nombre, d.empresa || "", d.email || "", d.whatsapp,
    d.rubro || "", d.web || "", d.url || "", d.canales || "", d.objetivo || "",
    d.puntaje || "", d.planRecomendado || d.necesidad || ""
  ]);
  return ContentService.createTextOutput("ok");
}
```

2. Implementar > Nueva implementación > Aplicación web, con acceso "Cualquier usuario".
3. Copia la URL en la variable `LEADS_WEBHOOK_URL`.

## Publicar en Vercel

1. Importa este repositorio en Vercel (framework: Other, sin comando de build).
2. Agrega las variables de entorno y despliega.

## Desarrollo local

```bash
GEMINI_API_KEY=tu_clave npm run dev   # http://localhost:3000
```

## Pendientes antes de lanzar

- Completar `assets/js/config.js` (WhatsApp, correo, RUC, GA4, Meta Pixel).
- Reemplazar `estatusdigital.pe` en `robots.txt` y `sitemap.xml` por el dominio definitivo.
- Cambiar testimonios y casos de ejemplo por reales (`index.html` y `CASOS` en `main.js`).
- Revisar las respuestas de preguntas frecuentes y la política de privacidad (borrador).
