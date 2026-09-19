const fs = require('fs');
const file = 'src/components/followups/FollowUpDetail.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Change the main scrollable container padding from p-6 lg:p-8 to p-4 lg:p-5
content = content.replace('className="flex-1 overflow-y-auto p-6 lg:p-8 custom-scrollbar"', 'className="flex-1 overflow-y-auto p-4 lg:p-5 custom-scrollbar pb-24"');

// 2. Reduce the gap in the main column
content = content.replace('<div className="flex flex-col gap-8">', '<div className="flex flex-col gap-5">');

// 3. Make Target and Notes side-by-side to save space
const oldTargetNotes = `{/* Target & Notes Box */}
                <div className="flex flex-col gap-6 p-6 rounded-[20px] bg-gradient-to-b from-zinc-50/80 to-zinc-50/30 border border-zinc-200/60 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
                  <div className="flex flex-col gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest">
                      <Target className="w-3.5 h-3.5" /> Target
                    </span>
                    <span className="text-[15px] font-medium text-zinc-800 leading-relaxed">
                      {item.target || <span className="text-zinc-400 italic font-normal">No target specified</span>}
                    </span>
                  </div>
                  
                  <div className="h-px bg-zinc-200/50 w-full" />
                  
                  <div className="flex flex-col gap-2">
                    <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-zinc-400 uppercase tracking-widest">
                      <AlignLeft className="w-3.5 h-3.5" /> Notes
                    </span>
                    <span className="text-[15px] font-medium text-zinc-800 leading-relaxed whitespace-pre-wrap">
                      {item.notes || <span className="text-zinc-400 italic font-normal">No additional notes</span>}
                    </span>
                  </div>
                </div>`;

const newTargetNotes = `{/* Target & Notes Box */}
                <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-zinc-50/80 border border-zinc-200/60">
                  <div className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <Target className="w-3 h-3" /> Target
                    </span>
                    <span className="text-[14px] font-medium text-zinc-800 line-clamp-2">
                      {item.target || <span className="text-zinc-400 italic font-normal">None</span>}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      <AlignLeft className="w-3 h-3" /> Notes
                    </span>
                    <span className="text-[14px] font-medium text-zinc-800 line-clamp-3 whitespace-pre-wrap">
                      {item.notes || <span className="text-zinc-400 italic font-normal">None</span>}
                    </span>
                  </div>
                </div>`;
content = content.replace(oldTargetNotes, newTargetNotes);

// 4. Compact the AI Draft box
content = content.replace('p-6 rounded-[20px] bg-gradient-to-b from-violet-50/90 to-violet-100/50', 'p-4 rounded-2xl bg-gradient-to-b from-violet-50/90 to-violet-100/50');
content = content.replace('rows={5}', 'rows={3}');
content = content.replace('min-h-[140px]', 'min-h-[90px]');
content = content.replace('gap-4 p-6 rounded-[20px]', 'gap-3 p-4 rounded-2xl');

// 5. Make Action Buttons a sticky footer
const oldActionButtons = `{/* Action Buttons */}
                <div className="flex items-center gap-3 pt-2 w-full">
                  <Button
                    onClick={onDone}
                    disabled={item.status === "DONE" || item.status === "CANCELLED"}
                    className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-md shadow-zinc-900/10 font-bold px-5 gap-2 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:shadow-none transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Mark as Done
                  </Button>
                  
                  {item.status !== "DONE" && item.status !== "CANCELLED" && (
                      <Button variant="outline" onClick={onSnooze} className="rounded-xl shadow-sm border-zinc-200 hover:bg-zinc-50 font-bold gap-2 px-5 bg-white">
                        <Clock className="w-4 h-4 text-zinc-500" />
                        Snooze 10m
                      </Button>
                  )}
                  
                  <Button variant="ghost" onClick={() => setShowDeleteConfirm(true)} className="rounded-xl text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors p-3 bg-transparent shadow-none ml-auto border-transparent" title="Delete forever">
                    <Trash2 className="w-[18px] h-[18px]" />
                  </Button>
                </div>`;

const newActionButtons = ``;
content = content.replace(oldActionButtons, newActionButtons);

const oldEndOfView = `              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}`;

const newStickyFooter = `              </div>
            )}
          </>
        )}
      </div>
      
      {/* Sticky Action Footer */}
      {!loading && item && !isEditing && !showDeleteConfirm && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-zinc-100 flex items-center justify-between shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] z-20">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={onDone}
              disabled={item.status === "DONE" || item.status === "CANCELLED"}
              className="bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl shadow-sm font-bold gap-1.5 disabled:bg-zinc-100 disabled:text-zinc-400 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark as Done
            </Button>
            
            {item.status !== "DONE" && item.status !== "CANCELLED" && (
                <Button size="sm" variant="outline" onClick={onSnooze} className="rounded-xl shadow-sm border-zinc-200 hover:bg-zinc-50 font-bold gap-1.5 bg-white">
                  <Clock className="w-3.5 h-3.5 text-zinc-500" />
                  Snooze 10m
                </Button>
            )}
          </div>
          
          <Button size="sm" variant="ghost" onClick={() => setShowDeleteConfirm(true)} className="rounded-xl text-zinc-400 hover:bg-red-50 hover:text-red-600 transition-colors bg-transparent border-transparent" title="Delete forever">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}`;

content = content.replace(oldEndOfView, newStickyFooter);

fs.writeFileSync(file, content);
