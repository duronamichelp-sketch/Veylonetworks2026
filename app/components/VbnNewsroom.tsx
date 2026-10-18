'use client';

import { useMemo, useState } from 'react';

export type VbnCategory =
  | 'Business'
  | 'Startups'
  | 'Markets'
  | 'Economy'
  | 'Technology'
  | 'World';

export type VbnArticle = {
  id: string;
  title: string;
  source: string;
  summary: string;
  url: string;
  imageUrl?: string;
  publishedAt: string;
  category?: VbnCategory;
};

type Props = {
  articles: VbnArticle[];
  loading: boolean;
  message: string;
  updatedAt: string;
  onRefresh: () => void | Promise<void>;
};

type Topic = VbnCategory | 'All';

const TOPICS: Topic[] = ['Startups', 'Technology', 'Business', 'Markets', 'Economy', 'World', 'All'];

function articleDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recent';
  return date.toLocaleString('en-IE', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }) + ' UTC';
}

function relativeDate(value: string): string {
  const date = new Date(value);
  const elapsed = Date.now() - date.getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0) return articleDate(value);
  const minutes = Math.round(elapsed / 60_000);
  if (minutes < 60) return minutes < 2 ? 'Just now' : minutes + 'm ago';
  const hours = Math.round(elapsed / 3_600_000);
  if (hours < 24) return hours + 'h ago';
  const days = Math.round(elapsed / 86_400_000);
  return days < 8 ? days + 'd ago' : articleDate(value);
}

function PublisherMeta({ article }: { article: VbnArticle }) {
  return (
    <div className="vbnPublisherMeta">
      <span className="vbnPublisher">{article.source}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={article.publishedAt} title={articleDate(article.publishedAt)}>
        {relativeDate(article.publishedAt)}
      </time>
    </div>
  );
}

function StoryLink({
  article,
  children,
  className,
}: {
  article: VbnArticle;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      className={className}
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      title={'Read original story from ' + article.source}
    >
      {children}
    </a>
  );
}

