import { NextResponse } from 'next/server';

/**
 * Veylo Business News
 * Free, server-side RSS headline aggregator. No paid API keys, scraping of
 * article bodies or invented summaries. Original publishers retain their work.
 * A failed feed never prevents the other providers from serving stories.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type NewsCategory = 'Business' | 'Startups' | 'Markets' | 'Economy' | 'Technology' | 'World';

type NewsArticle = {
  id: string;
  title: string;
  source: string;
  summary: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  category: NewsCategory;
};

type FeedDefinition = {
  name: string;
  url: string;
  category: NewsCategory;
  max: number;
  google?: boolean;
};

const REFRESH_SECONDS = 480;
const MAX_AGE_DAYS = 21;

function googleNews(query: string): string {
  const params = new URLSearchParams({
    q: query,
    hl: 'en-IE',
    gl: 'IE',
    ceid: 'IE:en',
  });
  return 'https://news.google.com/rss/search?' + params.toString();
}

// RSS sources are freely readable. These are headlines and publisher links,
// never syndicated full articles. Multiple independent providers add resilience.
const FEEDS: FeedDefinition[] = [
  {
    name: 'BBC News',
    url: 'https://feeds.bbci.co.uk/news/business/rss.xml',
    category: 'Business',
    max: 20,
  },
  {
    name: 'BBC News',
    url: 'https://feeds.bbci.co.uk/news/world/rss.xml',
    category: 'World',
    max: 18,
  },
  {
    name: 'BBC News',
    url: 'https://feeds.bbci.co.uk/news/technology/rss.xml',
    category: 'Technology',
    max: 10,
  },
  {
    name: 'The Guardian',
    url: 'https://www.theguardian.com/uk/business/rss',
    category: 'Business',
    max: 16,
  },
  {
    name: 'The Guardian',
    url: 'https://www.theguardian.com/world/rss',
    category: 'World',
    max: 12,
  },
  {
    name: 'TechCrunch',
    url: 'https://techcrunch.com/feed/',
    category: 'Startups',
    max: 18,
  },
  {
    name: 'CNBC',
    url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html',
    category: 'Markets',
    max: 12,
  },
  {
    name: 'Google News',
    url: googleNews('business companies mergers economy when:2d'),
    category: 'Business',
    max: 18,
    google: true,
  },
  {
    name: 'Google News',
    url: googleNews('startup funding venture capital founders when:7d'),
    category: 'Startups',
    max: 22,
    google: true,
  },
  {
    name: 'Google News',
    url: googleNews('stock markets earnings finance interest rates when:2d'),
    category: 'Markets',
    max: 16,
    google: true,
  },
  {
    name: 'Google News',
    url: googleNews('world international global news when:2d'),
    category: 'World',
    max: 16,
    google: true,
  },
  {
    name: 'Google News',
    url: googleNews('Ireland business startups enterprise when:7d'),
    category: 'Business',
    max: 10,
    google: true,
  },
];

function decodeEntities(raw: string): string {
  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    ndash: '–',
    mdash: '—',
    lsquo: '‘',
    rsquo: '’',
    ldquo: '“',
    rdquo: '”',
    hellip: '…',
    copy: '©',
    euro: '€',
  };

  return raw.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (match, entity: string) => {
    const key = entity.toLowerCase();
    if (key.startsWith('#x') || key.startsWith('#')) {
      const value = Number.parseInt(key.slice(key.startsWith('#x') ? 2 : 1), key.startsWith('#x') ? 16 : 10);
      return Number.isFinite(value) && value > 0 && value <= 0x10ffff &&
        !(value >= 0xd800 && value <= 0xdfff)
        ? String.fromCodePoint(value)
        : '';
    }
    return named[key] ?? match;
  });
}

function xmlValue(xml: string, name: string): string {
  const pattern = new RegExp('<' + name + '(?:\\s[^>]*)?>([\\s\\S]*?)<\\/' + name + '>', 'i');
  const match = pattern.exec(xml);
  if (!match) return '';
  return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim();
}

function readableText(text: string, limit = 300): string {
  return decodeEntities(text.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, limit);
}

function safeUrl(raw: string): string | null {
  try {
    const value = decodeEntities(raw.trim());
    const parsed = new URL(value);
    return ['https:', 'http:'].includes(parsed.protocol) ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function rssImage(item: string): string | undefined {
  const tag = /<(?:media:thumbnail|media:content|enclosure)\b[^>]*>/gi;
  let match: RegExpExecArray | null;
  while ((match = tag.exec(item)) !== null) {
    const element = match[0];
    if (element.startsWith('<enclosure') && !/type=["']image\//i.test(element)) continue;
    if (element.startsWith('<media:content') && /medium=["']video/i.test(element)) continue;
    const urlMatch = /\burl=["']([^"']+)["']/i.exec(element);
    const url = urlMatch && safeUrl(urlMatch[1]);
    if (url && url.startsWith('https://')) return url;
  }
  return undefined;
}

function categorise(title: string, source: NewsCategory): NewsCategory {
  if (source === 'World' || source === 'Startups' || source === 'Markets') return source;

  if (/\b(startups?|founders?|venture capital|fundrais\w*|seed funding|series [a-f]|entrepreneur|accelerator|unicorn)\b/i.test(title)) {
    return 'Startups';
  }
  if (/\b(stocks?|stock market|wall street|shares|nasdaq|earnings|investors?|commodity|oil price|bond yields?|s&p 500)\b/i.test(title)) {
    return 'Markets';
  }
  if (/\b(inflation|interest rates?|recession|gdp|central banks?|economic growth|unemployment|cost of living|federal reserve|ecb)\b/i.test(title)) {
    return 'Economy';
  }
  if (source === 'Technology' || /\b(artificial intelligence|ai models?|software|semiconductor|cybersecurity|technology|tech industry|nvidia|openai)\b/i.test(title)) {
    return 'Technology';
  }
  return source;
}

function parseFeed(xml: string, definition: FeedDefinition): NewsArticle[] {
  const items = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) || [];
  const articles: NewsArticle[] = [];

  for (const item of items.slice(0, Math.max(definition.max * 2, 30))) {
    const url = safeUrl(xmlValue(item, 'link'));
    let title = readableText(xmlValue(item, 'title'), 240);
    if (!url || !title) continue;

    const publishedRaw = xmlValue(item, 'pubDate') || xmlValue(item, 'dc:date');
    const dateValue = Date.parse(readableText(publishedRaw, 100));
    if (Number.isNaN(dateValue)) continue;

    const now = Date.now();
    if (dateValue < now - MAX_AGE_DAYS * 86400_000 || dateValue > now + 86400_000) continue;

    const publisher = readableText(xmlValue(item, 'source'), 70) || definition.name;
    if (definition.google && title.toLowerCase().endsWith(' - ' + publisher.toLowerCase())) {
      title = title.slice(0, -(publisher.length + 3));
    }
    if (title.length < 15) continue;

    const rawDescription = definition.google ? '' : readableText(xmlValue(item, 'description'), 265);
    const summary = rawDescription && !rawDescription.toLowerCase().startsWith(title.toLowerCase().slice(0, 40))
      ? rawDescription
      : '';

    articles.push({
      id: url,
      title,
      source: publisher,
      summary,
      url,
      imageUrl: rssImage(item),
      publishedAt: new Date(dateValue).toISOString(),
      category: categorise(title, definition.category),
    });
    if (articles.length >= definition.max) break;
  }

  return articles;
}

async function fetchFeed(definition: FeedDefinition): Promise<NewsArticle[]> {
  const response = await fetch(definition.url, {
    next: { revalidate: REFRESH_SECONDS },
    signal: AbortSignal.timeout(8500),
    headers: {
      Accept: 'application/rss+xml, application/xml, text/xml, */*',
      'User-Agent': 'VeyloNetworks/1.0 (+news headlines)',
    },
  });

  if (!response.ok) throw new Error(definition.name + ': HTTP ' + response.status);
  const xml = await response.text();
  if (xml.length > 2_000_000 || !/<rss|<rdf:RDF/i.test(xml)) {
    throw new Error(definition.name + ': Invalid RSS response');
  }

  return parseFeed(xml, definition);
}

