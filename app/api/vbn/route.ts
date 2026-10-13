import { NextResponse } from 'next/server';

/**
 * VBN pulls free RSS headlines from mainstream and startup publishers.
 * All article links lead to the reporting publisher or original feed link.
 * No paid API key and no full-text article scraping.
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Category = 'Business' | 'Startups' | 'Markets' | 'Economy' | 'Technology' | 'World';

type Article = {
  id: string;
  title: string;
  source: string;
  summary: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  category: Category;
};

type Feed = {
  url: string;
  source: string;
  category: Category;
  max: number;
  google?: boolean;
};

function googleNews(query: string): string {
  return 'https://news.google.com/rss/search?' +
    new URLSearchParams({ q: query, hl: 'en-IE', gl: 'IE', ceid: 'IE:en' }).toString();
}

const feeds: Feed[] = [
  { source: 'BBC News', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', category: 'Business', max: 20 },
  { source: 'BBC News', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'World', max: 18 },
  { source: 'BBC News', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml', category: 'Technology', max: 10 },
  { source: 'The Guardian', url: 'https://www.theguardian.com/uk/business/rss', category: 'Business', max: 16 },
  { source: 'The Guardian', url: 'https://www.theguardian.com/world/rss', category: 'World', max: 14 },
  { source: 'TechCrunch', url: 'https://techcrunch.com/feed/', category: 'Startups', max: 18 },
  { source: 'CNBC', url: 'https://www.cnbc.com/id/10001147/device/rss/rss.html', category: 'Markets', max: 12 },
  { source: 'Google News', url: googleNews('business companies economy when:2d'), category: 'Business', max: 18, google: true },
  { source: 'Google News', url: googleNews('startup funding venture capital when:7d'), category: 'Startups', max: 20, google: true },
  { source: 'Google News', url: googleNews('stock market earnings finance when:2d'), category: 'Markets', max: 16, google: true },
  { source: 'Google News', url: googleNews('world international news when:2d'), category: 'World', max: 16, google: true },
  { source: 'Google News', url: googleNews('Ireland business entrepreneurs when:7d'), category: 'Business', max: 10, google: true },
];

function decode(text: string): string {
  const named: { [key: string]: string } = {
    amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
    ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”',
  };
  return text.replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (original, entity: string) => {
    const key = entity.toLowerCase();
    if (key.charAt(0) === '#') {
      const isHex = key.charAt(1) === 'x';
      const value = parseInt(key.slice(isHex ? 2 : 1), isHex ? 16 : 10);
      return value > 0 && value <= 0x10ffff && !(value >= 0xd800 && value <= 0xdfff)
        ? String.fromCodePoint(value)
        : '';
    }
    return named[key] || original;
  });
}

function readTag(xml: string, tag: string): string {
  const expression = new RegExp('<' + tag + '[^>]*>([\\s\\S]*?)<\\/' + tag + '>', 'i');
  const match = expression.exec(xml);
  return match ? match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, '$1').trim() : '';
}

function clean(text: string, limit: number): string {
  return decode(text.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim().slice(0, limit);
}

function validUrl(input: string): string {
  try {
    const value = new URL(decode(input.trim()));
    return value.protocol === 'https:' || value.protocol === 'http:' ? value.toString() : '';
  } catch {
    return '';
  }
}

function titleCategory(title: string, feedCategory: Category): Category {
  if (feedCategory === 'World' || feedCategory === 'Startups' || feedCategory === 'Markets') return feedCategory;
  if (/\b(startup|funding|venture capital|founder|series [a-f]|entrepreneur|seed round)\b/i.test(title)) return 'Startups';
  if (/\b(stocks?|stock market|shares|earnings|wall street|nasdaq|bond yields?|investors?)\b/i.test(title)) return 'Markets';
  if (/\b(inflation|interest rates?|recession|unemployment|economic growth|central bank|gdp)\b/i.test(title)) return 'Economy';
  if (feedCategory === 'Technology' || /\b(technology|tech|artificial intelligence|cybersecurity|semiconductor|software)\b/i.test(title)) return 'Technology';
  return feedCategory;
}

function imageFor(item: string): string | undefined {
  const tags = item.match(/<(?:media:thumbnail|media:content|enclosure)\b[^>]*>/gi) || [];
  for (const tag of tags) {
    if (tag.indexOf('<enclosure') === 0 && !/type=['"]image\//i.test(tag)) continue;
    if (/medium=['"]video/i.test(tag)) continue;
    const match = /\burl=['"]([^'"]+)['"]/i.exec(tag);
    const url = match ? validUrl(match[1]) : '';
    if (url.indexOf('https://') === 0) return url;
  }
  return undefined;
}

function parse(xml: string, feed: Feed): Article[] {
  const rawItems = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) || [];
  const articles: Article[] = [];
  const oldest = Date.now() - 21 * 86400 * 1000;

  for (const item of rawItems) {
    const url = validUrl(readTag(item, 'link'));
    let title = clean(readTag(item, 'title'), 240);
    const date = Date.parse(clean(readTag(item, 'pubDate') || readTag(item, 'dc:date'), 110));
    if (!url || !title || !Number.isFinite(date) || date < oldest || date > Date.now() + 86400 * 1000) continue;

    const publisher = clean(readTag(item, 'source'), 100) || feed.source;
    if (feed.google && title.toLowerCase().endsWith(' - ' + publisher.toLowerCase())) {
      title = title.slice(0, -(publisher.length + 3));
    }
    if (title.length < 15) continue;

    const description = feed.google ? '' : clean(readTag(item, 'description'), 240);
    articles.push({
      id: url,
      title,
      source: publisher,
      summary: description.toLowerCase().startsWith(title.toLowerCase().slice(0, 40)) ? '' : description,
      url,
      imageUrl: imageFor(item),
      publishedAt: new Date(date).toISOString(),
      category: titleCategory(title, feed.category),
    });

    if (articles.length >= feed.max) break;
  }
  return articles;
}

async function loadFeed(feed: Feed): Promise<Article[]> {
  try {
    const response = await fetch(feed.url, {
      next: { revalidate: 480 },
      signal: AbortSignal.timeout(8000),
      headers: { Accept: 'application/rss+xml, application/xml, text/xml, */*' },
    });

    if (!response.ok) return [];
    const xml = await response.text();
    if (xml.length > 2_000_000 || !/<rss|<rdf:RDF/i.test(xml)) return [];
    return parse(xml, feed);
  } catch (error) {
    console.warn('[VBN] Feed temporarily unavailable:', feed.source, error);
    return [];
  }
}

