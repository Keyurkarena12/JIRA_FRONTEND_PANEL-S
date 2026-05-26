import { motion } from 'framer-motion';

const AuthCard = ({ title, subtitle, children, footer }) => (
  <div className="auth-card">
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-8">
        <h1 className="text-2xl sm:text-[1.75rem] font-bold text-[var(--text-primary)] tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-[var(--text-secondary)] text-[15px] leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>
      {children}
      {footer && <div className="mt-8 pt-6 border-t border-[var(--surface-border)]">{footer}</div>}
    </motion.div>
  </div>
);

export const AuthDivider = () => (
  <div className="flex items-center gap-4 my-7">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--surface-border)] to-transparent" />
    <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
      or continue with
    </span>
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-[var(--surface-border)] to-transparent" />
  </div>
);

export default AuthCard;