async function getHackerNewsBackup(): Promise<NewsArticle[]> {
  // A fallback only: the main feed should prioritise publishers' business/world reporting.
  const api = 'https://hacker-news.firebaseio.com/v0/';
  const requestOptions = { next: { revalidate: REFRESH_SECONDS }, signal: AbortSignal.timeout(7500) };
  const res = await fetch(api + 'topstories.json', requestOptions);
  if (!res.ok) return [];
  const json: unknown = await res.json();
  if (!Array.isArray(json)) return [];

  const ids = json.filter((id): id is number => Number.isSafeInteger(id)).slice(0, 22);
  const stories = await Promise.allSettled(ids.map(async id => {
    const result = await fetch(api + 'item/' + id + '.json', requestOptions);
    return result.ok ? result.json() : null;
  }));

  const articles: NewsArticle[] = [];
  for (const result of stories) {
    if (result.status !== 'fulfilled') continue;
    const item = result.value as {
      id?: number; title?: string; url?: string; time?: number;
      dead?: boolean; deleted?: boolean; type?: string;
    } | null;
    if (!item || item.deleted || item.dead || item.type !== 'story' || !item.title || !item.url || !item.time) continue;
    const title = readableText(item.title, 240);
    const url = safeUrl(item.url);
    if (!url || !/\b(startup|fundrais|venture|invest|company|business|acquisit|econom|market|revenue|earnings|finance|tech|AI)\b/i.test(title)) continue;

    articles.push({
      id: 'hn-' + String(item.id),
      title,
      summary: '',
      source: new URL(url).hostname.replace(/^www\./, ''),
      url,
      category: categorise(title, 'Technology'),
      publishedAt: new Date(item.time * 1000).toISOString(),
    });
  }
  return articles.slice(0, 10);
}

