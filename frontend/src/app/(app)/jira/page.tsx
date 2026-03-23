"use client";

import { useState, useEffect } from "react";
import { getJiraTickets, connectJira, syncJira, disconnectJira } from "@/lib/jira";
import { toast } from "sonner";
import { format } from "date-fns";
import { Loader2, RefreshCw, Trash2, ExternalLink, Kanban, CheckCircle2, Search, ArrowRight, ShieldCheck, Mail } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

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
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  
  const [isConnected, setIsConnected] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Form State
  const [jiraEmail, setJiraEmail] = useState("");
  const [jiraDomain, setJiraDomain] = useState("");
  const [jiraApiToken, setJiraApiToken] = useState("");
  const [managerEmail, setManagerEmail] = useState("");
  const [connecting, setConnecting] = useState(false);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

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

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setConnecting(true);
    try {
      await connectJira({
        jiraEmail,
        jiraDomain: jiraDomain.replace(/^https?:\/\//, '').split('/')[0],
        jiraApiToken,
        managerEmail
      });
      toast.success("Jira connected successfully!");
      await handleSync(); // Initial sync
      await fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to connect to Jira");
    } finally {
      setConnecting(false);
    }
  }

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

  const filteredTickets = tickets.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as any, stiffness: 300, damping: 24 } }
  };

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 md:px-8 max-w-6xl py-6 md:py-8 space-y-6 md:space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-inner">
              <Kanban className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600">Jira Integration</h1>
          </div>
          <p className="text-zinc-500 max-w-xl">
            Auto-sync your assigned tickets from Jira, track them effortlessly, and automatically escalate to your manager when breached.
          </p>
        </div>
        
        {isConnected && (
          <div className="flex items-center gap-3">
             <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleDisconnect} disabled={disconnecting}>
               {disconnecting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
               Disconnect
             </Button>
             <Button className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white shadow-md transition-all shadow-indigo-200" onClick={handleSync} disabled={syncing}>
               {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
               Sync Now
             </Button>
          </div>
        )}
      </div>

      {!isConnected ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="grid md:grid-cols-2 gap-8 items-start">
          <Card className="shadow-lg border-zinc-200/60 overflow-hidden relative">
            {/* Glassmorphism accent */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 translate-x-1/2 -translate-y-1/2"></div>
            
            <CardHeader className="pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                Connect your workspace
              </CardTitle>
              <CardDescription className="text-sm">
                Securely link your Atlassian ecosystem. API tokens are guarded with <strong className="text-indigo-600">AES-256-GCM encryption</strong> at rest.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConnect} className="space-y-5">
                <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                  <Label htmlFor="jiraDomain" className="font-semibold">Workspace Domain</Label>
                  <Input 
                    id="jiraDomain" 
                    placeholder="e.g. company.atlassian.net" 
                    className="border-zinc-200 focus-visible:ring-indigo-500/30 h-11"
                    required 
                    value={jiraDomain} 
                    onChange={e => setJiraDomain(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                  <Label htmlFor="jiraEmail" className="font-semibold">Atlassian Email</Label>
                  <Input 
                    id="jiraEmail" 
                    placeholder="e.g. user@company.com" 
                    className="border-zinc-200 focus-visible:ring-indigo-500/30 h-11"
                    required 
                    value={jiraEmail} 
                    onChange={e => setJiraEmail(e.target.value)} 
                  />
                </div>
                
                <div className="space-y-1.5 focus-within:text-indigo-600 transition-colors">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="jiraApiToken" className="font-semibold">API Token</Label>
                    <a href="https://id.atlassian.com/manage-profile/security/api-tokens" target="_blank" rel="noreferrer" className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 transition-colors">
                      Get Token <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <Input 
                    id="jiraApiToken" 
                    type="password"
                    placeholder="Paste your API token..." 
                    className="border-zinc-200 focus-visible:ring-indigo-500/30 h-11 font-mono text-sm"
                    required 
                    value={jiraApiToken} 
                    onChange={e => setJiraApiToken(e.target.value)} 
                  />
                </div>
                
                <div className="pt-4 border-t border-zinc-100 space-y-1.5 focus-within:text-indigo-600 transition-colors">
                  <Label htmlFor="managerEmail" className="font-semibold flex items-center gap-2">
                    <Mail className="w-4 h-4 text-zinc-400" />
                    Manager's Email <span className="text-zinc-400 font-normal text-xs">(Optional)</span>
                  </Label>
                  <Input 
                    id="managerEmail" 
                    placeholder="manager@company.com" 
                    className="border-zinc-200 focus-visible:ring-indigo-500/30 h-11"
                    value={managerEmail} 
                    onChange={e => setManagerEmail(e.target.value)} 
                  />
                  <p className="text-xs text-zinc-500 mt-1">
                    Triggers an automated escalation email if you ignore a ticket past Level 2.
                  </p>
                </div>
                
                <div className="pt-2">
                  <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 h-11 shadow-md hover:shadow-lg transition-all" disabled={connecting}>
                    {connecting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ArrowRight className="mr-2 h-5 w-5" />}
                    Authenticate & Activate Sync
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <div className="space-y-6 lg:pl-8 pt-8">
            <div className="space-y-2">
               <h3 className="text-lg font-bold flex items-center gap-2 text-zinc-800">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  Bank-Grade Encryption
               </h3>
               <p className="text-sm text-zinc-500">
                  We don't play around with your company's credentials. Your token is never exposed to the frontend, never logged, and ciphered with AES-256-GCM.
               </p>
            </div>
            <div className="space-y-2">
               <h3 className="text-lg font-bold flex items-center gap-2 text-zinc-800">
                  <RefreshCw className="w-5 h-5 text-blue-500" />
                  Intelligent Sync Loop
               </h3>
               <p className="text-sm text-zinc-500">
                  FollowUpHub will quietly poll Jira every 5 minutes in the background utilizing JQL batches so you're never rate-limited.
               </p>
            </div>
             <div className="space-y-2">
               <h3 className="text-lg font-bold flex items-center gap-2 text-zinc-800">
                  <Mail className="w-5 h-5 text-rose-500" />
                  Automatic Accountability
               </h3>
               <p className="text-sm text-zinc-500">
                  Connect your Manager's email and our escalation engine takes over. Slipped tickets trigger visual warnings before alerting your Lead when you repeatedly breach SLAs.
               </p>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <Card className="shadow-sm border-indigo-100 bg-gradient-to-r from-indigo-50/50 to-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[500px] h-full bg-blue-50/50 -skew-x-12 translate-x-1/4 pointer-events-none"></div>
            <CardContent className="pt-6 relative z-10">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="font-bold text-lg text-zinc-900 flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                    </span>
                    Live Syncing
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-zinc-600">
                    <span className="font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">{settings?.jiraDomain}</span>
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-zinc-400"/> {settings?.jiraEmail}</span>
                    {settings?.managerEmail && (
                      <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-zinc-400"/> Escalation Target: {settings?.managerEmail}</span>
                    )}
                  </div>
                </div>
                <div className="relative">
                   <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                   <Input 
                      placeholder="Search tickets..." 
                      className="pl-9 w-full sm:w-[250px] bg-white"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                   />
                </div>
              </div>
            </CardContent>
          </Card>

          <AnimatePresence mode="wait">
             {tickets.length === 0 ? (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-20 bg-white rounded-xl border border-zinc-200 border-dashed shadow-sm">
                 <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                   <Kanban className="w-8 h-8 text-indigo-300" />
                 </div>
                 <h3 className="text-base font-bold text-zinc-900">No active tickets</h3>
                 <p className="text-sm text-zinc-500 mt-2 max-w-sm mx-auto">
                   You are fully caught up! Any new assigned issues on Jira will automatically appear here within 5 minutes.
                 </p>
                 <Button variant="outline" className="mt-6" onClick={handleSync} disabled={syncing}>
                    {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Poll Again
                 </Button>
               </motion.div>
             ) : filteredTickets.length === 0 ? (
               <div className="text-center py-12 text-zinc-500 text-sm bg-white rounded-lg border border-zinc-100 shadow-sm">
                  No tickets match your search.
               </div>
             ) : (
               <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                 {filteredTickets.map((ticket) => (
                   <motion.div key={ticket.id} variants={itemVariants} className="group flex h-full">
                      <Card className="shadow-sm border-zinc-200/80 hover:shadow-md hover:border-indigo-200 transition-all duration-300 w-full flex flex-col bg-white overflow-hidden relative">
                        {ticket.escalationLevel >= 2 && (
                          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-red-500 to-orange-500"></div>
                        )}
                        <CardHeader className="pb-3 flex-none space-y-3">
                           <div className="flex items-start justify-between gap-2">
                             <div className="flex gap-2 items-center flex-wrap">
                               <Badge variant={ticket.status === 'DONE' ? 'default' : 'secondary'} className={`rounded-sm font-semibold tracking-wide ${ticket.status === 'DONE' ? 'bg-green-500 hover:bg-green-600' : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'}`}>
                                  {ticket.status}
                               </Badge>
                               <Badge variant="outline" className={`rounded-sm border-none font-semibold px-2 ${
                                 ticket.priority === 'URGENT' ? 'bg-red-50 text-red-700' :
                                 ticket.priority === 'HIGH' ? 'bg-orange-50 text-orange-700' :
                                 ticket.priority === 'LOW' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                               }`}>
                                  {ticket.priority}
                               </Badge>
                             </div>
                             <a 
                               href={ticket.externalUrl} 
                               target="_blank" 
                               rel="noreferrer"
                               className="text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-md transition-colors"
                             >
                               <ExternalLink className="w-4 h-4" />
                             </a>
                           </div>
                           <CardTitle className="text-base leading-snug line-clamp-2" title={ticket.title}>
                             {ticket.title}
                           </CardTitle>
                        </CardHeader>
                        <CardContent className="mt-auto flex-none pt-2 border-t border-zinc-50 bg-zinc-50/30">
                           <div className="flex items-center justify-between">
                              <div className="text-xs text-zinc-500">
                                <span className="block font-medium text-zinc-700 mb-0.5">Due Date</span>
                                {format(new Date(ticket.dueAt), "MMM d, yyyy")}
                              </div>
                              {ticket.escalationLevel >= 2 ? (
                                <div className="text-right">
                                   <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-none rounded">
                                      Escalated (Lv {ticket.escalationLevel})
                                   </Badge>
                                </div>
                              ) : (
                                <div className="text-right text-xs text-zinc-400">
                                   Level {ticket.escalationLevel}
                                </div>
                              )}
                           </div>
                        </CardContent>
                      </Card>
                   </motion.div>
                 ))}
               </motion.div>
             )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
