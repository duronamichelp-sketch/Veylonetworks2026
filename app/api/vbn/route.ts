import { NextResponse } from 'next/server';

// VBN uses no paid API key. It displays article metadata and sends visitors
// to the original publisher rather than copying copyrighted article bodies.
// GDELT DOC 2.0 discovers worldwide news; Hacker News adds startup/tech stories.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Category = 'Business' | 'Economy' | 'Technology' | 'Startups';

type NewsArticle = {
  id: string;
  title: string;
  source: string;
  summary: string;
  url: string;
  publishedAt: string;
  category: Category;
};

type GdeltResponse = {
  articles?: Array<{
    title?: string;
    url?: string;
    domain?: string;
    seendate?: string;
    language?: string;
  }>;
};

type HackerNewsStory = {
  id?: number;
  type?: string;
  title?: string;
  url?: string;
  time?: number;
  deleted?: boolean;
  dead?: boolean;
};

const REFRESH_SECONDS = 300;

function safeUrl(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' || url.protocol === 'http:'
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function cleanTitle(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 260);
}

function publisherName(url: string): string {
  try {
    const domain = new URL(url).hostname.replace(/^www\./, '');
    const known: Record<string, string> = {
      'reuters.com': 'Reuters',
      'apnews.com': 'Associated Press',
      'bloomberg.com': 'Bloomberg',
      'ft.com': 'Financial Times',
      'cnbc.com': 'CNBC',
      'techcrunch.com': 'TechCrunch',
      'theverge.com': 'The Verge',
      'forbes.com': 'Forbes',
      'businessinsider.com': 'Business Insider',
      'wsj.com': 'The Wall Street Journal',
    };
    return known[domain] || domain;
  } catch {
    return 'Original publisher';
  }
}

function categoryFor(title: string): Category {
  if (/\b(startup|start-up|founder|fundrais|venture capital|seed round|series [a-f]|entrepreneur|accelerator)\b/i.test(title)) {
    return 'Startups';
  }
  if (/\b(inflation|interest rates?|recession|GDP|central bank|economy|economic|federal reserve|ECB|unemployment|consumer prices|government budget|trade deficit)\b/i.test(title)) {
    return 'Economy';
  }
  if (/\b(artificial intelligence|AI|tech|technology|software|cyber|cloud|semiconductor|chipmaker|robot|smartphone|openai|anthropic|nvidia|microsoft|google|apple|internet)\b/i.test(title)) {
    return 'Technology';
  }
  return 'Business';
}

function gdeltDate(value: unknown): string {
  if (typeof value === 'string') {
    const match = /^(\d{4})(\d{2})(\d{2})T?(\d{2})(\d{2})(\d{2})Z?$/.exec(value);
    if (match) {
      const parsed = new Date(
        Date.UTC(
          Number(match[1]),
          Number(match[2]) - 1,
          Number(match[3]),
          Number(match[4]),
          Number(match[5]),
          Number(match[6])
        )
      );
      if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();
    }
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) return new Date(parsed).toISOString();
  }
  return new Date().toISOString();
}

async function getWorldBusinessNews(): Promise<NewsArticle[]> {
  const params = new URLSearchParams({
    query: '(business OR economy OR finance OR "stock market" OR startup OR technology) sourcelang:english',
    mode: 'artlist',
    format: 'json',
    maxrecords: '60',
    timespan: '48h',
    sort: 'datedesc',
  });

  const response = await fetch(
    'https://api.gdeltproject.org/api/v2/doc/doc?' + params.toString(),
    {
      headers: { Accept: 'application/json', 'User-Agent': 'VeyloNetworks-News/1.0' },
      signal: AbortSignal.timeout(8500),
      next: { revalidate: REFRESH_SECONDS },
    }
  );
  if (!response.ok) throw new Error('GDELT HTTP ' + response.status);
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('json')) throw new Error('GDELT did not return JSON');

  const data = (await response.json()) as GdeltResponse;
  if (!Array.isArray(data.articles)) return [];

  return data.articles.flatMap((item): NewsArticle[] => {
    const url = safeUrl(item.url);
    const title = cleanTitle(item.title);
    if (!url || !title) return [];
    return [{
      id: 'gdelt:' + url,
      title,
      source: publisherName(url),
      summary: '',
      url,
      publishedAt: gdeltDate(item.seendate),
      category: categoryFor(title),
    }];
  });
}

async function getStartupAndTechNews(): Promise<NewsArticle[]> {
  const base = 'https://hacker-news.firebaseio.com/v0/';
  const request = { next: { revalidate: REFRESH_SECONDS }, signal: AbortSignal.timeout(7000) };

  const idsResponse = await fetch(base + 'topstories.json', request);
  if (!idsResponse.ok) throw new Error('Hacker News HTTP ' + idsResponse.status);
  const rawIds: unknown = await idsResponse.json();
  if (!Array.isArray(rawIds)) return [];

  // Read a small number of front-page stories, not all 500 IDs.
  const ids = rawIds.filter((id): id is number => Number.isSafeInteger(id)).slice(0, 24);
  const results = await Promise.allSettled(
    ids.map(async (id) => {
      const response = await fetch(base + 'item/' + id + '.json', request);
      if (!response.ok) return null;
      return (await response.json()) as HackerNewsStory | null;
    })
  );

  const articles: NewsArticle[] = [];
  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    const item = result.value;
    if (!item || item.dead || item.deleted || item.type !== 'story') continue;

    const title = cleanTitle(item.title);
    const url = safeUrl(item.url);
    if (!title || !url || !item.time) continue;
    articles.push({
      id: 'hn:' + String(item.id),
      title,
      source: publisherName(url),
      summary: '',
      url,
      publishedAt: new Date(item.time * 1000).toISOString(),
      category: categoryFor(title),
    });
  }

  const relevant = articles.filter((article) =>
    /\b(business|market|invest|econom|company|companies|startup|founder|fund|finance|revenue|profit|IPO|tech|software|AI|model|open.?source|cyber|chip|cloud|product|developer|data|energy)\b/i.test(article.title)
  );

  return (relevant.length >= 5 ? relevant : articles).slice(0, 10);
}

export async function GET() {
  // Each source can fail independently; no placeholder or fabricated headlines.
  const [world, startup] = await Promise.allSettled([
    getWorldBusinessNews(),
    getStartupAndTechNews(),
  ]);

  if (world.status === 'rejected') console.warn('VBN GDELT provider failed:', world.reason);
  if (startup.status === 'rejected') console.warn('VBN Hacker News provider failed:', startup.reason);

  const worldArticles = world.status === 'fulfilled' ? world.value.slice(0, 24) : [];
  const techArticles = startup.status === 'fulfilled' ? startup.value : [];

  const seen = new Set<string>();
  const articles = [...worldArticles, ...techArticles]
    .filter((item) => {
      const normalized = item.title.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, 30);

  if (articles.length === 0) {
    return NextResponse.json(
      {
        connected: false,
        articles: [],
        message: 'Live business headlines are temporarily unavailable. Please try Refresh again shortly.',
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }

  return NextResponse.json(
    {
      connected: true,
      articles,
      updatedAt: new Date().toISOString(),
      message: worldArticles.length === 0
        ? 'Global headlines are temporarily unavailable; displaying technology and startup stories.'
        : '',
    },
    { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' } }
  );
}