function buildSelection(articles: NewsArticle[]): NewsArticle[] {
  const seenTitles = new Set<string>();
  const seenUrls = new Set<string>();
  const unique = articles
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .filter(article => {
      const title = article.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      if (seenTitles.has(title) || seenUrls.has(article.url)) return false;
      seenTitles.add(title);
      seenUrls.add(article.url);
      return true;
    });

  const quotas: Record<NewsCategory, number> = {
    Business: 24,
    Startups: 21,
    Markets: 16,
    Economy: 12,
    Technology: 14,
    World: 21,
  };
  const counts: Record<NewsCategory, number> = {
    Business: 0,
    Startups: 0,
    Markets: 0,
    Economy: 0,
    Technology: 0,
    World: 0,
  };
  const selected = unique.filter(article => {
    if (counts[article.category] >= quotas[article.category]) return false;
    counts[article.category] += 1;
    return true;
  });

  return selected.slice(0, 95);
}

export async function GET() {
  const responses = await Promise.allSettled(FEEDS.map(fetchFeed));
  const successes = responses.filter((result): result is PromiseFulfilledResult<NewsArticle[]> =>
    result.status === 'fulfilled' && result.value.length > 0
  );

  const primary = successes.flatMap(result => result.value);
  for (let index = 0; index < responses.length; index++) {
    const result = responses[index];
    if (result.status === 'rejected') {
      console.warn('[VBN] RSS feed unavailable: ' + FEEDS[index].name, result.reason);
    }
  }

  let all = primary;
  if (primary.length < 15) {
    try {
      all = primary.concat(await getHackerNewsBackup());
    } catch (error) {
      console.warn('[VBN] Optional Hacker News fallback unavailable', error);
    }
  }

  const articles = buildSelection(all);
  if (!articles.length) {
    return NextResponse.json({
      connected: false,
      articles: [],
      message: 'Live news is temporarily unavailable. Please select Refresh to retry.',
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json({
    connected: true,
    articles,
    updatedAt: new Date().toISOString(),
    sourceCount: successes.length,
    message: successes.length === 0
      ? 'Some news sources are temporarily unavailable.'
      : '',
  }, {
    headers: { 'Cache-Control': 'public, s-maxage=480, stale-while-revalidate=900' },
  });
}
