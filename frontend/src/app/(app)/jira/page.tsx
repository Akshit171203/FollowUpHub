"use client";

import { useState, useEffect } from "react";
import { getJiraTickets, connectJira, syncJira, disconnectJira } from "@/lib/jira";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, RefreshCw, Trash2, ExternalLink, Kanban, Search, ArrowRight, ShieldCheck, Mail, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Defines the shape of a Jira Ticket that we sync and display in the UI
type Ticket = {
  id: string;
  title: string;
  externalId: string;
  externalUrl: string;
  status: string;
  priority: string;
  escalationLevel: number;
  dueAt: string;
  updatedAt: string;
};

export default function JiraPage() {
  // Global loading states for fetching, syncing, and disconnecting actions
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  
  // Connection and ticket state populated from our backend API
  const [isConnected, setIsConnected] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Local form state used when the user connects their Jira workspace
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraDomain, setJiraDomain] = useState("");
  const [jiraApiToken, setJiraApiToken] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [connecting, setConnecting] = useState(false);
  
  // Local state for the search bar to filter tickets in the UI
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch initial connection status and tickets on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetches connection status and the list of synced tickets from the backend
  async function fetchData() {
    setLoading(true);
    try {
      const data = await getJiraTickets(1, 100);
      setIsConnected(data.settings.isConnected);
      setSettings(data.settings);
      setTickets(data.tickets || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load Jira connection");
    } finally {
      setLoading(false);
    }
  }

  // Handles the form submission to securely connect to a new Jira workspace
  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setConnecting(true);
    try {
      await connectJira({
        jiraEmail,
        // Cleans up the domain if the user pastes a full URL (e.g. https://domain.atlassian.net)
        jiraDomain: jiraDomain.replace(/^https?:\/\//, '').split('/')[0],
        jiraApiToken,
        managerEmail
      });
      toast.success("Jira connected successfully!");
      await handleSync(); // Initial sync immediately after connecting
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to connect to Jira");
    } finally {
      setConnecting(false);
    }
  }

  // Manually triggers a Jira sync to fetch the latest tickets from Atlassian
  async function handleSync() {
    setSyncing(true);
    try {
      const res = await syncJira();
      toast.success(`Jira sync complete! Synchronized ${res.count} tickets.`);
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to sync Jira");
    } finally {
      setSyncing(false);
    }
  }

  // Disconnects Jira, clearing the settings and API tokens from the backend
  async function handleDisconnect() {
    if (!confirm("Are you sure you want to disconnect Jira? Your synced tickets will stay in FollowUpHub but won't be updated.")) return;
    
    setDisconnecting(true);
    try {
      await disconnectJira();
      toast.success("Jira disconnected successfully");
      setIsConnected(false);
      setTickets([]);
      setSettings(null);
    } catch(err: any) {
      toast.error(err.message || "Failed to disconnect Jira");
    } finally {
      setDisconnecting(false);
    }
  }

  // Client-side filtering of tickets based on the search input
  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-3 text-zinc-400">
           <div className="w-6 h-6 border-2 border-[#0052CC]/20 border-t-[#0052CC] rounded-full animate-spin" />
           <span className="text-[14px] font-medium">Loading workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24">
      <div className="max-w-[1300px] mx-auto px-4 md:px-8 pt-6">
        
        {/* Hero Banner */}
        <div className="relative rounded-[2rem] overflow-hidden mb-10 bg-gradient-to-br from-[#0052CC] via-blue-500 to-cyan-400 shadow-sm border border-black/5">
           <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-10 md:px-10 md:py-12">
              <div className="flex flex-col gap-3 max-w-xl">
                 <div className="flex items-center gap-3">
                    
                    <h1 className="text-4xl md:text-[44px] font-black text-white tracking-tight drop-shadow-sm uppercase mb-1">
                       JIRA INTEGRATION
                    </h1>
                 </div>
                 <p className="text-[15px] text-white/95 leading-relaxed font-medium drop-shadow-sm max-w-[600px]">
                    Auto-sync your assigned tickets, track them effortlessly, and escalate automatically when SLAs are breached.
                 </p>
                 {isConnected && (
                    <div className="mt-2 flex items-center gap-3">
                       <button 
                         onClick={handleDisconnect} 
                         disabled={disconnecting}
                         className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-[14px] font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50"
                       >
                         {disconnecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                         Disconnect
                       </button>
                       <button 
                         onClick={handleSync} 
                         disabled={syncing}
                         className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#0052CC] hover:bg-zinc-50 text-[14px] font-bold rounded-xl transition-all shadow-md disabled:opacity-50"
                       >
                         {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                         Sync Now
                       </button>
                    </div>
                 )}
              </div>
              
              {/* Decorative UI Element: Kanban Board */}
              <div className="shrink-0 hidden md:flex relative">
                 <div className="relative w-64 h-48">
                    {/* Back blurred card */}
                    <div className="absolute top-0 right-0 w-52 h-40 bg-white/20 backdrop-blur-md rounded-2xl shadow-xl border border-white/40 z-10 p-6 flex flex-col gap-4">
                       <div className="w-20 h-3 bg-white/40 rounded-full" />
                       <div className="w-full h-10 bg-white/30 rounded-xl" />
                       <div className="w-full h-10 bg-white/30 rounded-xl" />
                    </div>
                    {/* Front solid card */}
                    <div className="absolute top-6 right-8 w-56 h-44 bg-white rounded-2xl shadow-2xl border border-zinc-100 z-20 p-5 flex gap-3">
                       {/* Kanban Column 1 */}
                       <div className="flex-1 bg-zinc-50 rounded-xl p-2.5 flex flex-col gap-2.5 border border-zinc-100">
                          <div className="w-10 h-2.5 bg-zinc-200 rounded-full mb-1"></div>
                          <div className="w-full h-12 bg-white rounded-lg border border-zinc-200 shadow-sm flex flex-col gap-1.5 p-2">
                             <div className="w-12 h-1.5 bg-zinc-200 rounded-full" />
                             <div className="w-16 h-1.5 bg-zinc-100 rounded-full" />
                          </div>
                       </div>
                       {/* Kanban Column 2 */}
                       <div className="flex-1 bg-zinc-50 rounded-xl p-2.5 flex flex-col gap-2.5 border border-zinc-100">
                          <div className="w-10 h-2.5 bg-zinc-200 rounded-full mb-1"></div>
                          <div className="w-full h-12 bg-[#0052CC] rounded-lg border border-[#0052CC] shadow-sm flex flex-col gap-1.5 p-2">
                             <div className="w-12 h-1.5 bg-white/60 rounded-full" />
                             <div className="w-16 h-1.5 bg-white/30 rounded-full" />
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* 
          Main Content Area 
          If not connected, show the connection form. 
          If connected, show the ticket list and search bar.
        */}
        {!isConnected ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="grid lg:grid-cols-5 gap-10 items-start">
            
            {/* Connection Form Card */}
            <div className="lg:col-span-3">
               <div className="bg-white border border-zinc-200/60 shadow-xl shadow-zinc-200/40 rounded-3xl overflow-hidden">
                 <div className="p-8 pb-6 border-b border-zinc-100">
                    <h2 className="text-xl font-bold text-zinc-900 mb-2">Connect your workspace</h2>
                    <p className="text-[14px] text-zinc-500 leading-relaxed">
                      Securely link your Atlassian ecosystem. Your API tokens are guarded with <strong className="text-[#0052CC] font-semibold">AES-256-GCM encryption</strong> at rest.
                    </p>
                 </div>
                 
                 <div className="p-8">
                   <form onSubmit={handleConnect} className="space-y-6">
                     <div className="space-y-2">
                       <label htmlFor="jiraDomain" className="text-[13px] font-semibold text-zinc-900 px-1">Workspace Domain</label>
                       <input 
                         id="jiraDomain" 
                         placeholder="e.g. company.atlassian.net" 
                         required 
                         value={jiraDomain} 
                         onChange={e => setJiraDomain(e.target.value)} 
                         className="w-full bg-zinc-50/50 border border-zinc-200/80 focus:bg-white focus:border-[#0052CC] focus:ring-4 focus:ring-[#0052CC]/10 rounded-xl px-4 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 transition-all outline-none"
                       />
                     </div>
                     
                     <div className="space-y-2">
                       <label htmlFor="jiraEmail" className="text-[13px] font-semibold text-zinc-900 px-1">Atlassian Email</label>
                       <input 
                         id="jiraEmail" 
                         placeholder="e.g. user@company.com" 
                         required 
                         value={jiraEmail} 
                         onChange={e => setJiraEmail(e.target.value)} 
                         className="w-full bg-zinc-50/50 border border-zinc-200/80 focus:bg-white focus:border-[#0052CC] focus:ring-4 focus:ring-[#0052CC]/10 rounded-xl px-4 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 transition-all outline-none"
                       />
                     </div>
                     
                     <div className="space-y-2">
                       <div className="flex justify-between items-center px-1">
                         <label htmlFor="jiraApiToken" className="text-[13px] font-semibold text-zinc-900">API Token</label>
                         <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noreferrer" className="text-[12px] font-bold text-[#0052CC] hover:text-[#0047b3] flex items-center gap-1 transition-colors">
                           Get Token <ExternalLink className="w-3 h-3" />
                         </a>
                       </div>
                       <input 
                         id="jiraApiToken" 
                         type="password"
                         placeholder="Paste your API token..." 
                         required 
                         value={jiraApiToken} 
                         onChange={e => setJiraApiToken(e.target.value)} 
                         className="w-full bg-zinc-50/50 border border-zinc-200/80 focus:bg-white focus:border-[#0052CC] focus:ring-4 focus:ring-[#0052CC]/10 rounded-xl px-4 py-3 font-mono text-[14px] text-zinc-900 placeholder:text-zinc-400 transition-all outline-none"
                       />
                     </div>
                     
                     <div className="pt-6 border-t border-zinc-100 space-y-2">
                       <label htmlFor="managerEmail" className="text-[13px] font-semibold text-zinc-900 px-1 flex items-center gap-2">
                         <Mail className="w-4 h-4 text-zinc-400" />
                         Manager's Email <span className="text-zinc-400 font-medium">(Optional)</span>
                       </label>
                       <input 
                         id="managerEmail" 
                         placeholder="manager@company.com" 
                         value={managerEmail} 
                         onChange={e => setManagerEmail(e.target.value)} 
                         className="w-full bg-zinc-50/50 border border-zinc-200/80 focus:bg-white focus:border-[#0052CC] focus:ring-4 focus:ring-[#0052CC]/10 rounded-xl px-4 py-3 text-[15px] text-zinc-900 placeholder:text-zinc-400 transition-all outline-none"
                       />
                       <p className="text-[12.5px] font-medium text-zinc-500 mt-1.5 px-1">
                         Triggers an automated escalation email if you ignore a ticket past Level 2.
                       </p>
                     </div>
                     
                     <div className="pt-4">
                       <button 
                         type="submit" 
                         disabled={connecting}
                         className="w-full flex items-center justify-center gap-2 bg-[#0052CC] hover:bg-[#0047B3] disabled:opacity-70 disabled:cursor-not-allowed text-white text-[15px] font-bold py-3.5 rounded-xl shadow-lg shadow-[#0052CC]/20 transition-all active:scale-[0.98]"
                       >
                         {connecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                         Authenticate & Activate Sync
                       </button>
                     </div>
                   </form>
                 </div>
               </div>
            </div>
            
            {/* Feature Blocks */}
            <div className="lg:col-span-2 space-y-4">
               {/* Feature 1 */}
               <div className="bg-white border border-zinc-200/60 rounded-3xl p-6 shadow-lg shadow-zinc-200/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4">
                     <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h3 className="text-[15px] font-bold text-zinc-900 mb-1.5">Bank-Grade Encryption</h3>
                  <p className="text-[14px] text-zinc-500 leading-relaxed">
                     Your tokens are never exposed to the frontend, never logged, and ciphered with AES-256-GCM.
                  </p>
               </div>
               
               {/* Feature 2 */}
               <div className="bg-white border border-zinc-200/60 rounded-3xl p-6 shadow-lg shadow-zinc-200/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-4">
                     <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-[15px] font-bold text-zinc-900 mb-1.5">Intelligent Sync Loop</h3>
                  <p className="text-[14px] text-zinc-500 leading-relaxed">
                     We quietly poll Jira every 5 minutes in the background utilizing JQL batches so you're never rate-limited.
                  </p>
               </div>

               {/* Feature 3 */}
               <div className="bg-white border border-zinc-200/60 rounded-3xl p-6 shadow-lg shadow-zinc-200/20 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center mb-4">
                     <Mail className="w-5 h-5 text-rose-600" />
                  </div>
                  <h3 className="text-[15px] font-bold text-zinc-900 mb-1.5">Automatic Accountability</h3>
                  <p className="text-[14px] text-zinc-500 leading-relaxed">
                     Connect your Manager's email and our escalation engine alerts your Lead when you repeatedly breach SLAs.
                  </p>
               </div>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Live Syncing Header Card */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-5 shadow-sm overflow-hidden relative flex flex-col md:flex-row md:items-center justify-between gap-5">
              
              <div className="space-y-2 relative z-10">
                <h3 className="font-bold text-[16px] text-zinc-900 flex items-center gap-2.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  Live Syncing Active
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-medium text-zinc-500">
                  <span className="flex items-center gap-1.5 text-[#0052CC] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                     {settings?.jiraDomain}
                  </span>
                  <span className="flex items-center gap-1.5">
                     <Mail className="w-3.5 h-3.5 text-zinc-400"/> {settings?.jiraEmail}
                  </span>
                  {settings?.managerEmail && (
                    <span className="flex items-center gap-1.5">
                       <ShieldCheck className="w-3.5 h-3.5 text-zinc-400"/> Escalation Target: {settings?.managerEmail}
                    </span>
                  )}
                </div>
              </div>

              <div className="relative w-full md:w-auto z-10">
                 <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                 <input 
                    placeholder="Search tickets..." 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full md:w-[280px] pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200/80 rounded-xl text-[14px] text-zinc-900 outline-none focus:bg-white focus:border-[#0052CC] focus:ring-1 focus:ring-[#0052CC] transition-all"
                 />
              </div>
            </div>

             {/* Tickets Grid */}
            <AnimatePresence mode="wait">
               {tickets.length === 0 ? (
                 // Empty State: Connected but no assigned tickets found
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-20 text-center bg-white border border-zinc-200/80 rounded-2xl shadow-sm">
                   <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-5">
                     <Kanban className="w-8 h-8 text-[#0052CC]/60" />
                   </div>
                   <h3 className="text-xl font-bold text-zinc-900 tracking-tight">No active tickets</h3>
                   <p className="text-[15px] font-medium text-zinc-500 mt-2 max-w-sm mx-auto leading-relaxed">
                     You are fully caught up! Any new assigned issues on Jira will automatically appear here within 5 minutes.
                   </p>
                   <button 
                     onClick={handleSync} 
                     disabled={syncing}
                     className="mt-8 flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-900 text-[14px] font-bold rounded-xl transition-all shadow-sm disabled:opacity-50"
                   >
                      {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Poll Again
                   </button>
                 </motion.div>
               ) : filteredTickets.length === 0 ? (
                 // Empty State: Tickets exist, but none match the search query
                 <div className="text-center py-16 text-[15px] font-medium text-zinc-500 bg-white rounded-2xl border border-zinc-200/80 shadow-sm">
                    No tickets match your search.
                 </div>
               ) : (
                 // Populated Ticket Grid
                 <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {filteredTickets.map((ticket) => (
                     <motion.div key={ticket.id} variants={itemVariants} className="group flex h-full">
                        <div className="w-full flex flex-col bg-white border border-zinc-200/80 rounded-2xl overflow-hidden hover:border-zinc-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-0.5 transition-all duration-300 relative">
                          
                          {ticket.escalationLevel >= 2 && (
                            <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-red-500 to-orange-500" />
                          )}
                          
                          <div className="p-5 flex-none space-y-4">
                             <div className="flex items-start justify-between gap-3">
                               <div className="flex gap-2 items-center flex-wrap">
                                 <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                                   ticket.status === 'DONE' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'
                                 }`}>
                                    {ticket.status}
                                 </span>
                                 <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${
                                   ticket.priority === 'URGENT' ? 'bg-red-50 text-red-700 border border-red-100' :
                                   ticket.priority === 'HIGH' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                                   ticket.priority === 'LOW' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 
                                   'bg-blue-50 text-blue-700 border border-blue-100'
                                 }`}>
                                    {ticket.priority}
                                 </span>
                               </div>
                               <a 
                                 href={ticket.externalUrl} 
                                 target="_blank" 
                                 rel="noreferrer"
                                 className="text-zinc-400 hover:text-[#0052CC] p-1 rounded-md hover:bg-blue-50 transition-colors"
                               >
                                 <ExternalLink className="w-4 h-4" />
                               </a>
                             </div>
                             
                             <h4 className="text-[15px] font-semibold text-zinc-900 leading-snug line-clamp-2" title={ticket.title}>
                               {ticket.title}
                             </h4>
                          </div>
                          
                          <div className="mt-auto flex-none p-4 pt-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                             <div className="flex flex-col">
                               <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-0.5">Due Date</span>
                               <span className="text-[13px] font-medium text-zinc-700">
                                 {format(new Date(ticket.dueAt), "MMM d, yyyy")}
                               </span>
                             </div>
                             
                             {ticket.escalationLevel >= 2 ? (
                               <div className="px-2 py-1 rounded-md bg-red-100 text-red-700 text-[11px] font-bold border border-red-200">
                                  Escalated (Lv {ticket.escalationLevel})
                               </div>
                             ) : (
                               <div className="text-[12px] font-semibold text-zinc-400">
                                  Level {ticket.escalationLevel}
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
        )}
      </div>
    </div>
  );
}
