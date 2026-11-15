// Cloudflare Pages Function: GET /api/markets
// Precios de referencia (futuros, con retraso) de commodities agrícolas.
// Fuente: Yahoo Finance (datos con retraso, solo referencia). Caché 20 minutos.

const SYMBOLS = [
  { s: 'ZC=F', k: 'corn',      en: 'Corn',         es: 'Maíz',            unit: 'bu',  cents: true },
  { s: 'ZW=F', k: 'wheat',     en: 'Wheat',        es: 'Trigo',           unit: 'bu',  cents: true },
  { s: 'ZS=F', k: 'soy',       en: 'Soybeans',     es: 'Soya',            unit: 'bu',  cents: true },
  { s: 'ZL=F', k: 'soyoil',    en: 'Soybean oil',  es: 'Aceite de soya',  unit: 'lb',  cents: true },
  { s: 'ZR=F', k: 'rice',      en: 'Rough rice',   es: 'Arroz',           unit: 'cwt', cents: false },
  { s: 'KC=F', k: 'coffee',    en: 'Coffee',       es: 'Café',            unit: 'lb',  cents: true },
  { s: 'CC=F', k: 'cocoa',     en: 'Cocoa',        es: 'Cacao',           unit: 't',   cents: false },
  { s: 'SB=F', k: 'sugar',     en: 'Sugar',        es: 'Azúcar',          unit: 'lb',  cents: true },
  { s: 'CT=F', k: 'cotton',    en: 'Cotton',       es: 'Algodón',         unit: 'lb',  cents: true },
  { s: 'OJ=F', k: 'oj',        en: 'Orange juice', es: 'Jugo de naranja', unit: 'lb',  cents: true },
  { s: 'LE=F', k: 'cattle',    en: 'Live cattle',  es: 'Ganado en pie',   unit: 'lb',  cents: true },
  { s: 'GF=F', k: 'feeder',    en: 'Feeder cattle',es: 'Ganado de engorde', unit: 'lb', cents: true },
  { s: 'HE=F', k: 'hogs',      en: 'Lean hogs',    es: 'Cerdo magro',     unit: 'lb',  cents: true },
];

async function chart(sym, range) {
  for (const host of ['query2', 'query1']) {
    try {
      const r = await fetch(`https://${host}.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym.s)}?range=${range}&interval=1d`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AgroChainMarkets/1.0; +https://www.agrochaintech.com)', Accept: 'application/json' },
        signal: AbortSignal.timeout(7000),
      });
      if (!r.ok) continue;
      const j = await r.json();
      const res = j.chart && j.chart.result && j.chart.result[0];
      if (res) return res;
    } catch (e) { /* intenta el siguiente host */ }
  }
  return null;
}

async function quote(sym) {
  const [day, month] = await Promise.all([chart(sym, '1d'), chart(sym, '1mo')]);
  if (!day) return null;
  const f = sym.cents ? 0.01 : 1;
  const r4 = (x) => +(x * f).toFixed(4);
  const price = r4(day.meta.regularMarketPrice);
  const prev = r4(day.meta.chartPreviousClose || day.meta.previousClose || day.meta.regularMarketPrice);
  const series = month ? (month.indicators.quote[0].close || []).filter((x) => typeof x === 'number').map(r4) : [];
  if (series.length) series[series.length - 1] = price;
  const change = +(price - prev).toFixed(4);
  return {
    key: sym.k, symbol: sym.s, en: sym.en, es: sym.es, unit: sym.unit, currency: 'USD',
    price, change, pct: prev ? +((change / prev) * 100).toFixed(2) : 0,
    high: series.length ? Math.max(...series) : price, low: series.length ? Math.min(...series) : price, series,
    time: day.meta.regularMarketTime ? new Date(day.meta.regularMarketTime * 1000).toISOString() : null,
  };
}

export async function onRequestGet(ctx) {
  const cache = caches.default;
  const key = new Request(new URL('/api/markets?cache=v1', ctx.request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;
  const items = (await Promise.all(SYMBOLS.map(quote))).filter(Boolean);
  const res = new Response(JSON.stringify({ updated: new Date().toISOString(), source: 'Yahoo Finance (delayed)', items }), {
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'public, max-age=900', 'access-control-allow-origin': '*' },
  });
  if (items.length) ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}
