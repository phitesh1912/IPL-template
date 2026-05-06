import { useEffect } from 'react';
import PointsTable from './components/PointsTable';
import ScoreCard   from './components/ScoreCard';
import { getPageZoomFactor } from './utils/pageZoom';

/*
  URL PARAMS
  ──────────────────────────────────────────────
  ?mid=5711             → ScoreCard for that match ID
  ?view=points          → PointsTable view
  ?width=80             → template occupies 80% of screen width
  ?scoreHeight=75       → ScoreCard takes 75% height, campaign area gets 25%
  (no params)           → ScoreCard (rotates all matches)

  Examples:
  /                              → ScoreCard (rotates all matches)
  /?width=50                     → PointsTable 50%
  /?view=points                   → PointsTable 100%
  /?mid=7049                     → ScoreCard 100% height
  /?mid=7049&width=80            → ScoreCard at 80% width, 100% height
  /?mid=7049&scoreHeight=75      → ScoreCard at 75% height + campaign area
  ──────────────────────────────────────────────
*/

function getParams() {
  const p = new URLSearchParams(window.location.search);
  return {
    mid          : p.get('mid') || null,
    view         : (p.get('view') || '').toLowerCase(),
    campaignWidth: p.get('width') ? `${p.get('width')}%` : '100%',
    scoreHeight  : p.get('scoreHeight') ? Number(p.get('scoreHeight')) : 100,
  };
}

const MIN_ZOOM_PERCENT = 25;
const MAX_ZOOM_PERCENT = 400;
const ZOOM_STEP_PERCENT = 10;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clampZoomPercent(value) {
  if (!Number.isFinite(value)) return 100;
  return clamp(Math.round(value), MIN_ZOOM_PERCENT, MAX_ZOOM_PERCENT);
}

function readZoomPercent() {
  return clampZoomPercent(getPageZoomFactor() * 100);
}

function writeZoomPercent(value) {
  if (typeof document === 'undefined') return;
  document.body.style.zoom = `${clampZoomPercent(value)}%`;
}

export default function App() {
  const { mid, view, campaignWidth, scoreHeight } = getParams();
  const showPointsTable = view === 'points' || view === 'table';

  useEffect(() => {
    function adjustZoom(delta) {
      const nextZoom = readZoomPercent() + delta;
      writeZoomPercent(nextZoom);
    }

    function onKeyDown(event) {
      const isAccel = event.ctrlKey || event.metaKey;
      if (!isAccel) return;

      if (event.key === '+' || event.key === '=' || event.key === 'Add') {
        event.preventDefault();
        adjustZoom(ZOOM_STEP_PERCENT);
      } else if (event.key === '-' || event.key === '_' || event.key === 'Subtract') {
        event.preventDefault();
        adjustZoom(-ZOOM_STEP_PERCENT);
      } else if (event.key === '0') {
        event.preventDefault();
        writeZoomPercent(100);
      }
    }

    function onWheel(event) {
      if (!event.ctrlKey) return;

      event.preventDefault();
      const delta = event.deltaY < 0 ? ZOOM_STEP_PERCENT : -ZOOM_STEP_PERCENT;
      adjustZoom(delta);
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('wheel', onWheel);
    };
  }, []);

  return (
    <div className="app-viewport" style={{
      width: campaignWidth,
      height: '100vh',
      overflow: 'auto',
      background: '#000',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {showPointsTable ? (
        <PointsTable campaignWidth={campaignWidth} />
      ) : (
        <>
          {/* ScoreCard container — takes scoreHeight % of the viewport */}
          <div style={{
            width: '100%',
            height: `${scoreHeight}%`,
            minHeight: 0,
            overflow: 'hidden',
          }}>
            <ScoreCard matchId={mid || undefined} />
          </div>

          {/* Campaign area — fills remaining space (only if scoreHeight < 100) */}
          {scoreHeight < 100 && (
            <div style={{
              width: '100%',
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#111',
            }}>
              {/* Campaign / ad content goes here */}
            </div>
          )}
        </>
      )}
    </div>
  );
}