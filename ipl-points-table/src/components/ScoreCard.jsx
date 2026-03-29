import { useState, useEffect, useRef } from 'react';
import './ScoreCard.css';
import scoreData from '../data/score.json';

function ScoreCard({ data = scoreData, campaignWidth = '80%', mid }) {

  const hostRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function computeScale() {
      if (!hostRef.current) return;
      const hostW = hostRef.current.clientWidth;
      const hostH = hostRef.current.clientHeight;
      const fraction = parseFloat(campaignWidth) / 100;
      const BASE_W = 1080;
      const BASE_H = 1920;
      const fit = Math.min(hostW / BASE_W, hostH / BASE_H);
      const cover = Math.max(hostW / BASE_W, hostH / BASE_H);
      const base = fraction >= 0.999 ? cover : fit;
      setScale(base * fraction);
    }
    computeScale();
    const ro = new ResizeObserver(computeScale);
    ro.observe(hostRef.current);
    return () => ro.disconnect();
  }, [campaignWidth]);

  const matches = mid && data?.[mid] ? [data[mid]] : Object.values(data || {});
  const [activeIdx, setActiveIdx] = useState(0);
  const [isFading,  setIsFading]  = useState(false);

  useEffect(() => {
    if (matches.length <= 1) return;
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setActiveIdx(prev => (prev + 1) % matches.length);
        setIsFading(false);
      }, 350);
    }, 5000);
    return () => clearInterval(interval);
  }, [matches.length]);

  const match = matches[activeIdx];
  if (!match) return null;

  const { batsmanstats, bowlerstats, name } = match;

  function parseScore(s) {
    if (!s || s === '—') return { runs: '—', overs: '' };
    const m = s.match(/^(\S+)\s*\(\s*([\d.]+)\s*\)/);
    return m ? { runs: m[1], overs: m[2] } : { runs: s, overs: '' };
  }

  const batting         = parseScore(batsmanstats.battingscore);
  const bowling         = parseScore(bowlerstats.bowlerstatsscore);
  const hasBowlingScore = !!bowlerstats.bowlerstatsscore;

  return (
    <div className="sc-scale-host" ref={hostRef}>
      <div className="sc-canvas" style={{ transform:`translate(-50%, -50%) scale(${scale})` }}>
        <div className="sc-bg">

          <img className="sc-player-bat"  src="/assets/batsman.png" alt=""
            onError={e=>{e.currentTarget.style.display='none'}}/>
          <img className="sc-player-bowl" src="/assets/bowler.png"  alt=""
            onError={e=>{e.currentTarget.style.display='none'}}/>

          <div className="sc-title">
            <img src="/assets/score-title.png" alt="What's the Score"
              onError={e=>{e.currentTarget.style.display='none'}}/>
          </div>

          <div className="sc-glass">
            <div className="sc-match-name">{name}</div>

            <div className={isFading ? 'sc-fade-out' : 'sc-fade-in'}>

              {/* BATTING TEAM */}
              <div className="sc-team-block">
                <div className="sc-ribbon">
                  <span className="sc-team-name">{batsmanstats.teamname}</span>
                  <div className="sc-score">
                    <span className="sc-score-runs">{batting.runs}</span>
                    <span className="sc-score-wkt">/{batsmanstats.battingwicket}</span>
                    {batting.overs && <span className="sc-score-ov">({batting.overs} ov)</span>}
                  </div>
                </div>
                <div className="sc-stats-row sc-stats-row--blue">
                  <div className="sc-batsmen">
                    {[batsmanstats.batsman_0, batsmanstats.batsman_1].filter(Boolean).map((b,i)=>(
                      <div key={i} className="sc-batsman">
                        <span className="sc-batsman-name">{b.batsmanname}</span>
                        <span className="sc-batsman-runs">{b.run}</span>
                      </div>
                    ))}
                  </div>
                  <div className="sc-bowler">
                    <span className="sc-bowler-label">Bowling</span>
                    <span className="sc-bowler-name">{bowlerstats.bowler}</span>
                    <div className="sc-bowler-figures">
                      {[{l:'O',v:bowlerstats.o},{l:'M',v:bowlerstats.m},{l:'R',v:bowlerstats.r},{l:'W',v:bowlerstats.w}].map(f=>(
                        <div key={f.l} className="sc-bowler-fig">
                          <span className="sc-fig-label">{f.l}</span>
                          <span className="sc-fig-val">{f.v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* BOWLING TEAM */}
              <div className="sc-team-block">
                <div className="sc-ribbon">
                  <span className="sc-team-name">{bowlerstats.teamname}</span>
                  <div className="sc-score">
                    {hasBowlingScore ? (
                      <>
                        <span className="sc-score-runs">{bowling.runs}</span>
                        <span className="sc-score-wkt">/{bowlerstats.bowlerstatswicket}</span>
                        {bowling.overs && <span className="sc-score-ov">({bowling.overs} ov)</span>}
                      </>
                    ) : (
                      <span className="sc-score-runs" style={{fontSize:'2.4vh',opacity:0.8}}>Yet to bat</span>
                    )}
                  </div>
                </div>
                <div className="sc-stats-row sc-stats-row--navy">
                  <span className="sc-yet-to-bat">
                    {hasBowlingScore ? 'Previous innings' : 'Waiting to bat'}
                  </span>
                </div>
              </div>

            </div>

            {matches.length > 1 && (
              <div className="sc-dots">
                {matches.map((_,i)=>(
                  <div key={i} className={`sc-dot${i===activeIdx?' sc-dot--active':''}`}/>
                ))}
              </div>
            )}

            <div className="sc-branding">
              <span className="sc-branding-label">brought to you by</span>
              <img className="sc-branding-logo" src="/assets/times-ooh-logo.png" alt="Times OOH"
                onError={e=>{e.currentTarget.style.display='none'}}/>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default ScoreCard;