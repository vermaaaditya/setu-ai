import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CommandLayout from './components/CommandLayout';
import HQRoute from './pages/HQRoute';
import FieldResponderRoute from './pages/FieldResponderRoute';
import CivilianPublicRoute from './pages/CivilianPublicRoute';
import AnalyticsRoute from './pages/AnalyticsRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CommandLayout />}>
          <Route index element={<Navigate to="/hq" replace />} />
          <Route path="hq" element={<HQRoute />} />
          <Route path="responder" element={<FieldResponderRoute />} />
          <Route path="civilian" element={<CivilianPublicRoute />} />
          <Route path="analytics" element={<AnalyticsRoute />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
