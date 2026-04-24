import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Brands from './pages/Brands';
import Dashboard from './pages/Dashboard';
import Mentions from './pages/Mentions';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, ArcElement, Title, Tooltip, Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend
);

function Layout() {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Brands />} />
          <Route path="brands/:brandId/dashboard" element={<Dashboard />} />
          <Route path="brands/:brandId/mentions" element={<Mentions />} />
        </Route>
      </Routes>
    </Router>
  );
}
