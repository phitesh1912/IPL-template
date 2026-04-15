import { useState, useEffect, useRef } from 'react';
import './ScoreCard.css';
import scoreData from '../data/score.json';

function ScoreCard({ data = scoreData }) {

  const hostRef = useRef(null);
  const [layout, setLayout] = useState({ scale: 1, left: 0, top: 0 });

  useEffect(() => {
    function computeLayout() {
      if (!hostRef.current) return;
      const hostRect = hostRef.current.getBoundingClientRect();
      const hostW = hostRect.width;
      const hostH = hostRect.height;
      const baseW = 1080;
      const baseH = 1920;
      const scale = Math.max(hostW / baseW, hostH / baseH);

      // Uniform cover scale: both axes zoom equally.
      // If aspect ratios differ, overflow is cropped (no black bars).
      setLayout({
        scale,
        left: (hostW - baseW * scale) / 2,
        top:  (hostH - baseH * scale) / 2,
      });
    }
    computeLayout();

    const ro = new ResizeObserver(computeLayout);
    ro.observe(hostRef.current);
    window.addEventListener('resize', computeLayout);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', computeLayout);
    };
  }, []);

  const matches = Object.values(data || {});
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

  const { batsmanstats, bowlerstats } = match;

  function parseScore(s) {
    if (!s || s === '—') return { runs: '—', overs: '' };
    const m = s.match(/^(\S+)\s*\(\s*([\d.]+)\s*\)/);
    return m ? { runs: m[1], overs: m[2] } : { runs: s, overs: '' };
  }

  const batting         = parseScore(batsmanstats.battingscore);
  const bowling         = parseScore(bowlerstats.bowlerstatsscore);
  const hasBowlingScore = !!bowlerstats.bowlerstatsscore;

  return (
    <div className="sc-host" ref={hostRef}>
      <div className="sc-canvas" style={{
        transform: `scale(${layout.scale})`,
        transformOrigin: 'top left',
        left: layout.left,
        top:  layout.top,
      }}>
        <div className="sc-bg">

          <div className="sc-title">
            <img src="/assets/score-title.png" alt="What's the Score"
              onError={e=>{e.currentTarget.style.display='none'}}/>
          </div>

          <div className={isFading ? 'sc-fade-out' : 'sc-fade-in'}>

            <div className="sc-block">
              <img className="sc-player sc-player--bat" src="/assets/batsman.png" alt=""
                onError={e=>{e.currentTarget.style.display='none'}}/>
              <div className="sc-ribbon sc-ribbon--right">
                <span className="sc-team-name">{batsmanstats.teamname}</span>
                <span className="sc-team-score">
                  {batting.runs}/{batsmanstats.battingwicket}
                  {batting.overs && <span className="sc-overs"> ({batting.overs} ov)</span>}
                </span>
              </div>
              <div className="sc-strip sc-strip--right"/>
              <div className="sc-stats sc-stats--right">
                <div className="sc-batsmen">
                  {[batsmanstats.batsman_0, batsmanstats.batsman_1].filter(Boolean).map((b,i)=>(
                    <div key={i} className="sc-batsman-row">
                      <span className="sc-batsman-name">{b.batsmanname}</span>
                      <span className="sc-batsman-runs">{b.run}</span>
                    </div>
                  ))}
                </div>
                <div className="sc-divider"/>
              </div>
            </div>

            <div className="sc-block">
              <img className="sc-player sc-player--bowl" src="/assets/bowler.png" alt=""
                onError={e=>{e.currentTarget.style.display='none'}}/>
              <div className="sc-ribbon sc-ribbon--left">
                <span className="sc-team-name">{bowlerstats.teamname}</span>
                <span className="sc-team-score">
                  {hasBowlingScore
                    ? <>{bowling.runs}/{bowlerstats.bowlerstatswicket}{bowling.overs && <span className="sc-overs"> ({bowling.overs} ov)</span>}</>
                    : 'Yet to bat'
                  }
                </span>
              </div>
              <div className="sc-strip sc-strip--left"/>
              <div className="sc-stats sc-stats--left">
                <div className="sc-bowler-row">
                  <span className="sc-bowler-name">{bowlerstats.bowler}</span>
                  <div className="sc-bowler-figs">
                    {[{l:'O',v:bowlerstats.o},{l:'M',v:bowlerstats.m},{l:'R',v:bowlerstats.r},{l:'W',v:bowlerstats.w}].map(f=>(
                      <div key={f.l} className="sc-fig">
                        <span className="sc-fig-label">{f.l}</span>
                        <span className="sc-fig-val">{f.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sc-divider"/>
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

        </div>
      </div>
    </div>
  );
}

export default ScoreCard;