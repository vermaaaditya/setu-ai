import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import CommandLayout from './components/CommandLayout';
import HQRoute from './pages/HQRoute';
import FieldResponderRoute from './pages/FieldResponderRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CommandLayout />}>
          <Route index element={<Navigate to="/hq" replace />} />
          <Route path="hq" element={<HQRoute />} />
          <Route path="responder" element={<FieldResponderRoute />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
