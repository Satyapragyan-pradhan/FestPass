import { motion } from 'framer-motion';
import { ShieldCheck, Ticket, Server, Activity, Network, CheckCircle2, Clock } from 'lucide-react';

const STAGES = [
  { id: 1, name: 'Foundation & Core Distributed Primitives', owner: 'Member 1', status: 'DONE' },
  { id: 2, name: 'Auth, Events & Booth Ticket Sales', owner: 'Member 2', status: 'PENDING' },
  {
    id: 3,
    name: 'Peer Membership, Failure Detection & Replication',
    owner: 'Member 3',
    status: 'PENDING',
  },
  {
    id: 4,
    name: 'Gate Validation, Quorum & Offline Conflict Resolution',
    owner: 'Member 4',
    status: 'PENDING',
  },
  {
    id: 5,
    name: 'Admin Dashboard, Booth UI & Failover Client',
    owner: 'Member 5',
    status: 'PENDING',
  },
  {
    id: 6,
    name: 'Gate Scanner UI, Chaos Tools & Load Testing',
    owner: 'Member 6',
    status: 'PENDING',
  },
];

const NODES = [
  { id: 'B1', role: 'Booth', port: 4001, color: 'border-blue-500/50 bg-blue-500/10 text-blue-400' },
  { id: 'B2', role: 'Booth', port: 4002, color: 'border-cyan-500/50 bg-cyan-500/10 text-cyan-400' },
  {
    id: 'B3',
    role: 'Booth',
    port: 4003,
    color: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
  },
  {
    id: 'G1',
    role: 'Gate',
    port: 4004,
    color: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
  },
  {
    id: 'G2',
    role: 'Gate',
    port: 4005,
    color: 'border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-400',
  },
  { id: 'G3', role: 'Gate', port: 4006, color: 'border-rose-500/50 bg-rose-500/10 text-rose-400' },
];

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center px-4 py-12">
      {/* Hero Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl text-center space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
          <Activity className="w-3.5 h-3.5" /> Stage 1: Foundation Ready
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
          FestPass
        </h1>
        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
          Distributed Campus Event Ticketing &amp; Entry Validation System with offline
          verification, Snowflake 64-bit IDs, Hybrid Logical Clocks, and Ed25519 cryptography.
        </p>
      </motion.div>

      {/* 6-Node Architecture Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-5xl w-full mt-12"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-200">
            <Server className="w-5 h-5 text-indigo-400" /> 6-Node Cluster Architecture
          </h2>
          <span className="text-xs text-slate-400 font-mono">1 DB per node (data/*.db)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {NODES.map((node) => (
            <div
              key={node.id}
              className={`p-4 rounded-xl border ${node.color} flex flex-col justify-between`}
            >
              <div className="flex justify-between items-start">
                <span className="text-2xl font-black font-mono">{node.id}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-900/80">
                  {node.role}
                </span>
              </div>
              <div className="mt-4 pt-2 border-t border-slate-800 text-xs font-mono text-slate-400">
                Port: {node.port}
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Distributed Primitives Highlights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-4 mt-8"
      >
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-2 text-indigo-400 font-semibold mb-2">
            <Ticket className="w-5 h-5" /> Snowflake 64-bit IDs
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Time-ordered 64-bit BigInt IDs (timestamp + node index + sequence) serializable as
            strings with clock drift handling.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-2 text-sky-400 font-semibold mb-2">
            <Clock className="w-5 h-5" /> Hybrid Logical Clocks (HLC)
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Causally ordered logical-physical timestamps with deterministic node tie-breaking for
            distributed event ordering.
          </p>
        </div>

        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold mb-2">
            <ShieldCheck className="w-5 h-5" /> Ed25519 Ticket Tokens
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tamper-proof format{' '}
            <code className="text-[11px] bg-slate-800 px-1 py-0.5 rounded">
              FP1.&lt;ticketId&gt;.&lt;eventId&gt;.&lt;sig&gt;
            </code>{' '}
            verifiable offline by gate nodes.
          </p>
        </div>
      </motion.div>

      {/* Stage Roadmap */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="max-w-5xl w-full mt-10"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-200">
          <Network className="w-5 h-5 text-indigo-400" /> Implementation Roadmap (6 Stages)
        </h2>
        <div className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden">
          {STAGES.map((stage) => (
            <div key={stage.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {stage.status === 'DONE' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-700 shrink-0 flex items-center justify-center text-[10px] text-slate-500">
                    {stage.id}
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-slate-200">
                    Stage {stage.id}: {stage.name}
                  </div>
                  <div className="text-xs text-slate-400">Owner: {stage.owner}</div>
                </div>
              </div>
              <span
                className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-full ${
                  stage.status === 'DONE'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {stage.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-slate-600">
        FestPass Distributed Systems Project &bull; Built with Node.js, Express, better-sqlite3,
        React, Vite &amp; Tailwind CSS.
      </footer>
    </div>
  );
}
