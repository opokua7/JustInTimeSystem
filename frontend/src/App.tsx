import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import FloorManager from './pages/FloorManager';
import StamperJobSheet from './pages/StamperJobSheet';
import ProductionManager from './pages/ProductionManager';
import ProductOperative from './pages/ProductOperative';
import ProductEngineer from './pages/ProductEngineer';
import MarketingDirector from './pages/MarketingDirector';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/floor-manager" element={<FloorManager />} />
        <Route path="/stamper" element={<StamperJobSheet />} />
        <Route path="/production-manager" element={<ProductionManager />} />
        <Route path="/production-operative" element={<ProductOperative />} />
        <Route path="/product-engineer" element={<ProductEngineer />} />
        <Route path="/marketing-director" element={<MarketingDirector />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