function LeadStory({ article }: { article: VbnArticle }) {
  return (
    <article className={'vbnLeadStory glass ' + (article.imageUrl ? 'hasPhoto' : '')}>
      {article.imageUrl && (
        <img
          className="vbnLeadPhoto"
          src={article.imageUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="vbnLeadOverlay" />
      <div className="vbnLeadContent">
        <div className="vbnLeadEyebrow">
          <span className="vbnStoryDot" />
          LEAD STORY <span className="vbnLeadDivider">/</span> {article.category || 'Business'}
        </div>
        <h2>
          <StoryLink article={article}>{article.title}</StoryLink>
        </h2>
        {article.summary && <p className="vbnLeadExcerpt">{article.summary}</p>}
        <PublisherMeta article={article} />
        <StoryLink className="vbnReadStory" article={article}>
          Read full report <span aria-hidden="true">↗</span>
        </StoryLink>
      </div>
    </article>
  );
}

function SpotlightStory({ article }: { article: VbnArticle }) {
  return (
    <article className="vbnSpotlight glass">
      {article.imageUrl && (
        <StoryLink article={article} className="vbnSpotlightMedia">
          <img src={article.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
        </StoryLink>
      )}
      <div className="vbnSpotlightBody">
        <span className="vbnSectionLabel">{article.category || 'News'}</span>
        <h3><StoryLink article={article}>{article.title}</StoryLink></h3>
        <PublisherMeta article={article} />
      </div>
    </article>
  );
}

function StoryRow({ article }: { article: VbnArticle }) {
  return (
    <article className="vbnStoryRow">
      <div className="vbnStoryRowCopy">
        <span className="vbnSectionLabel">{article.category || 'News'}</span>
        <h3><StoryLink article={article}>{article.title}</StoryLink></h3>
        {article.summary && <p>{article.summary}</p>}
        <PublisherMeta article={article} />
      </div>
      {article.imageUrl && (
        <StoryLink article={article} className="vbnStoryThumbnail">
          <img src={article.imageUrl} alt="" loading="lazy" referrerPolicy="no-referrer" />
        </StoryLink>
      )}
    </article>
  );
}

function LatestList({ articles }: { articles: VbnArticle[] }) {
  if (!articles.length) return null;
  return (
    <aside className="vbnLatestPanel glass" aria-label="Latest headlines">
      <div className="vbnAsideHeading">
        <span className="vbnStoryDot" />
        <h3>Latest headlines</h3>
      </div>
      <div className="vbnLatestList">
        {articles.map((article, index) => (
          <article className="vbnLatestItem" key={article.id}>
            <span className="vbnLatestNumber">{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h4><StoryLink article={article}>{article.title}</StoryLink></h4>
              <PublisherMeta article={article} />
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}

const DESKS: Array<{
  eyebrow: string;
  title: string;
  topics: VbnCategory[];
  explore: Topic;
}> = [
  {
    eyebrow: 'COMPANIES · FINANCE · ECONOMY',
    title: 'Business & markets',
    topics: ['Business', 'Markets', 'Economy'],
    explore: 'Business',
  },
  {
    eyebrow: 'FOUNDERS · FUNDING · INNOVATION',
    title: 'Startups & technology',
    topics: ['Startups', 'Technology'],
    explore: 'Startups',
  },
  {
    eyebrow: 'THE GLOBAL DESK',
    title: 'World news',
    topics: ['World'],
    explore: 'World',
  },
];

export default function VbnNewsroom({
  articles,
  loading,
  message,
  updatedAt,
  onRefresh,
}: Props) {
  const [activeTopic, setActiveTopic] = useState<Topic>('Startups');
  const [search, setSearch] = useState('');
  const [moreVisible, setMoreVisible] = useState(false);
  const [topicSwitch, setTopicSwitch] = useState(0);
  const term = search.trim().toLocaleLowerCase();

  const filtered = useMemo(
    () => articles.filter(article => {
      if (activeTopic !== 'All' && !(activeTopic === 'Startups' ? article.category === 'Startups' || article.category === 'Technology' : article.category === activeTopic)) return false;
      if (term && ![article.title, article.source, article.summary, article.category || '']
        .some(value => value.toLowerCase().includes(term))) {
        return false;
      }
      return true;
    }),
    [articles, activeTopic, term]
  );

  const lead = filtered.find(article => activeTopic === 'Startups' ? article.category === 'Startups' : article.category === activeTopic) || filtered[0];

  const secondary = filtered
    .filter(article => article.id !== lead?.id)
    .sort((a, b) => {
      const priority = (article: VbnArticle) =>
        article.category === 'World' || article.category === 'Startups' ? 1 : 0;
      return priority(b) - priority(a) || Date.parse(b.publishedAt) - Date.parse(a.publishedAt);
    })
    .slice(0, 2);

  const featured = new Set([lead?.id, ...secondary.map(article => article.id)]);
  const latest = filtered.filter(article => !featured.has(article.id)).slice(0, 7);
  const placed = new Set([lead?.id, ...secondary.map(article => article.id), ...latest.map(article => article.id)]);
  const deskPool = filtered.filter(article => !placed.has(article.id));

  const sections = DESKS.map(desk => ({
    ...desk,
    stories: deskPool.filter(article => desk.topics.includes(article.category || 'Business')).slice(0, 5),
  }));
  const sectionIds = new Set(sections.flatMap(section => section.stories.map(article => article.id)));
  const remaining = deskPool.filter(article => !sectionIds.has(article.id));
  const showAllSections = activeTopic === 'All' && !term;
  const lowerStories = showAllSections ? remaining : deskPool;
  const visibleLower = moreVisible ? lowerStories : lowerStories.slice(0, 14);

  return (
    <section className="vbnNewsroom" aria-label="Veylo Business News">
      <header className="vbnNewsroomHeader">
        <div className="vbnNewsroomBrand">
          <div className="vbnMastheadMark">VBN<span className="vbnMarkPeriod">.</span></div>
          <span className="vbnMobileBrandText">Veylo Business News</span>
          <div>
            <span className="vbnKicker">VEYLO NETWORKS / NEWSROOM</span>
            <h1>{activeTopic === 'Startups' ? 'The founder’s briefing.' : 'Business. Markets. The World.'}</h1>
            <p>{activeTopic === 'Startups' ? 'Ideas, founders, funding rounds and the next generation of businesses.' : 'Your briefing on global business, technology and the stories shaping our world.'}</p>
          </div>
        </div>
        <div className="vbnNewsroomActions">
          <span className="vbnLiveStatus"><span className="vbnStoryDot" /> LATEST NEWS</span>
          <button type="button" className="secondary" onClick={onRefresh} disabled={loading}>
            {loading ? 'Updating…' : '↻ Refresh news'}
          </button>
          <span className="vbnMobileMotto">Networking <b>·</b> News <b>·</b> Progression <b>·</b> Vision</span>
        </div>
      </header>

      <div className="vbnMobileConceptIntro" aria-label="Veylo business news introduction">
        <div className="vbnConceptOrbit" aria-hidden="true"><span className="vbnConceptGlobe">◎</span></div>
        <div className="vbnConceptEyebrow"><span className="vbnStoryDot" /> GLOBAL BUSINESS INTELLIGENCE</div>
        <h2>Business moves.<br /><span>Stay ahead.</span></h2>
        <p>The latest startup, technology and global business stories in one place.</p>
        <div className="vbnConceptPills"><span>● LIVE UPDATES</span><span>STARTUP FIRST</span></div>
      </div>
      {message && <p className="vbnStatus" role="status">{message}</p>}

      {articles.length > 0 && (
        <>
          <div className="vbnHeadlineStrip" aria-label="Top headlines">
            <span className="vbnStripTag">BREAKING / VBN</span>
            <div className="vbnStripScroll">
              {articles.slice(0, 8).map(article => (
                <StoryLink article={article} className="vbnStripHeadline" key={article.id}>
                  {article.title}
                </StoryLink>
              ))}
            </div>
          </div>

          <div className="vbnBrowseBar">
            <div className="vbnFilters" role="group" aria-label="News categories">
              {TOPICS.map(topic => {
                const count = topic === 'All' ? articles.length
                  : articles.filter(article => topic === 'Startups' ? article.category === 'Startups' || article.category === 'Technology' : article.category === topic).length;
                return (
                  <button
                    key={topic}
                    type="button"
                    className={activeTopic === topic ? 'vbnFilter active' : 'vbnFilter'}
                    aria-pressed={activeTopic === topic}
                    onClick={() => {
                      setActiveTopic(topic);
                      setMoreVisible(false);
                      setTopicSwitch(value => value + 1);
                    }}
                  >
                    {topic}
                    <span className="vbnTopicCount">{count}</span>
                  </button>
                );
              })}
            </div>
            <label className="vbnSearchLabel">
              <span className="vbnSearchIcon" aria-hidden="true">⌕</span>
              <input
                aria-label="Search news headlines"
                placeholder="Search headlines"
                type="search"
                value={search}
                onChange={event => {
                  setSearch(event.target.value);
                  setMoreVisible(false);
                }}
              />
            </label>
          </div>

          <div className="vbnIssueLine">
            <span>{filtered.length} {filtered.length === 1 ? 'story' : 'stories'} available</span>
            <span>
              {updatedAt
                ? 'Latest feed update · ' + articleDate(updatedAt)
                : 'Headlines from independent news sources'}
            </span>
          </div>
        </>
      )}

      {loading && articles.length === 0 ? (
        <div className="vbnLoading glass" role="status">
          <span className="vbnLoadingPulse" />
          <h2>Preparing your global briefing...</h2>
          <p>Fetching today&apos;s business, startup, financial and world headlines.</p>
        </div>
      ) : articles.length === 0 ? (
        <div className="vbnLoading glass">
          <h2>Headlines temporarily unavailable</h2>
          <p>Our free news sources did not respond. Please try refreshing in a moment.</p>
          <button type="button" className="secondary" onClick={onRefresh} disabled={loading}>
            Try again
          </button>
        </div>
      ) : !lead ? (
        <div className="vbnLoading glass">
          <h2>No matching headlines</h2>
          <p>Try another topic or search term to browse the latest news.</p>
          <button
            type="button"
            className="secondary"
            onClick={() => { setActiveTopic('All'); setSearch(''); setTopicSwitch(value => value + 1); }}
          >
            Show all news
          </button>
        </div>
      ) : (
        <>
          <div className="vbnTopNewsLayout vbnAnimatedEntrance" key={activeTopic + "-" + topicSwitch}>
            <div className="vbnTopMain">
              <LeadStory article={lead} />
              {secondary.length > 0 && (
                <div className="vbnSpotlightGrid">
                  {secondary.map(article => <SpotlightStory article={article} key={article.id} />)}
                </div>
              )}
            </div>
            <LatestList articles={latest} />
          </div>

          {showAllSections && sections.map(section => (
            section.stories.length > 0 && (
              <section className="vbnDeskSection" key={section.title}>
                <div className="vbnDeskHeading">
                  <div>
                    <span className="vbnSectionLabel">{section.eyebrow}</span>
                    <h2>{section.title}</h2>
                  </div>
                  <button
                    className="vbnViewAll"
                    type="button"
                    onClick={() => { setActiveTopic(section.explore); setMoreVisible(true); }}
                  >
                    View {section.explore.toLowerCase()} <span aria-hidden="true">→</span>
                  </button>
                </div>
                <div className="vbnDeskStories">
                  {section.stories.map(article => <StoryRow article={article} key={article.id} />)}
                </div>
              </section>
            )
          ))}

          {lowerStories.length > 0 && (
            <section className="vbnDeskSection vbnMoreSection">
              <div className="vbnDeskHeading">
                <div>
                  <span className="vbnSectionLabel">MORE FROM THE WIRE</span>
                  <h2>{showAllSections ? 'More headlines' : 'All ' + activeTopic.toLowerCase() + ' headlines'}</h2>
                </div>
              </div>
              <div className="vbnMoreGrid">
                {visibleLower.map(article => (
                  <article className="glass vbnMoreCard" key={article.id}>
                    <span className="vbnSectionLabel">{article.category || 'News'}</span>
                    <h3><StoryLink article={article}>{article.title}</StoryLink></h3>
                    {article.summary && <p>{article.summary}</p>}
                    <PublisherMeta article={article} />
                  </article>
                ))}
              </div>
              {lowerStories.length > visibleLower.length && (
                <button
                  type="button"
                  className="secondary vbnLoadMore"
                  onClick={() => setMoreVisible(true)}
                >
                  Show more headlines ({lowerStories.length - visibleLower.length} remaining)
                </button>
              )}
            </section>
          )}

          <footer className="vbnNewsroomFooter">
            <span className="vbnMastheadMark">VBN<span className="vbnMarkPeriod">.</span></span>
            <div>
              <strong>Reporting belongs to the original publishers.</strong>
              <p>
                Veylo displays attributed headlines and short feed excerpts from freely
                available sources. Select any story to read the full report from its publisher.
                Headlines update periodically and may be delayed.
              </p>
            </div>
          </footer>
        </>
      )}
    </section>
  );
}
