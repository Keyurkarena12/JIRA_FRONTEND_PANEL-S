import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Container from '../components/ui/Container';
import DashboardPreview from '../components/marketing/DashboardPreview';

const stats = [
  { value: '5', label: 'Project views' },
  { value: 'Real-time', label: 'Team chat' },
  { value: 'Stripe', label: 'Subscriptions' },
  { value: 'OAuth', label: 'Google & GitHub' },
];

const bentoFeatures = [
  {
    title: 'Workspaces & roles',
    description: 'Invite teammates, assign roles, and manage access with plan-based limits.',
    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
    span: 'lg:col-span-2',
    accent: 'from-blue-500/10 to-indigo-500/5',
  },
  {
    title: 'Kanban boards',
    description: 'Drag-and-drop columns with priority badges and assignees.',
    icon: 'M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7',
    span: '',
    accent: 'from-violet-500/10 to-purple-500/5',
  },
  {
    title: 'List & calendar',
    description: 'Switch views without losing context — filter, sort, and plan sprints.',
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    span: '',
    accent: 'from-cyan-500/10 to-blue-500/5',
  },
  {
    title: 'Timeline view',
    description: 'See dependencies and deadlines on a visual roadmap.',
    icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
    span: '',
    accent: 'from-emerald-500/10 to-teal-500/5',
  },
  {
    title: 'Team chat',
    description: 'Real-time messaging inside every workspace — no context switching.',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
    span: 'lg:col-span-2',
    accent: 'from-amber-500/10 to-orange-500/5',
  },
  {
    title: 'Stripe billing',
    description: 'Upgrade plans seamlessly with built-in subscription management.',
    icon: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z',
    span: '',
    accent: 'from-rose-500/10 to-pink-500/5',
  },
];

const steps = [
  { step: '01', title: 'Create a workspace', text: 'Set up your team hub in seconds with a name and invite link.' },
  { step: '02', title: 'Add projects & tasks', text: 'Break work into projects, assign owners, and set priorities.' },
  { step: '03', title: 'Ship with clarity', text: 'Use boards, timelines, and chat to keep everyone aligned.' },
];

const Home = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24">
        <Container>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <span className="section-eyebrow mb-6 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] animate-pulse" />
                Modern project management
              </span>
              <h1 className="text-4xl sm:text-5xl xl:text-[3.5rem] font-extrabold text-[var(--text-primary)] tracking-tight leading-[1.08]">
                Manage your work{' '}
                <span className="gradient-text">smarter, together</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-[var(--text-secondary)] max-w-xl leading-relaxed">
                Workspaces, kanban boards, timelines, calendar, and real-time chat — one platform built for teams who want clarity without complexity.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => navigate(token ? '/workspaces' : '/register')}
                  className="btn-primary px-8 py-4 text-base min-h-[52px]"
                >
                  {token ? 'Open Workspaces' : 'Start free — no card required'}
                </button>
                <Link to="/pricing" className="btn-secondary min-h-[52px]">
                  View pricing
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3">
                {stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-lg font-bold text-[var(--text-primary)]">{s.value}</p>
                    <p className="text-sm text-[var(--text-muted)]">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative lg:pl-4"
            >
              <DashboardPreview />
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Bento features */}
      <section className="py-20 lg:py-28 border-t border-[var(--surface-border)]/60">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="section-eyebrow mb-4">Everything you need</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              One workspace. Every view.
            </h2>
            <p className="mt-4 text-[var(--text-secondary)] text-lg">
              From planning to shipping — switch perspectives without losing momentum.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
            {bentoFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.35, delay: index * 0.05 }}
                className={`card-premium group relative overflow-hidden ${feature.span}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    <svg className="w-5 h-5 text-[var(--brand-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{feature.title}</h3>
                  <p className="text-[var(--text-secondary)] text-[15px] leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-20 lg:py-24 bg-white border-y border-[var(--surface-border)]/60">
        <Container>
          <div className="text-center mb-14">
            <span className="section-eyebrow mb-4">How it works</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] tracking-tight">
              Up and running in minutes
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative text-center md:text-left"
              >
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--brand-primary)] to-[var(--brand-secondary)] text-white font-bold text-sm mb-5">
                  {item.step}
                </span>
                <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2">{item.title}</h3>
                <p className="text-[var(--text-secondary)] leading-relaxed">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <Container size="narrow">
          <div className="relative rounded-3xl overflow-hidden p-10 sm:p-14 text-center text-white">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0b1220] via-[#1e3a8a] to-[#3b82f6]" />
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-72 h-72 bg-cyan-400 rounded-full blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo-500 rounded-full blur-[100px]" />
            </div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-4xl font-bold mb-4 tracking-tight">
                Ready to organize your team?
              </h2>
              <p className="text-blue-100/90 mb-10 max-w-lg mx-auto text-lg">
                Create your first workspace in minutes and invite your team to collaborate.
              </p>
              <button
                type="button"
                onClick={() => navigate(token ? '/create-workspace' : '/register')}
                className="inline-flex items-center justify-center px-10 py-4 rounded-xl bg-white text-[var(--brand-primary)] font-bold text-base hover:bg-blue-50 transition-all min-h-[52px] shadow-lg shadow-black/20 hover:-translate-y-0.5"
              >
                {token ? 'Create workspace' : 'Get started free'}
              </button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home;
