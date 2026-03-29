import { useState, useEffect, useRef } from 'react';
import './PointsTable.css';
import pointsData from '../data/points.json';

function PointsTable({ data = pointsData, campaignWidth = '80%' }) {
  const hostRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    function computeScale() {
      if (!hostRef.current) return;
      const hostW = hostRef.current.clientWidth;
      const hostH = hostRef.current.clientHeight;
      const fraction = parseFloat(campaignWidth) / 100;
      const BASE_W = 1920;
      const BASE_H = 1080;
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

  const allTeams = data?.groups?.flatMap(g => g.team) ?? [];
  const [teamOffset, setTeamOffset] = useState(0);
  const [isFading,   setIsFading]   = useState(false);

  const ROWS_PER_PAGE = 2;
  const pageTeams = Array.from({ length: ROWS_PER_PAGE }, (_, i) => (
    allTeams[(teamOffset + i) % (allTeams.length || 1)]
  ));

  useEffect(() => {
    if (!allTeams.length) return;
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setTeamOffset(prev => (prev + ROWS_PER_PAGE) % allTeams.length);
        setIsFading(false);
      }, 350);
    }, 2200);
    return () => clearInterval(interval);
  }, [allTeams.length]);

  const [logoError, setLogoError] = useState(false);
  const [titleError, setTitleError] = useState(false);

  return (
    <div className="pt-scale-host" ref={hostRef}>
      <div className="pt-canvas" style={{ transform:`translate(-50%, -50%) scale(${scale})` }}>
        <div className="pt-left">
          <div className="pt-glass pt-glass--pos">
            <div className="pt-titlebar">
              {titleError ? (
                <div className="pt-titlebar-fallback">
                  <span className="pt-titlebar-text">POINTS TABLE</span>
                  <span className="pt-titlebar-dot" aria-hidden="true" />
                </div>
              ) : (
                <img
                  className="pt-titlebar-img"
                  src="/assets/points-title.png"
                  alt="Points Table"
                  onError={() => setTitleError(true)}
                />
              )}
            </div>

            <div className="pt-headerbar" aria-label="Points table header">
              <div className="pt-headerbar-cell pt-headerbar-cell--team">TEAM</div>
              <div className="pt-headerbar-cell">PLD</div>
              <div className="pt-headerbar-cell">W</div>
              <div className="pt-headerbar-cell">L</div>
              <div className="pt-headerbar-cell">PTS</div>
            </div>

            <div className={`pt-banners ${isFading ? 'fade-out' : 'fade-in'}`}>
              {pageTeams.filter(Boolean).map((team, index) => (
                <div
                  key={team?.id ?? `${team?.name}-${index}`}
                  className={`pt-banner ${index % 2 === 0 ? 'pt-banner--light' : 'pt-banner--dark'}`}
                >
                  <div className="pt-banner-team">{team?.name ?? '—'}</div>
                  <div className="pt-banner-stats">
                    <div className="pt-banner-stat">{team?.games ?? '—'}</div>
                    <div className="pt-banner-stat">{team?.won ?? '—'}</div>
                    <div className="pt-banner-stat">{team?.lost ?? '—'}</div>
                    <div className="pt-banner-stat">{team?.points ?? '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-right" aria-label="Branding panel">
          <div className="pt-branding-block">
            <div className="pt-branding-label">brought to you by</div>
            {logoError ? (
              <div className="pt-branding-logo-fallback" aria-label="Times OOH">
                TIMES OOH
              </div>
            ) : (
              <img
                className="pt-branding-logo"
                src="/assets/times-ooh-logo.png"
                alt="Times OOH"
                onError={() => setLogoError(true)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PointsTable;