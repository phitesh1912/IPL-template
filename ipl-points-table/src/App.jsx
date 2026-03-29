import { BrowserRouter, Routes, Route, useSearchParams } from 'react-router-dom';
import PointsTable from './components/PointsTable';
import ScoreCard   from './components/ScoreCard';

function HomeRoute() {
  const [searchParams] = useSearchParams();
  const mid = searchParams.get('mid');
  if (mid) return <ScoreCard mid={mid} />;
  return <PointsTable />;
}

export default function App() {
  return (
    <BrowserRouter>
      <div style={{ width:'100vw', height:'100vh' }}>
        <Routes>
          <Route path="/"             element={<HomeRoute />} />
          <Route path="/points-table" element={<PointsTable />} />
          <Route path="/score"        element={<ScoreCard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}