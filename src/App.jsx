import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home';
import QuizSettings from './pages/QuizSettings';
import QuizPlay from './pages/QuizPlay';
import QuizResult from './pages/QuizResult';
import './styles/animations.css';
import './App.css'

function App() {
  return (
    <HelmetProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/settings/:slug" element={<QuizSettings />} />
            <Route path="/start/:slug" element={<QuizPlay />} />
            <Route path="/result/:slug" element={<QuizResult />} />
          </Routes>
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
