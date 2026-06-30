import { motion } from 'framer-motion';


/**
 * Animated circular progress indicator showing the engagement score.
 * @param {number} score - Score between 0 and 100.
 * @param {string} icon - Optional emoji icon representing the category.
 */
export const ScoreProgress = ({ score = 0, icon = '' }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-36 h-36">
      <svg className="w-full h-full" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-200"
          fill="none"
        />
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          strokeLinecap="round"
          className="text-primary"
          fill="none"
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-bold text-primary">{score}</div>
        <div className="text-2xl">/ 100</div>
        {icon && <div className="mt-1 text-2xl">{icon}</div>}
      </div>
    </div>
  );
};
