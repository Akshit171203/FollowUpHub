const fs = require('fs');
const file = 'src/components/followups/FollowUpDetail.tsx';
let content = fs.readFileSync(file, 'utf8');

const target = `                    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
                      <Textarea
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        rows={4}
                        className="bg-white/90 border-violet-200/80 focus:border-violet-400 focus:ring-violet-400/20 text-[14px] leading-relaxed resize-none rounded-xl shadow-inner text-zinc-900 placeholder:text-zinc-400"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={onCopyDraft}
                        className="self-start rounded-xl text-violet-700 hover:bg-violet-200/50 font-semibold gap-1.5 text-xs h-8 px-3 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy to clipboard
                      </Button>
                    </div>`;

const replacement = `                    <div className="flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-500 relative">
                      <div className="relative group/textarea bg-white/95 backdrop-blur-sm border border-violet-200/60 focus-within:border-violet-400/80 focus-within:ring-4 focus-within:ring-violet-400/10 rounded-2xl shadow-sm transition-all duration-300 overflow-hidden">
                        <div className="px-4 py-3 bg-violet-50/50 border-b border-violet-100/50 flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
                          <span className="ml-2 text-[11px] font-semibold text-violet-400 uppercase tracking-wider">Draft Message</span>
                        </div>
                        <Textarea
                          value={draftText}
                          onChange={(e) => setDraftText(e.target.value)}
                          rows={5}
                          className="w-full bg-transparent border-0 focus-visible:ring-0 p-5 text-[15px] leading-relaxed resize-none text-zinc-800 placeholder:text-zinc-400 min-h-[140px]"
                        />
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover/textarea:opacity-100 transition-opacity duration-300">
                          <Button
                            size="sm"
                            onClick={onCopyDraft}
                            className="rounded-xl bg-violet-100 hover:bg-violet-200 text-violet-700 font-bold gap-1.5 text-xs h-8 px-4 shadow-sm transition-all"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>`;

content = content.replace(target, replacement);
fs.writeFileSync(file, content);
