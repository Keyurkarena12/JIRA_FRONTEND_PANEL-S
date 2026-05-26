import { motion } from 'framer-motion';

const columns = [
  { title: 'To Do', color: 'bg-slate-400', tasks: ['Design sprint', 'API review'] },
  { title: 'In Progress', color: 'bg-blue-500', tasks: ['Dashboard UI', 'Auth flow'] },
  { title: 'Done', color: 'bg-emerald-500', tasks: ['Workspace setup'] },
];

const DashboardPreview = ({ className = '' }) => (
  <motion.div
    initial={{ opacity: 0, y: 40, rotateX: 8 }}
    animate={{ opacity: 1, y: 0, rotateX: 0 }}
    transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
    className={`dashboard-preview ${className}`}
    style={{ perspective: '1200px' }}
  >
    <div className="dashboard-preview-inner">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-400/80" />
          <span className="w-3 h-3 rounded-full bg-amber-400/80" />
          <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
        </div>
        <div className="flex-1 mx-4 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center px-3">
          <span className="text-[11px] text-white/40">app.jiralite.com/workspace/design</span>
        </div>
      </div>

      <div className="p-4 grid grid-cols-3 gap-3 min-h-[220px]">
        {columns.map((col) => (
          <div key={col.title} className="rounded-xl bg-white/[0.04] border border-white/[0.08] p-2.5">
            <div className="flex items-center gap-2 mb-3 px-1">
              <span className={`w-2 h-2 rounded-full ${col.color}`} />
              <span className="text-[11px] font-semibold text-white/70">{col.title}</span>
            </div>
            <div className="space-y-2">
              {col.tasks.map((task) => (
                <div
                  key={task}
                  className="rounded-lg bg-white/[0.06] border border-white/[0.08] p-2.5 shadow-sm"
                >
                  <p className="text-[11px] font-medium text-white/90 leading-snug">{task}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-200 font-medium">
                      Medium
                    </span>
                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 text-[8px] flex items-center justify-center text-white font-bold">
                      K
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-indigo-500/10 to-cyan-500/20 blur-3xl -z-10 rounded-[2rem]" />
  </motion.div>
);

export default DashboardPreview;
