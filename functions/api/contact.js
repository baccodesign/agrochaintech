// Cloudflare Pages Function: POST /api/contact
// Recibe el formulario de contacto y lo reenvía por FormSubmit.
// Los correos de destino se guardan como variables de entorno en Cloudflare
// (CONTACT_TO y CONTACT_CC), así no aparecen ni en la web ni en GitHub.

const json = (obj, status = 200) => new Response(JSON.stringify(obj), {
  status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
});

export async function onRequestPost({ request, env }) {
  const TO = env && env.CONTACT_TO, CC = env && env.CONTACT_CC;
  if (!TO) return json({ ok: false, error: 'not_configured' }, 500);
  let d;
  try { d = await request.json(); } catch (e) { return json({ ok: false, error: 'bad_request' }, 400); }
  const clean = (v, n) => String(v || '').replace(/[\u0000-\u0008\u000b-\u001f]/g, '').trim().slice(0, n);
  const name = clean(d.name, 120), email = clean(d.email, 160), company = clean(d.company, 160), message = clean(d.message, 5000);
  if (clean(d._honey, 50)) return json({ ok: true });            // bot: se ignora en silencio
  if (!name || !message || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ ok: false, error: 'invalid' }, 422);

  const payload = {
    name, email, company, message,
    _replyto: email, ...(CC ? { _cc: CC } : {}), _template: 'table', _captcha: 'false',
    _subject: 'Nuevo mensaje desde agrochaintech.com — ' + name,
  };
  let last = '';
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch('https://formsubmit.co/ajax/' + TO, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json',
          Origin: 'https://www.agrochaintech.com', Referer: 'https://www.agrochaintech.com/' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000),
      });
      const t = await r.text(); let j = {}; try { j = JSON.parse(t); } catch (e) {}
      if (String(j.success) === 'true') return json({ ok: true });
      last = j.message || ('HTTP ' + r.status);
      if (r.status < 500) break;                                  // error definitivo (p. ej. falta activar)
    } catch (e) { last = String(e); }
    await new Promise((res) => setTimeout(res, 1200));
  }
  return json({ ok: false, error: /activ/i.test(last) ? 'not_activated' : 'send_failed' }, 502);
}
