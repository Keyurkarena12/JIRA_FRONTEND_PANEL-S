import { Link } from 'react-router-dom';

const Logo = ({ showText = true, size = 'md', variant = 'default' }) => {
  const boxSize = size === 'sm' ? 'w-9 h-9' : 'w-10 h-10';
  const iconSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  const textSize = size === 'sm' ? 'text-xl' : 'text-2xl';
  const textClass =
    variant === 'light'
      ? `${textSize} font-bold text-white`
      : `${textSize} font-bold bg-gradient-to-r from-[var(--brand-primary)] to-[var(--brand-secondary)] bg-clip-text text-transparent`;

  return (
    <Link to="/" className="flex items-center gap-3 group shrink-0" aria-label="Jira Lite home">
      <div
        className={`${boxSize} bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow duration-300`}
      >
        <svg className={`${iconSize} text-white`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      {showText && (
        <span className={textClass}>
          Jira Lite
        </span>
      )}
    </Link>
  );
};

export default Logo;