async function backupStories(): Promise<Article[]> {
  try {
    const base = 'https://hacker-news.firebaseio.com/v0/';
    const idsResponse = await fetch(base + 'topstories.json', { next: { revalidate: 480 } });
    if (!idsResponse.ok) return [];
    const ids: number[] = await idsResponse.json();
    const results = await Promise.all(ids.slice(0, 18).map(async (id: number) => {
      try {
        const response = await fetch(base + 'item/' + id + '.json', { next: { revalidate: 480 } });
        return response.ok ? response.json() : null;
      } catch {
        return null;
      }
    }));

    const result: Article[] = [];
    for (const story of results) {
      if (!story || story.type !== 'story' || !story.title || !story.url || !story.time) continue;
      const title = clean(story.title, 240);
      const url = validUrl(story.url);
      if (!url || !/\b(startup|business|market|finance|earnings|economy|funding|venture|investor|technology|AI)\b/i.test(title)) continue;

      result.push({
        id: 'hn-' + story.id,
        title,
        source: new URL(url).hostname.replace(/^www\./, ''),
        summary: '',
        url,
        publishedAt: new Date(story.time * 1000).toISOString(),
        category: titleCategory(title, 'Technology'),
      });
    }
    return result.slice(0, 10);
  } catch {
    return [];
  }
}

export async function GET() {
  const groups = await Promise.all(feeds.map(loadFeed));
  let articles: Article[] = [];
  let liveSources = 0;

  for (const group of groups) {
    if (group.length > 0) liveSources += 1;
    articles = articles.concat(group);
  }
  if (articles.length < 15) articles = articles.concat(await backupStories());

  const seen = new Set<string>();
  const limits: { [key: string]: number } = {
    Business: 25, Startups: 22, Markets: 18, Economy: 13, Technology: 15, World: 22,
  };
  const counts: { [key: string]: number } = {};

  articles.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  articles = articles.filter(article => {
    const key = article.title.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seen.has(key)) return false;
    if ((counts[article.category] || 0) >= limits[article.category]) return false;
    seen.add(key);
    counts[article.category] = (counts[article.category] || 0) + 1;
    return true;
  }).slice(0, 95);

  if (!articles.length) {
    return NextResponse.json({
      connected: false,
      articles: [],
      message: 'News sources are temporarily unavailable. Try Refresh news again.',
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json({
    connected: true,
    articles,
    updatedAt: new Date().toISOString(),
    sourceCount: liveSources,
    message: liveSources ? '' : 'Some global feeds are temporarily unavailable.',
  }, { headers: { 'Cache-Control': 'public, s-maxage=480, stale-while-revalidate=900' } });
}
