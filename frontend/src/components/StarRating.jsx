export default function StarRating({ value = 0, onChange, readOnly = false, size = 'md' }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`star-rating star-${size}`} role={readOnly ? 'img' : 'group'} aria-label={`${value} of 5 stars`}>
      {stars.map((star) => {
        const active = star <= value;
        if (readOnly) {
          return (
            <span key={star} className={`star ${active ? 'active' : ''}`}>
              ★
            </span>
          );
        }
        return (
          <button
            key={star}
            type="button"
            className={`star-btn ${active ? 'active' : ''}`}
            onClick={() => onChange?.(star)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
