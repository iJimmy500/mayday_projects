import { useState, useRef, useCallback } from 'react';
import { Zap, Sun, Dog, Circle, MousePointer2, Rabbit, Flame, Waves, Flower, Flower2 } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAries, faTaurus, faGemini, faCancer, faLeo, faVirgo, faLibra, faScorpio, faSagittarius, faCapricorn, faAquarius, faPisces } from '@fortawesome/free-solid-svg-icons';
import './Bdays.css';
import { MONTHS, TODAY, THIS_YEAR } from './constants';
import { daysInMonth, popularityLabel, worldPopulationAt, formatPopulation, getDerivedStats, getWesternZodiac, getChineseZodiac, getBirthstone, getBirthFlower } from './utils';
import { fetchWikiData, fetchMediaData, fetchWeather, fetchNews } from './api';
import DatePicker from './DatePicker';

export default function Bdays() {
  const [month,   setMonth]   = useState(TODAY.getMonth() + 1);
  const [day,     setDay]     = useState(TODAY.getDate());
  const [yearStr, setYearStr] = useState('');

  const [wikiResult,  setWikiResult]  = useState(null);
  const [mediaResult, setMediaResult] = useState(null);
  const [weather,     setWeather]     = useState(null);
  const [news,        setNews]        = useState(null);

  const [wikiLoading,  setWikiLoading]  = useState(false);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [newsLoading,    setNewsLoading]    = useState(false);
  const [error, setError] = useState('');

  const wikiReq    = useRef(0);
  const mediaReq   = useRef(0);
  const weatherReq = useRef(0);
  const newsReq    = useRef(0);

  const loadWiki = useCallback(async (m, d, y) => {
    const id = ++wikiReq.current;
    setWikiLoading(true);
    setError('');
    try {
      const data = await fetchWikiData(m, d, y);
      if (id !== wikiReq.current) return;
      setWikiResult(data);
    } catch {
      if (id === wikiReq.current)
        setError('Could not reach Wikipedia. Check your connection and try again.');
    } finally {
      if (id === wikiReq.current) setWikiLoading(false);
    }
  }, []);

  const loadMedia = useCallback(async (y, m, d) => {
    const id = ++mediaReq.current;
    setMediaLoading(true);
    try {
      const data = await fetchMediaData(y, m, d);
      if (id !== mediaReq.current) return;
      setMediaResult(data);
    } catch {
      if (id === mediaReq.current) setMediaResult(null);
    } finally {
      if (id === mediaReq.current) setMediaLoading(false);
    }
  }, []);

  const loadWeather = useCallback(async (y, m, d) => {
    const id = ++weatherReq.current;
    setWeatherLoading(true);
    try {
      const data = await fetchWeather(y, m, d);
      if (id !== weatherReq.current) return;
      setWeather(data);
    } catch {
      if (id === weatherReq.current) setWeather(null);
    } finally {
      if (id === weatherReq.current) setWeatherLoading(false);
    }
  }, []);

  const loadNews = useCallback(async (y, m, d) => {
    const id = ++newsReq.current;
    setNewsLoading(true);
    try {
      const data = await fetchNews(y, m, d);
      if (id !== newsReq.current) return;
      setNews(data);
    } catch {
      if (id === newsReq.current) setNews([]);
    } finally {
      if (id === newsReq.current) setNewsLoading(false);
    }
  }, []);

  function handleSubmit(e) {
    e.preventDefault();
    const y = parseInt(yearStr, 10);
    if (!yearStr || isNaN(y) || y < 1900 || y > THIS_YEAR) {
      setError(`Enter a year between 1900 and ${THIS_YEAR}`);
      return;
    }
    setError('');
    // Reset all results so skeletons show cleanly
    setWikiResult(null);
    setMediaResult(null);
    setWeather(null);
    setNews(null);
    // Fire all four fetches in parallel
    loadWiki(month, day, y);
    loadMedia(y, month, day);
    loadWeather(y, month, day);
    loadNews(y, month, day);
  }

  const isLoading  = wikiLoading || mediaLoading || weatherLoading || newsLoading;
  const hasResult  = !!wikiResult;
  const allMedia   = [...(mediaResult?.movies || []), ...(mediaResult?.tv || [])];
  const maxDay     = daysInMonth(month, parseInt(yearStr, 10) || THIS_YEAR);

  // Derived from wikiResult
  const birthYear  = wikiResult?.year;
  const popAtBirth = birthYear ? worldPopulationAt(birthYear) : null;
  const derivedStats = wikiResult?.daysLived
    ? getDerivedStats(wikiResult.daysLived, birthYear, wikiResult.day)
    : [];

  // Font Awesome zodiac icons
  const zodiacIcons = {
    'Aries': faAries,
    'Taurus': faTaurus,
    'Gemini': faGemini,
    'Cancer': faCancer,
    'Leo': faLeo,
    'Virgo': faVirgo,
    'Libra': faLibra,
    'Scorpio': faScorpio,
    'Sagittarius': faSagittarius,
    'Capricorn': faCapricorn,
    'Aquarius': faAquarius,
    'Pisces': faPisces,
  };

  const renderZodiacIcon = (iconName) => {
    const IconComponent = zodiacIcons[iconName];
    return IconComponent ? <FontAwesomeIcon icon={IconComponent} size="2x" /> : null;
  };

  // Icon mapping
  const iconMap = {
    Zap, Sun, Dog, Circle, MousePointer2, Rabbit, Flame, Waves, Flower, Flower2
  };

  const renderIcon = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent size={28} /> : null;
  };
  const westernZodiac = wikiResult ? getWesternZodiac(wikiResult.month, wikiResult.day) : null;
  const chineseZodiac = birthYear ? getChineseZodiac(birthYear) : null;
  const birthstone = wikiResult ? getBirthstone(wikiResult.month) : null;
  const birthFlower = wikiResult ? getBirthFlower(wikiResult.month) : null;

  return (
    <>
      {mediaResult?.apod && (
        <div
          className="bday-bg"
          style={{ backgroundImage: `url(${mediaResult.apod.hdurl || mediaResult.apod.url})` }}
        />
      )}

      <div className="bday-page">
        <div className="bday-inner">

          {/* ── Date picker ── */}
          <header className="bday-header">
            <p className="bday-eyebrow">Birthday Facts</p>
            <form className="bday-form" onSubmit={handleSubmit}>
              <div className="bday-picker-row">
                <DatePicker
                  month={month}
                  day={day}
                  onMonthChange={m => { setMonth(m); if (day > daysInMonth(m, parseInt(yearStr,10)||THIS_YEAR)) setDay(1); }}
                  onDayChange={setDay}
                  onYearChange={setYearStr}
                  maxDay={maxDay}
                />
                <button type="submit" className="bday-go-btn" disabled={isLoading}>
                  {isLoading
                    ? <span className="bday-spin" />
                    : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )
                  }
                </button>
              </div>
            </form>
            {error && <p className="bday-error">{error}</p>}
          </header>

          {/* ── Empty state ── */}
          {!hasResult && !isLoading && (
            <div className="bday-empty">
              <div className="bday-empty-glyph">✦</div>
              <p className="bday-empty-head">What's your birthday?</p>
              <p className="bday-empty-sub">
                Enter a date above — see the weather, news, movies, and history from the day you were born.
              </p>
            </div>
          )}

          {/* ── Loading skeleton ── */}
          {wikiLoading && !hasResult && (
            <div className="bday-skeleton-results">
              <div className="bday-hero">
                <div className="bday-skel" style={{ height: 11, width: 110, borderRadius: 3, marginBottom: 18 }} />
                <div className="bday-skel" style={{ height: 26, width: '68%', borderRadius: 5, marginBottom: 14 }} />
                <div className="bday-skel" style={{ height: 52, width: 72, borderRadius: 5 }} />
              </div>
              <div className="bday-stats">
                {[60, 36, 48].map((w, i) => (
                  <div key={i} className="bday-stat">
                    <div className="bday-skel" style={{ height: 20, width: w, borderRadius: 4 }} />
                    <div className="bday-skel" style={{ height: 10, width: w * 0.7, marginTop: 5, borderRadius: 3 }} />
                  </div>
                ))}
              </div>
              <div>
                <div className="bday-skel" style={{ height: 10, width: 120, borderRadius: 3, marginBottom: 12 }} />
                {[0,1,2,3].map(i => (
                  <div key={i} style={{ display:'flex', gap:12, padding:'12px 0', borderBottom:'1px solid #111118' }}>
                    <div className="bday-skel" style={{ height: 13, flex: 1, borderRadius: 3 }} />
                    <div className="bday-skel" style={{ height: 13, width: 48, borderRadius: 3 }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Results ── */}
          {hasResult && (
            <div
              className={`bday-results${wikiLoading ? ' bday-results--dim' : ''}`}
              key={`${wikiResult.month}-${wikiResult.day}-${wikiResult.year}`}
            >
              {/* Hero */}
              <section className="bday-hero">
                <span className="bday-hero-weekday">{wikiResult.dayName}</span>
                <h2 className="bday-hero-date">
                  {wikiResult.monthName} {wikiResult.day}, {wikiResult.year}
                </h2>
                {wikiResult.age !== null && (
                  <div className="bday-hero-age">
                    <span className="bday-age-num">{wikiResult.age}</span>
                    <span className="bday-age-label">years old</span>
                  </div>
                )}
              </section>

              {/* Stats */}
              <div className="bday-stats">
                {wikiResult.daysLived !== null && (
                  <>
                    <div className="bday-stat">
                      <span className="bday-stat-val">{wikiResult.daysLived.toLocaleString()}</span>
                      <span className="bday-stat-key">days lived</span>
                    </div>
                    <div className="bday-stat-rule" />
                  </>
                )}
                <div className="bday-stat">
                  <span className="bday-stat-val">{wikiResult.season.emoji}</span>
                  <span className="bday-stat-key">{wikiResult.season.name}</span>
                </div>
                <div className="bday-stat-rule" />
                <div className="bday-stat">
                  <span className="bday-stat-val">{wikiResult.daysUntil}</span>
                  <span className="bday-stat-key">days until next</span>
                </div>
              </div>

              {/* Weather */}
              {(weather || weatherLoading) && (
                <div className="bday-section">
                  <span className="bday-section-label">
                    Weather in {weather?.city || '…'}
                  </span>
                  {weatherLoading && !weather ? (
                    <div className="bday-skel" style={{ height: 56, borderRadius: 10 }} />
                  ) : weather ? (
                    <div className="bday-weather">
                      <span className="bday-weather-emoji">{weather.emoji}</span>
                      <div className="bday-weather-info">
                        <span className="bday-weather-desc">{weather.desc}</span>
                        <span className="bday-weather-temps">{weather.high} high · {weather.low} low</span>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Popularity */}
              <div className="bday-pop">
                <span className="bday-section-label">Birthday popularity</span>
                <div className="bday-pop-rank">
                  <span className="bday-pop-num">#{wikiResult.rank}</span>
                  <span className="bday-pop-of">out of 365</span>
                </div>
                <p className="bday-pop-desc">{popularityLabel(wikiResult.rank)}</p>
              </div>

              {/* World population */}
              {popAtBirth && (
                <div className="bday-section">
                  <span className="bday-section-label">World when you arrived</span>
                  <div className="bday-pop-row">
                    <div className="bday-pop-stat">
                      <span className="bday-pop-stat-val">{formatPopulation(popAtBirth)}</span>
                      <span className="bday-pop-stat-key">people on Earth in {birthYear}</span>
                    </div>
                    <div className="bday-pop-stat-rule" />
                    <div className="bday-pop-stat">
                      <span className="bday-pop-stat-val">+{formatPopulation(worldPopulationAt(THIS_YEAR) - popAtBirth)}</span>
                      <span className="bday-pop-stat-key">people since then</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Common names */}
              {wikiResult.topNames.length > 0 && (
                <div className="bday-section">
                  <span className="bday-section-label">Common names born on this day</span>
                  <div className="bday-names">
                    {wikiResult.topNames.map((n, i) => (
                      <span key={i} className="bday-name-pill">{n}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Derived life stats */}
              {derivedStats.length > 0 && (
                <div className="bday-section">
                  <span className="bday-section-label">By the numbers</span>
                  <div className="bday-derived">
                    {derivedStats.map((s, i) => (
                      <div key={i} className="bday-derived-row">
                        <span className="bday-derived-label">{s.label}</span>
                        <span className="bday-derived-val">{s.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* News headlines */}
              {(newsLoading || (news && news.length > 0)) && (
                <section className="bday-section">
                  <span className="bday-section-label">
                    Headlines from {MONTHS[wikiResult.month - 1]} {wikiResult.day}, {wikiResult.year}
                  </span>
                  {newsLoading && !news ? (
                    <div className="bday-births">
                      {[0,1,2,3].map(i => (
                        <div key={i} style={{ display:'flex', gap:12, padding:'12px 0', borderBottom:'1px solid #111118', alignItems:'center' }}>
                          <div className="bday-skel" style={{ height: 13, flex: 1, borderRadius: 3 }} />
                          <div className="bday-skel" style={{ height: 10, width: 48, borderRadius: 3 }} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bday-births">
                      {news.map((item, i) => (
                        <a
                          key={i}
                          className="bday-birth"
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ animationDelay: `${i * 35}ms` }}
                        >
                          <div className="bday-birth-info">
                            <span className="bday-birth-name">{item.title}</span>
                          </div>
                          <span className="bday-birth-year">{item.section}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Films & Shows */}
              {(allMedia.length > 0 || mediaLoading) && (
                <div className="bday-section">
                  <span className="bday-section-label">Films &amp; Shows — {wikiResult.year}</span>
                  <div className="bday-media-row">
                    {mediaLoading && !mediaResult
                      ? [0,1,2,3].map(i => <div key={i} className="bday-media-skel" />)
                      : allMedia.map((item, i) => (
                          <a
                            key={i}
                            className="bday-media-card"
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ animationDelay: `${i * 50}ms` }}
                          >
                            {item.art && <img className="bday-media-art" src={item.art} alt={item.title} loading="lazy" />}
                            <span className="bday-media-title">{item.title}</span>
                            {item.genre && (
                              <span className="bday-media-genre">
                                {item.kind === 'tv' ? 'TV · ' : ''}{item.genre}
                              </span>
                            )}
                          </a>
                        ))
                    }
                  </div>
                </div>
              )}

              {/* Zodiac & Birth Info */}
              {(westernZodiac || chineseZodiac || birthstone || birthFlower) && (
                <div className="bday-section">
                  <span className="bday-section-label">Your Signs</span>
                  <div className="bday-zodiac-grid">
                    {westernZodiac && (
                      <div className="bday-zodiac-card">
                        <span className="bday-zodiac-icon">{renderZodiacIcon(westernZodiac.name)}</span>
                        <div className="bday-zodiac-info">
                          <span className="bday-zodiac-name">{westernZodiac.name}</span>
                          <span className="bday-zodiac-type">Western Zodiac</span>
                          <span className="bday-zodiac-dates">{westernZodiac.dates}</span>
                        </div>
                      </div>
                    )}
                    {chineseZodiac && (
                      <div className="bday-zodiac-card">
                        <span className="bday-zodiac-symbol">{chineseZodiac.emoji}</span>
                        <div className="bday-zodiac-info">
                          <span className="bday-zodiac-name">{chineseZodiac.name}</span>
                          <span className="bday-zodiac-type">Chinese Zodiac</span>
                          <span className="bday-zodiac-year">Year of the {chineseZodiac.name}</span>
                        </div>
                      </div>
                    )}
                    {birthstone && (
                      <div className="bday-zodiac-card">
                        <span 
                          className="bday-zodiac-gem" 
                          style={{ backgroundColor: birthstone.color }}
                        />
                        <div className="bday-zodiac-info">
                          <span className="bday-zodiac-name">{birthstone.name}</span>
                          <span className="bday-zodiac-type">Birthstone</span>
                        </div>
                      </div>
                    )}
                    {birthFlower && (
                      <div className="bday-zodiac-card">
                        <span className="bday-zodiac-icon">{renderIcon(birthFlower.icon)}</span>
                        <div className="bday-zodiac-info">
                          <span className="bday-zodiac-name">{birthFlower.name}</span>
                          <span className="bday-zodiac-type">Birth Flower</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Historical events */}
              {wikiResult.events.length > 0 && (
                <section className="bday-section">
                  <span className="bday-section-label">On this day in history</span>
                  <ul className="bday-events">
                    {wikiResult.events.map((ev, i) => (
                      <li key={i} className="bday-event" style={{ animationDelay: `${i * 40}ms` }}>
                        <span className="bday-event-year">{ev.year}</span>
                        <span className="bday-event-text">{ev.text}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Famous births */}
              {wikiResult.births.length > 0 && (
                <section className="bday-section">
                  <span className="bday-section-label">
                    Famous people born on {wikiResult.monthName} {wikiResult.day}
                  </span>
                  <div className="bday-births">
                    {wikiResult.births.map((b, i) => {
                      const page = b.pages?.[0];
                      const name = page?.normalizedtitle || page?.title || b.text?.split(',')[0] || '';
                      const desc = page?.description || b.text?.split(',').slice(1).join(',').trim() || '';
                      const url  = page?.content_urls?.desktop?.page;
                      return (
                        <a
                          key={i}
                          className="bday-birth"
                          href={url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ animationDelay: `${i * 35}ms` }}
                        >
                          <div className="bday-birth-info">
                            <span className="bday-birth-name">{name}</span>
                            {desc && <span className="bday-birth-desc">{desc}</span>}
                          </div>
                          <span className="bday-birth-year">{b.year}</span>
                        </a>
                      );
                    })}
                  </div>
                </section>
              )}

              <a
                className="bday-wiki-link"
                href={`https://en.wikipedia.org/wiki/${wikiResult.monthName}_${wikiResult.day}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View {wikiResult.monthName} {wikiResult.day} on Wikipedia →
              </a>
            </div>
          )}

        </div>
      </div>

      <footer className="page-footer">
        <a href="https://mayinflight.com" className="footer-link" target="_blank" rel="noopener noreferrer">
          mayday <Flower size={14} strokeWidth={1.5} />
        </a>
      </footer>
    </>
  );
}
