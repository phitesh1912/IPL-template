import React, { useState, useEffect, useRef } from 'react';
import './ScoreCard.css';
import scoreData from '../data/score.json';

function ScoreCard({ data = scoreData, matchId }) {
  const searchParams = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search)
    : null;
  const midQuery = searchParams ? searchParams.get('mid') : null;
  const rotateQuery = searchParams ? searchParams.get('rotate') : null;

  const rawMid = String(matchId ?? midQuery ?? '').trim();
  const normalizedMid = rawMid.toLowerCase();
  const wantsRotateAll =
    normalizedMid === 'all' ||
    normalizedMid === 'rotate' ||
    normalizedMid === '*' ||
    (rotateQuery && rotateQuery !== '0' && rotateQuery.toLowerCase() !== 'false');

  const effectiveMid = wantsRotateAll ? '' : rawMid;

  const hostRef = useRef(null);
  const [layout, setLayout] = useState({ scaleX: 1, scaleY: 1 });

  useEffect(() => {
    function computeLayout() {
      if (!hostRef.current) return;
      const { width, height } = hostRef.current.getBoundingClientRect();
      setLayout({ scaleX: width / 1080, scaleY: height / 1402 });
    }
    computeLayout();
    const ro = new ResizeObserver(computeLayout);
    ro.observe(hostRef.current);
    window.addEventListener('resize', computeLayout);
    return () => { ro.disconnect(); window.removeEventListener('resize', computeLayout); };
  }, []);

  const matches = Object.entries(data || {}).map(([key, value], idx) => ({
    ...value,
    __key: key,
    __index: idx + 1,
  }));

  const filtered = effectiveMid
    ? matches.filter((m) =>
        [m?.id, m?.__key, m?.__index].some((v) => String(v) === effectiveMid)
      )
    : matches;

  const visibleMatches = filtered.length ? filtered : matches;

  const [activeIdx, setActiveIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => { setActiveIdx(0); }, [effectiveMid]);

  useEffect(() => {
    if (visibleMatches.length <= 1) return;
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setActiveIdx(prev => (prev + 1) % visibleMatches.length);
        setIsFading(false);
      }, 350);
    }, 5000);
    return () => clearInterval(interval);
  }, [visibleMatches.length]);

  const match = visibleMatches[activeIdx];
  if (!match) return <div style={{ color: '#fff', padding: 16 }}>No scorecard data found.</div>;

  const { batsmanstats = {}, bowlerstats = {} } = match;

  function parseScore(s) {
    if (!s || s === '—') return { runs: '—', overs: '' };
    const m = String(s).match(/^(\S+)\s*\(\s*([\d.]+)\s*\)/);
    return m ? { runs: m[1], overs: m[2] } : { runs: String(s), overs: '' };
  }

  const batting = parseScore(batsmanstats.battingscore);
  const bowling = parseScore(bowlerstats.bowlerstatsscore);
  const hasBowlingScore = !!bowlerstats.bowlerstatsscore;

  return (
    <div className="sc-host" ref={hostRef}>
      <div className="sc-canvas" style={{
        transform: `scale(${layout.scaleX}, ${layout.scaleY})`,
        transformOrigin: 'top left',
        left: 0, top: 0,
      }}>
        <div className="sc-bg">
          <div className={`sc-overlay ${isFading ? 'sc-fade-out' : 'sc-fade-in'}`}>
            
            {/* ── UPPER SECTION ── */}
            <div className="sc-upper">
              
              {/* Top Red Box: Team Name */}
              <div className="sc-upper-team">
                <span>{batsmanstats.teamname}</span>
              </div>
              
              {/* Top Black Box: Score */}
              <div className="sc-upper-score">
                <span className="sc-team-score">
                  {batting.runs}/{batsmanstats.battingwicket}
                  {batting.overs && <span className="sc-overs"> ({batting.overs} ov)</span>}
                </span>
              </div>
              
            {/* Batsmen Stats */}
              <div className="sc-blue-text sc-blue-text--upper">
                {[batsmanstats.batsman_0, batsmanstats.batsman_1].filter(Boolean).map((b, i) => (
                  <React.Fragment key={i}>
                    <div className="sc-player-row">
                      <span className="sc-player-name">{b.batsmanname}</span>
                      <span className="sc-player-val">{b.run}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* ── LOWER SECTION ── */}
            <div className="sc-lower">
              
              {/* Bottom Black Box: Yet to bat */}
              <div className="sc-lower-black">
                {!hasBowlingScore && <span className="sc-yet-to-bat">Yet to bat</span>}
              </div>
              
              {/* Bottom Red Box: Team Name & Score */}
              <div className="sc-lower-red">
                <span>{bowlerstats.teamname}</span>
                {hasBowlingScore && (
                  <span className="sc-team-score" style={{ marginLeft: '15px' }}>
                    {bowling.runs}/{bowlerstats.bowlerstatswicket}
                    {bowling.overs && <span className="sc-overs"> ({bowling.overs} ov)</span>}
                  </span>
                )}
              </div>
              
              {/* Bowler Stats */}
              <div className="sc-blue-text sc-blue-text--lower">
                {hasBowlingScore && (
                  <div className="sc-bowler-grid">
                    <div className="sc-grid-headers">
                      <span className="sc-empty-header"></span>
                      <span>O</span>
                      <span>M</span>
                      <span>R</span>
                      <span>W</span>
                    </div>
                    
                    <hr className="sc-divider sc-divider--bowler" />
                    
                    <div className="sc-grid-values">
                      <span className="sc-player-name">{bowlerstats.bowler}</span>
                      <span>{bowlerstats.o}</span>
                      <span>{bowlerstats.m}</span>
                      <span>{bowlerstats.r}</span>
                      <span>{bowlerstats.w}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {visibleMatches.length > 1 && (
            <div className="sc-dots">
              {visibleMatches.map((_, i) => (
                <div key={i} className={`sc-dot${i === activeIdx ? ' sc-dot--active' : ''}`} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScoreCard;