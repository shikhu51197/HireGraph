import React, { useState, useEffect } from 'react';
import { Network, Users, Briefcase, MapPin, CheckCircle, Search, ChevronRight, Activity, ArrowRight, ServerCrash, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Job, Candidate } from './types';

const formatGrammar = (candidateSkills: string[], requiredSkills: string[]) => {
  const cSkillStr = candidateSkills.map(s => `<span class="font-semibold text-slate-200">${s}</span>`).join(', ');
  const rSkillStr = requiredSkills.map(s => `<span class="font-semibold text-slate-200">${s}</span>`).join(', ');
  const isCSingular = candidateSkills.length <= 1;
  const isRSingular = requiredSkills.length <= 1;

  return `Candidate knows ${cSkillStr}, which ${isCSingular ? 'is' : 'are'} strongly related to the required job ${isRSingular ? 'skill' : 'skills'} ${rSkillStr}.`;
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'from-emerald-500 to-emerald-400';
  if (score >= 50) return 'from-blue-500 to-indigo-500';
  return 'from-amber-500 to-orange-500';
};

const App: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/jobs`);
      if (!response.ok) throw new Error('Database connection failed');
      const data = await response.json();
      setJobs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the database.');
    }
  };

  const handleJobSelect = async (jobId: string) => {
    setSelectedJob(jobId);
    setLoading(true);
    setError(null);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/jobs/${jobId}/candidates`);
      if (!response.ok) throw new Error('Database connection failed');
      const data = await response.json();
      setCandidates(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch candidates.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/60 bg-[#020617]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
              <Network size={22} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                HireGraph
              </h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-[0.2em] uppercase mt-0.5">Graph-Powered Talent Discovery</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-900/50 rounded-full border border-slate-800">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </div>
            <span className="text-xs font-medium text-slate-300">CognoDB Connected</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 relative">
        {/* Subtle background glow */}
        <div className="fixed top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
        
        {/* Left Sidebar: Job Selection */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900/40 rounded-3xl border border-slate-800/80 p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm">
            
            <h2 className="text-lg font-semibold text-slate-100 mb-5 flex items-center gap-2">
              <Search size={18} className="text-blue-400" />
              Select a Role
            </h2>
            
            <div className="space-y-3">
              {jobs.map(job => (
                <button
                  key={job.id}
                  onClick={() => handleJobSelect(job.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${
                    selectedJob === job.id 
                      ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  {selectedJob === job.id && (
                    <motion.div 
                      layoutId="active-job-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    />
                  )}
                  <div className="flex justify-between items-center relative z-10 pl-2">
                    <h3 className={`font-medium ${selectedJob === job.id ? 'text-blue-400' : 'text-slate-200'}`}>
                      {job.title}
                    </h3>
                    <ChevronRight size={16} className={`transition-transform duration-300 ${selectedJob === job.id ? 'text-blue-400 translate-x-1' : 'text-slate-600 group-hover:text-slate-400'}`} />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 pl-2 flex items-center gap-1.5 font-medium">
                    <Briefcase size={12} />
                    Min {job.experience} yrs exp
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Graph Explanation Card */}
          <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900/60 rounded-3xl border border-indigo-500/20 p-6 shadow-2xl relative overflow-hidden backdrop-blur-sm group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700"></div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4 flex items-center gap-2">
              <Activity size={16} />
              Why Graph Matters
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-5">
              A standard database just looks for exact keyword matches. HireGraph traverses connections to find candidates who have <strong className="text-indigo-300 font-semibold">related technologies</strong>.
            </p>
            
            {/* Visual Node Diagram */}
            <div className="bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 font-mono text-[11px] flex flex-col gap-3 relative">
              <div className="absolute left-[27px] top-[24px] bottom-[24px] w-px bg-slate-800"></div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-6 h-6 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Users size={12} />
                </div>
                <span className="text-blue-300">Candidate</span>
                <ArrowRight size={10} className="text-slate-600" />
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Express.js</span>
              </div>
              
              <div className="flex items-center gap-3 relative z-10 ml-[2px]">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700 ml-2"></div>
                <span className="text-slate-500 uppercase tracking-wider text-[9px]">Related to</span>
                <ArrowRight size={10} className="text-slate-600" />
                <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Node.js</span>
              </div>
              
              <div className="flex items-center gap-3 relative z-10 ml-[2px]">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700 ml-2"></div>
                <span className="text-slate-500 uppercase tracking-wider text-[9px]">Required by</span>
                <ArrowRight size={10} className="text-slate-600" />
                <div className="w-6 h-6 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 ml-1">
                  <Briefcase size={12} />
                </div>
                <span className="text-purple-300">Job</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Content: Candidates */}
        <div className="lg:col-span-8 relative">
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-red-500/5 border border-red-500/20 rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-[0_0_40px_rgba(239,68,68,0.05)] backdrop-blur-sm"
              >
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
                  <ServerCrash size={32} className="text-red-400" />
                </div>
                <h2 className="text-2xl font-semibold text-red-300 mb-3">Database Connection Error</h2>
                <p className="text-red-400/80 max-w-md leading-relaxed">{error}</p>
                <p className="text-sm text-slate-500 mt-6 bg-slate-900/50 px-4 py-2 rounded-lg border border-slate-800">Please check your CognoDB credentials in the .env file.</p>
              </motion.div>
            )}

            {!selectedJob && !error && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="h-full bg-slate-900/20 border border-slate-800/50 rounded-3xl flex flex-col items-center justify-center p-12 text-center min-h-[500px]"
              >
                <div className="relative mb-8 group">
                  <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/30 transition-all duration-700 animate-pulse"></div>
                  <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center relative z-10 shadow-2xl">
                    <Lightbulb size={40} className="text-slate-600 group-hover:text-blue-400 transition-colors duration-500" />
                  </div>
                </div>
                <h2 className="text-2xl font-semibold text-slate-200 mb-3 tracking-tight">Discover Hidden Talent</h2>
                <p className="text-slate-400 max-w-md leading-relaxed text-sm">
                  Select a role from the sidebar to trigger a multi-hop graph traversal. Watch as HireGraph finds the best matching candidates based on explicit and implicit skill relationships.
                </p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-8 flex flex-col md:flex-row gap-8 relative overflow-hidden backdrop-blur-sm">
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-10"></div>
                    
                    <div className="md:w-1/3 space-y-4">
                      <div className="h-6 bg-slate-800/80 rounded-md w-3/4"></div>
                      <div className="h-4 bg-slate-800/50 rounded-md w-1/2"></div>
                      <div className="mt-8 h-2 bg-slate-800/80 rounded-full w-full"></div>
                    </div>
                    <div className="hidden md:block w-px bg-slate-800/50"></div>
                    <div className="md:w-2/3 space-y-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-800/50 rounded-md w-1/4"></div>
                        <div className="flex gap-2">
                          <div className="h-8 bg-slate-800/80 rounded-lg w-20"></div>
                          <div className="h-8 bg-slate-800/80 rounded-lg w-24"></div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-800/50 rounded-md w-1/3"></div>
                        <div className="h-16 bg-slate-800/30 rounded-xl w-full border border-slate-800/50"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {!loading && !error && selectedJob && candidates.length === 0 && (
              <motion.div 
                key="no-match"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-16 text-center shadow-xl backdrop-blur-sm"
              >
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search size={24} className="text-slate-500" />
                </div>
                <h2 className="text-xl font-semibold text-slate-200 mb-3">No Graph Matches Found</h2>
                <p className="text-slate-400 text-sm max-w-sm mx-auto">
                  Our traversal algorithm couldn't find any candidates directly matching or related to this role's required skills in the current database.
                </p>
              </motion.div>
            )}

            {!loading && !error && candidates.length > 0 && (
              <motion.div 
                key="results"
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.15 }
                  }
                }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between mb-2 px-2">
                  <h2 className="text-2xl font-bold text-slate-100 tracking-tight">Recommended Candidates</h2>
                  <span className="text-xs px-3 py-1.5 bg-slate-900 border border-slate-700 text-slate-300 rounded-full font-semibold shadow-inner">
                    {candidates.length} matches
                  </span>
                </div>
                
                {candidates.map((candidate, idx) => (
                  <motion.div 
                    variants={{
                      hidden: { opacity: 0, y: 30 },
                      show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
                    }}
                    key={candidate.id} 
                    className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-7 shadow-xl hover:border-slate-700/80 hover:bg-slate-900/80 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group backdrop-blur-md"
                  >
                    <div className="flex flex-col md:flex-row gap-8">
                      
                      {/* Candidate Info */}
                      <div className="md:w-[35%] flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-slate-50 group-hover:text-blue-400 transition-colors">{candidate.name}</h3>
                            {idx === 0 && (
                              <span className="text-[10px] uppercase font-bold tracking-widest bg-gradient-to-r from-emerald-500 to-emerald-400 text-emerald-950 px-2 py-0.5 rounded shadow-[0_0_10px_rgba(16,185,129,0.2)]">Top Match</span>
                            )}
                          </div>
                          <div className="space-y-2 text-sm text-slate-400 font-medium">
                            <p className="flex items-center gap-2"><Briefcase size={14} className="text-slate-500" /> {candidate.experience} years experience</p>
                            <p className="flex items-center gap-2"><MapPin size={14} className="text-slate-500" /> {candidate.location}</p>
                          </div>
                        </div>
                        
                        <div className="mt-8">
                          <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Match Score</span>
                            <span className="text-sm font-bold text-slate-200">{candidate.matchScore} pts</span>
                          </div>
                          <div className="bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80 shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(100, candidate.matchScore)}%` }}
                              transition={{ duration: 1, delay: 0.2 + (idx * 0.1), ease: "easeOut" }}
                              className={`h-full bg-gradient-to-r ${getScoreColor(candidate.matchScore)} rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]`} 
                            ></motion.div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="hidden md:block w-px bg-slate-800/60"></div>
                      
                      {/* Skills Match Breakdown */}
                      <div className="md:w-[65%] space-y-5">
                        
                        {candidate.matchedSkills.length > 0 && (
                          <div>
                            <h4 className="text-[10px] uppercase tracking-widest text-emerald-500/80 font-bold mb-3 flex items-center gap-1.5">
                              <CheckCircle size={12} className="text-emerald-500" /> Direct Skill Matches
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {candidate.matchedSkills.map(skill => (
                                <span key={skill} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {candidate.relatedSkillsHeld.length > 0 && (
                          <div className="bg-indigo-950/30 rounded-2xl p-5 border border-indigo-500/20 relative overflow-hidden group/graph">
                            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-indigo-500/5 to-transparent pointer-events-none"></div>
                            <h4 className="text-[10px] uppercase tracking-widest text-indigo-400/80 font-bold mb-3 flex items-center gap-1.5">
                              <Network size={12} className="text-indigo-400 group-hover/graph:animate-spin-slow" /> Graph-Discovered Related Skills
                            </h4>
                            <div 
                              className="text-sm text-slate-300 leading-relaxed font-medium"
                              dangerouslySetInnerHTML={{ __html: formatGrammar(candidate.relatedSkillsHeld, candidate.matchedRequiredSkills) }}
                            />
                          </div>
                        )}
                        
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      
      {/* Global CSS for shimmer animation */}
      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default App;
