import { Link, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../ui/Logo';
import DashboardPreview from '../marketing/DashboardPreview';

const AuthLayout = () => (
  <div className="min-h-dvh grid lg:grid-cols-2 bg-[var(--surface-bg)]">
    <motion.div
      initial={{ opacity: 0, x: -24 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 xl:p-14 text-white"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0b1220] via-[#1e3a8a] to-[#2563eb]" />
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-16 left-8 w-80 h-80 bg-cyan-400/30 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-16 right-8 w-[28rem] h-[28rem] bg-indigo-500/40 rounded-full blur-[120px] animate-float-delayed" />
      </div>
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10">
        <Logo showText variant="light" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="text-3xl xl:text-[2.75rem] font-bold leading-[1.15] mb-5 max-w-lg"
        >
          Ship work faster with clarity your team will love.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.45 }}
          className="text-blue-100/90 text-lg leading-relaxed max-w-md mb-10"
        >
          Boards, lists, timelines, and chat — everything connected in one modern workspace.
        </motion.p>
        <DashboardPreview className="max-w-lg" />
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-3 text-center text-sm">
        {[
          { value: '5', label: 'Project views' },
          { value: 'Real-time', label: 'Team chat' },
          { value: 'Stripe', label: 'Billing built-in' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-white/[0.08] backdrop-blur-md p-4 border border-white/10">
            <p className="text-xl font-bold text-white">{stat.value}</p>
            <p className="text-blue-100/70 text-xs mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </motion.div>

    <div className="flex flex-col min-h-dvh relative">
      <div className="lg:hidden p-4 border-b border-[var(--surface-border)] bg-white/80 backdrop-blur-xl">
        <Logo size="sm" />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        <div className="w-full max-w-[440px]">
          <Outlet />
        </div>
      </div>

      <p className="text-center text-sm text-[var(--text-muted)] pb-8">
        <Link to="/" className="hover:text-[var(--brand-primary)] transition-colors font-medium">
          ← Back to home
        </Link>
      </p>
    </div>
  </div>
);

export default AuthLayout;
