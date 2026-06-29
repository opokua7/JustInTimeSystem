import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import FloorManager from './pages/FloorManager';
import StamperJobSheet from './pages/StamperJobSheet';
import ProductionManager from './pages/ProductionManager';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/floor-manager" element={<FloorManager />} />
        <Route path="/stamper" element={<StamperJobSheet />} />
        <Route path="/production-manager" element={<ProductionManager />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;