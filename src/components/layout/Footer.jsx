import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';
import Container from '../ui/Container';

const footerLinks = {
  product: [
    { label: 'Workspaces', to: '/workspaces' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Create Workspace', to: '/create-workspace' },
  ],
  account: [
    { label: 'Sign In', to: '/login' },
    { label: 'Register', to: '/register' },
    { label: 'Settings', to: '/settings' },
  ],
};

const Footer = () => (
  <footer className="footer-dark mt-auto relative overflow-hidden">
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />
    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

    <Container className="py-14 lg:py-16 relative">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
        <div className="lg:col-span-5">
          <Logo showText variant="light" />
          <p className="mt-5 text-sm text-slate-400 leading-relaxed max-w-sm">
            The modern way to plan, track, and ship work — workspaces, boards, timelines, and chat in one beautiful product.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {['Kanban', 'Timeline', 'Chat', 'Billing'].map((tag) => (
              <span key={tag} className="text-xs font-medium px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <h3 className="text-sm font-semibold text-white mb-4">Product</h3>
          <ul className="space-y-3">
            {footerLinks.product.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-4">Account</h3>
          <ul className="space-y-3">
            {footerLinks.account.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="text-sm text-slate-400 hover:text-white transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="text-sm font-semibold text-white mb-4">Get started</h3>
          <p className="text-sm text-slate-400 mb-4">Create your first workspace in under a minute.</p>
          <Link to="/register" className="inline-flex items-center text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
            Start free
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} Jira Lite. All rights reserved.</p>
        <p className="text-sm text-slate-500">Built for productive teams.</p>
      </div>
    </Container>
  </footer>
);

export default Footer;
