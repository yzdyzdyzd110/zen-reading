import { useState } from 'react';
import type { Question } from '../types';

interface Props {
  questions: Question[];
}

export default function QuestionPanel({ questions }: Props) {
  const [selected, setSelected] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const selectOption = (qId: number, optIdx: number) => {
    if (submitted) return;
    setSelected((prev) => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = () => setSubmitted(true);
  const handleReset = () => {
    setSelected({});
    setSubmitted(false);
  };

  const correctCount = questions.filter((q) => selected[q.id] === q.answer).length;

  return (
    <div className="question-panel">
      <h3 className="qp-title">Reading Questions</h3>

      {questions.map((q, qi) => {
        const userChoice = selected[q.id];
        const isCorrect = submitted && userChoice === q.answer;
        const isWrong = submitted && userChoice !== undefined && userChoice !== q.answer;

        return (
          <div key={q.id} className={`qp-item ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''}`}>
            <p className="qp-text">
              <span className="qp-num">{qi + 1}.</span> {q.text}
            </p>
            <div className="qp-options">
              {q.options.map((opt, oi) => {
                let cls = 'qp-opt';
                if (userChoice === oi) cls += ' chosen';
                if (submitted && oi === q.answer) cls += ' reveal-answer';
                return (
                  <button key={oi} className={cls} onClick={() => selectOption(q.id, oi)}>
                    {String.fromCharCode(65 + oi)}. {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="qp-actions">
        {!submitted ? (
          <button className="btn-submit" onClick={handleSubmit} disabled={Object.keys(selected).length < questions.length}>
            Submit Answers
          </button>
        ) : (
          <div className="qp-result">
            <span>
              Score: {correctCount} / {questions.length}
            </span>
            <button className="btn-reset" onClick={handleReset}>
              Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
