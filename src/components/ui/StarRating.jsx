import { Star } from 'lucide-react';

/**
 * Interactive or display-only star rating.
 * @param {number} value - Current rating
 * @param {function} onChange - If provided, makes it interactive
 * @param {number} max - Max stars (default 5)
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export default function StarRating({
  value = 0,
  onChange,
  max = 5,
  size = 'md',
}) {
  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
  };
  const gapMap = { sm: 'gap-0.5', md: 'gap-1', lg: 'gap-1.5' };
  const iconSize = sizeMap[size] || sizeMap.md;
  const gap = gapMap[size] || gapMap.md;
  const isInteractive = !!onChange;

  return (
    <div className={`flex items-center ${gap}`}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= value;

        return (
          <button
            key={i}
            type="button"
            disabled={!isInteractive}
            onClick={() => isInteractive && onChange(starValue)}
            className={`transition-all ${
              isInteractive
                ? 'cursor-pointer hover:scale-110'
                : 'cursor-default'
            } disabled:cursor-default`}
          >
            <Star
              className={`${iconSize} transition-colors ${
                isFilled
                  ? 'text-yellow-500 fill-yellow-500'
                  : 'text-surface-300'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
