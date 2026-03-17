import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PortfolioPage from './PortfolioPage';
import AdminPortal from './AdminPortal';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PortfolioPage />} />
        <Route path="/admin" element={<AdminPortal />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
