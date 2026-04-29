import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ReadPage from './pages/ReadPage';
import ArticleSetPage from './pages/ArticleSetPage';
import WordStudyPage from './pages/WordStudyPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/read/:id" element={<ReadPage />} />
      <Route path="/read-set/:id" element={<ArticleSetPage />} />
      <Route path="/vocab/:id" element={<WordStudyPage />} />
    </Routes>
  );
}
