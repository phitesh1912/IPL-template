import { useState, useEffect, useRef } from 'react';
import './PointsTable.css';
import pointsData from '../data/points.json';

function PointsTable({ data = pointsData }) {

  const hostRef = useRef(null);
  const [layout, setLayout] = useState({ scaleX: 1, scaleY: 1, left: 0, top: 0 });

  useEffect(() => {
    function computeLayout() {
      if (!hostRef.current) return;
      const hostRect = hostRef.current.getBoundingClientRect();
      const hostW = hostRect.width;
      const hostH = hostRect.height;
      const baseW = 1080;
      const baseH = 1920;
      const scaleX = hostW / baseW;
      const scaleY = hostH / baseH;

      // Full-viewport stretch scale: template fills host completely.
      // Keeps the full template visible with no letterboxing.
      setLayout({
        scaleX,
        scaleY,
        left: 0,
        top: 0,
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

  const allTeams = data?.groups?.flatMap(g => g.team) ?? [];
  const [teamOffset, setTeamOffset] = useState(0);
  const [isFading,   setIsFading]   = useState(false);

  const twoTeams = [
    allTeams[teamOffset % allTeams.length],
    allTeams[(teamOffset + 1) % allTeams.length],
  ];

  useEffect(() => {
    if (!allTeams.length) return;
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setTeamOffset(prev => (prev + 2) % allTeams.length);
        setIsFading(false);
      }, 350);
    }, 2200);
    return () => clearInterval(interval);
  }, [allTeams.length]);

  return (
    <div className="pt-host" ref={hostRef}>
      <div className="pt-canvas" style={{
        transform: `scale(${layout.scaleX}, ${layout.scaleY})`,
        transformOrigin: 'top left',
        left: layout.left,
        top: layout.top,
      }}>
        <div className="pt-left">
          <div className="pt-glass">

            <div className="pt-title">
              <img src="/assets/points-title.png" alt="Points Table"
                onError={e=>{e.currentTarget.style.display='none'}}/>
            </div>

            <div className="pt-header">
              <div className="pt-header-cell">TEAM</div>
              <div className="pt-header-cell">PLD</div>
              <div className="pt-header-cell">W</div>
              <div className="pt-header-cell">L</div>
              <div className="pt-header-cell">PTS</div>
            </div>

            <div className={`pt-rows ${isFading?'fade-out':'fade-in'}`}>
              {twoTeams.map((team, index) => (
                <div key={team?.id ?? index}
                  className={`pt-row ${index%2===0
                    ? 'pt-row--blue pt-row--skew-right'
                    : 'pt-row--navy pt-row--skew-left'}`}>
                  <div className="pt-row-cell">{team?.name}</div>
                  <div className="pt-row-cell">{team?.games}</div>
                  <div className="pt-row-cell">{team?.won}</div>
                  <div className="pt-row-cell">{team?.lost}</div>
                  <div className="pt-row-cell">{team?.points}</div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default PointsTable;