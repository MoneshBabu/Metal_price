import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomeScreen } from './screens/HomeScreen';
import { DetailsScreen } from './screens/DetailsScreen';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-zinc-50 font-sans">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/details/:id" element={<DetailsScreen />} />
        </Routes>
      </div>
    </Router>
  );
}
