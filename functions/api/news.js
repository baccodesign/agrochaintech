// Cloudflare Pages Function: GET /api/news
// Reúne titulares recientes de medios especializados (RSS públicos) sobre
// trazabilidad, cadena de suministro, blockchain, inocuidad y agrotecnología.
// Responde JSON y se guarda en caché 30 minutos.

const FEEDS = [
  { url: 'https://www.foodsafetynews.com/feed/', source: 'Food Safety News', lang: 'en', topic: 'foodsafety' },
  { url: 'https://www.supplychaindive.com/feeds/news/', source: 'Supply Chain Dive', lang: 'en', topic: 'logistics' },
  { url: 'https://www.fooddive.com/feeds/news/', source: 'Food Dive', lang: 'en', topic: 'agrifood' },
  { url: 'https://agfundernews.com/feed', source: 'AgFunderNews', lang: 'en', topic: 'agtech' },
  { url: 'https://www.foodnavigator.com/arc/outboundfeeds/rss/', source: 'FoodNavigator', lang: 'en', topic: 'agrifood' },
  { url: 'https://www.agribusinessglobal.com/feed/', source: 'AgriBusiness Global', lang: 'en', topic: 'agrifood' },
  { url: 'https://www.ledgerinsights.com/feed/', source: 'Ledger Insights', lang: 'en', topic: 'blockchain' },
  { url: 'https://www.agroinformacion.com/feed/', source: 'Agroinformación', lang: 'es', topic: 'agrifood' },
  { url: 'https://www.redagricola.com/feed/', source: 'Redagrícola', lang: 'es', topic: 'agtech' },
  { url: 'https://www.portalfruticola.com/feed/', source: 'PortalFrutícola', lang: 'es', topic: 'logistics' },
  { url: 'https://www.agromeat.com/feed', source: 'Agromeat', lang: 'es', topic: 'agrifood' },
];

const TOPICS = [
  ['traceability', /traceab|trazab|rastreab|recall|retirad|fsma|tracking|serializ|etiquet|label/i],
  ['blockchain', /blockchain|ledger|tokeni|digital product passport|pasaporte digital|web3|smart contract/i],
  ['foodsafety', /food safety|inocuidad|outbreak|brote|contamina|salmonella|listeria|e\. coli|pathogen|patóg/i],
  ['logistics', /supply chain|cadena de suministro|logist|freight|shipping|port |puerto|cold chain|cadena de fr[ií]o|tariff|arancel|warehouse|almac[eé]n/i],
  ['agtech', /agtech|agritech|precision|precisi[oó]n|drone|dron|robot|sensor|\bai\b|\bia\b|artificial intelligence|inteligencia artificial|satellite|sat[eé]lite|digital/i],
];

function decode(s) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&quot;/g, '"').replace(/&apos;|&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}
function tag(xml, name) {
  const m = xml.match(new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)</' + name + '>', 'i'));
  return m ? decode(m[1]).trim() : '';
}
function strip(html) {
  return decode(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
function image(xml) {
  const pats = [
    /<media:content[^>]*url="([^"]+)"/i,
    /<media:thumbnail[^>]*url="([^"]+)"/i,
    /<enclosure[^>]*url="([^"]+\.(?:jpe?g|png|webp)[^"]*)"/i,
    /<img[^>]*src=["']([^"']+)["']/i,
  ];
  for (const p of pats) {
    const m = xml.match(p) || decode(xml).match(p);
    if (m && /^https:\/\//.test(m[1])) return decode(m[1]);
  }
  return '';
}
function topicsFor(text, fallback) {
  const t = TOPICS.filter(([, re]) => re.test(text)).map(([k]) => k);
  return t.length ? t : [fallback];
}

async function readFeed(f) {
  try {
    const r = await fetch(f.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AgroChainNews/1.0; +https://www.agrochaintech.com)' },
      cf: { cacheTtl: 900, cacheEverything: true },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return [];
    const xml = await r.text();
    const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || [];
    return items.slice(0, 25).map((it) => {
      const title = strip(tag(it, 'title'));
      const link = strip(tag(it, 'link')) || (it.match(/<guid[^>]*>(https?:[^<]+)</i) || [])[1] || '';
      const date = new Date(tag(it, 'pubDate') || tag(it, 'dc:date') || Date.now());
      const summary = strip(tag(it, 'description')).slice(0, 240);
      return {
        title, link, summary,
        source: f.source, lang: f.lang,
        date: isNaN(date) ? null : date.toISOString(),
        image: image(it),
        topics: topicsFor(title + ' ' + summary, f.topic),
      };
    }).filter((x) => x.title && /^https?:\/\//.test(x.link));
  } catch (e) {
    return [];
  }
}

export async function onRequestGet(ctx) {
  const cache = caches.default;
  const key = new Request(new URL('/api/news?cache=v1', ctx.request.url).toString());
  const hit = await cache.match(key);
  if (hit) return hit;

  const lists = await Promise.all(FEEDS.map(readFeed));
  const seen = new Set();
  const cutoff = Date.now() - 45 * 864e5; // últimos 45 días
  const items = lists.flat()
    .filter((x) => x.date && Date.parse(x.date) > cutoff)
    .filter((x) => !/d[oó]lar|cotiza|hor[oó]scopo|loter[ií]a|quiniela/i.test(x.title))
    .filter((x) => { const k = x.title.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
    .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
    ;
  const per = {};
  const diverse = items.filter((x) => (per[x.source] = (per[x.source] || 0) + 1) <= 12);
  const en = diverse.filter((x) => x.lang === 'en').slice(0, 60);
  const es = diverse.filter((x) => x.lang === 'es').slice(0, 60);
  const list = en.concat(es).sort((a, b) => Date.parse(b.date) - Date.parse(a.date));

  const res = new Response(JSON.stringify({ updated: new Date().toISOString(), count: list.length, items: list }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=1800',
      'access-control-allow-origin': '*',
    },
  });
  if (list.length) ctx.waitUntil(cache.put(key, res.clone()));
  return res;
}
