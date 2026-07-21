interface Props {
  value: number; // 1..5
  size?: number;
}

/** Accessible star rating (saffron). Renders full/empty stars with a text label for SR. */
export default function RatingStars({ value, size = 15 }: Props) {
  const rounded = Math.round(value);
  return (
    <span className="stars" role="img" aria-label={`Rated ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          aria-hidden="true"
          className={i <= rounded ? 'stars__on' : 'stars__off'}
        >
          <path
            d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.7 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"
            fill="currentColor"
          />
        </svg>
      ))}
    </span>
  );
}
