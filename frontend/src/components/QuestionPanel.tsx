import type { Question } from '../types';

interface Props {
  questions: Question[];
  selected: Record<number, number>;
  onChange: (qId: number, optIdx: number) => void;
  disabled?: boolean;
}

export default function QuestionPanel({ questions, selected, onChange, disabled }: Props) {
  return (
    <div className="question-panel">
      <h3 className="qp-title">Reading Questions</h3>

      {questions.map((q, qi) => {
        const userChoice = selected[q.id];

        return (
          <div key={q.id} className="qp-item">
            <p className="qp-text">
              <span className="qp-num">{qi + 1}.</span> {q.text}
            </p>
            <div className="qp-options">
              {q.options.map((opt, oi) => {
                let cls = 'qp-opt';
                if (userChoice === oi) cls += ' chosen';
                return (
                  <button key={oi} className={cls} onClick={() => !disabled && onChange(q.id, oi)}>
                    {String.fromCharCode(65 + oi)}. {opt}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
