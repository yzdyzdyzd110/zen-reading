import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReadPage from './pages/ReadPage';
import WordStudyPage from './pages/WordStudyPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/read/:id" element={<ReadPage />} />
      <Route path="/vocab/:id" element={<WordStudyPage />} />
    </Routes>
  );
}
