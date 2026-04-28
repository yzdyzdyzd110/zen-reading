interface Props {
  difficulty: number;
  max?: number;
}

export default function StarRating({ difficulty, max = 5 }: Props) {
  return (
    <div className="star-rating" title={`Difficulty: ${difficulty}/${max}`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} className={`star ${i < difficulty ? 'filled' : ''}`}>
          ★
        </span>
      ))}
    </div>
  );
}
