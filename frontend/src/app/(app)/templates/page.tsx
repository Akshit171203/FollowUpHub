"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getTemplates, deleteTemplate, Template } from "@/lib/templates";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { 
  Plus, 
  Search, 
  MoreVertical, 
  LayoutTemplate,
  Briefcase,
  Heart,
  Code,
  DollarSign,
  Info,
  BarChart,
  Target,
  FileText
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Category helpers ---
type Category = "All" | "Work" | "Sales" | "Personal" | "Engineering";

function categorizeTemplate(template: Template): Category {
  const name = (template.name + " " + template.title + " " + (template.target || "")).toLowerCase();
  if (name.includes("bug") || name.includes("qa") || name.includes("fix") || name.includes("code") || name.includes("deploy")) return "Engineering";
  if (name.includes("sales") || name.includes("invoice") || name.includes("proposal") || name.includes("vendor") || name.includes("contract") || name.includes("payment") || name.includes("finance")) return "Sales";
  if (name.includes("doctor") || name.includes("coffee") || name.includes("network") || name.includes("appointment") || name.includes("personal")) return "Personal";
  return "Work";
}

const categoryIcons: Record<Category, any> = {
  All: LayoutTemplate,
  Work: Briefcase,
  Sales: DollarSign,
  Personal: Heart,
  Engineering: Code,
};

// Map each category to specific light theme colors for the icon box
const categoryColors: Record<Category, { bg: string; text: string; iconBg: string }> = {
  All: { bg: "bg-zinc-100", text: "text-zinc-600", iconBg: "bg-zinc-200" },
  Work: { bg: "bg-blue-50", text: "text-blue-600", iconBg: "bg-blue-500" },
  Sales: { bg: "bg-red-50", text: "text-red-500", iconBg: "bg-red-500" },
  Personal: { bg: "bg-purple-50", text: "text-purple-600", iconBg: "bg-purple-500" },
  Engineering: { bg: "bg-emerald-50", text: "text-emerald-600", iconBg: "bg-emerald-500" },
};

function TemplateIcon({ category }: { category: Category }) {
  const Icon = categoryIcons[category] || LayoutTemplate;
  const colors = categoryColors[category] || categoryColors.All;
  
  return (
    <div className="relative mb-5 self-start shrink-0">
      {/* Main soft colored box */}
      <div className={cn("w-[52px] h-[52px] rounded-[14px] flex items-center justify-center border border-black/[0.03]", colors.bg)}>
        <Icon className={cn("w-[26px] h-[26px]", colors.text)} strokeWidth={1.5} />
      </div>
      {/* Overlapping small solid circle */}
      <div className={cn(
        "absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center text-white border-[2.5px] border-white shadow-sm",
        colors.iconBg
      )}>
        {category === "Work" && <BarChart className="w-3 h-3" />}
        {category === "Sales" && <Target className="w-3 h-3" />}
        {category === "Personal" && <Heart className="w-3 h-3" />}
        {category === "Engineering" && <Code className="w-3 h-3" />}
        {category === "All" && <FileText className="w-3 h-3" />}
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("All");

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await getTemplates();
      setTemplates(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      fetchTemplates();
    }
  }, []);

  const categorized = useMemo(() => {
    const map: Record<Category, Template[]> = { All: [], Work: [], Sales: [], Personal: [], Engineering: [] };
    templates.forEach(t => {
      const cat = categorizeTemplate(t);
      map[cat].push(t);
      map.All.push(t);
    });
    return map;
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    let items = activeCategory === "All" ? templates : categorized[activeCategory];
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.target?.toLowerCase().includes(q)
      );
    }
    return items;
  }, [templates, categorized, activeCategory, search]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    try {
      await deleteTemplate(id);
      toast.success("Template deleted");
      fetchTemplates();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleApply = (id: string) => {
    if (!id) {
      toast.error("Invalid template data");
      return;
    }
    router.push(`/followups/new?templateId=${id}`);
  };

  const categories: Category[] = ["All", "Work", "Sales", "Personal", "Engineering"];

  return (
    <div className="md:h-screen min-h-[100dvh] flex flex-col bg-[#FAFAFA] relative overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent relative z-10">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-10">

          {/* Top Bar: Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              Templates
            </h1>
          </div>

          {/* Hero Banner (Vibrant Light Theme) */}
          <div className="relative rounded-[2rem] overflow-hidden mb-4 bg-gradient-to-br from-pink-400 via-blue-400 to-emerald-300 shadow-sm border border-black/5">
            <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 px-10 py-12 md:py-16">
              <div className="flex flex-col gap-3 max-w-xl">
                <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight drop-shadow-sm">
                  Explore ready-to-use templates
                </h2>
                <p className="text-[16px] text-white/95 leading-relaxed font-medium drop-shadow-sm">
                  Browse a curated selection of templates designed to help teams model, report, and present ideas more effectively.
                </p>
              </div>
              <div className="shrink-0 hidden md:flex relative">
                {/* Abstract UI element resembling the reference */}
                <div className="w-56 h-36 bg-white/20 backdrop-blur-md border border-white/40 rounded-2xl shadow-xl flex items-center justify-center p-4 relative z-10">
                   <div className="w-full h-full bg-white rounded-xl shadow-sm border border-zinc-100 flex flex-col overflow-hidden">
                      <div className="h-4 border-b border-zinc-100 flex items-center px-2 gap-1 bg-zinc-50/50">
                         <div className="w-1.5 h-1.5 rounded-full bg-zinc-300"></div>
                         <div className="w-1.5 h-1.5 rounded-full bg-zinc-300"></div>
                         <div className="w-1.5 h-1.5 rounded-full bg-zinc-300"></div>
                      </div>
                      <div className="p-3 flex-1 flex flex-col gap-2">
                         <div className="h-3 w-1/2 bg-zinc-100 rounded-full"></div>
                         <div className="h-3 w-3/4 bg-zinc-100 rounded-full"></div>
                         <div className="h-3 w-2/3 bg-zinc-100 rounded-full"></div>
                      </div>
                   </div>
                </div>
                {/* Decorative overlapping element (Spreadsheet Document) */}
                <div className="absolute -top-4 -right-4 w-28 h-36 bg-white rounded-xl shadow-2xl border border-zinc-100 z-20 flex flex-col p-3 gap-2">
                   {/* Top Icon / Header area */}
                   <div className="flex justify-end mb-1">
                      <div className="w-8 h-8 rounded-md bg-emerald-500 flex items-center justify-center shadow-sm">
                         <span className="text-white font-bold text-[14px]">X</span>
                      </div>
                   </div>
                   {/* Fake lines for document content */}
                   <div className="flex-1 flex flex-col gap-2 mt-1">
                      <div className="h-2 w-full bg-zinc-100 rounded-full"></div>
                      <div className="h-2 w-full bg-zinc-100 rounded-full"></div>
                      <div className="h-2 w-3/4 bg-zinc-100 rounded-full"></div>
                      <div className="h-2 w-5/6 bg-zinc-100 rounded-full"></div>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Info / Action Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 px-1">
            <div className="flex items-center gap-2 text-[14px] text-zinc-900 font-medium">
              <Info className="w-4 h-4" />
              <span>This list is not exhaustive, more templates can be proposed on demand.</span>
            </div>
            <Link href="/templates/new" className="shrink-0">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-full text-[14px] font-semibold transition-all active:scale-95 shadow-md">
                <Plus className="w-4 h-4" /> Create template
              </button>
            </Link>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar bg-white p-1.5 rounded-full border border-zinc-200 w-fit shadow-sm">
            {categories.map(cat => {
              const count = categorized[cat].length;
              const isActive = activeCategory === cat;
              return (
                <button 
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 rounded-full text-[14px] font-medium transition-all select-none whitespace-nowrap",
                    isActive 
                      ? "bg-white text-zinc-900 shadow-sm border border-zinc-100 ring-1 ring-black/5" 
                      : "bg-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                  )}
                >
                  <span>{cat}</span>
                  <span className={cn(
                    "text-[12px]",
                    isActive ? "text-zinc-400 font-medium" : "text-zinc-400"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Template Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-[30vh]">
              <div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[30vh] text-zinc-600">
              <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center mb-4">
                <LayoutTemplate className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-xl font-semibold text-zinc-900 tracking-tight">No templates found</p>
              <p className="text-[15px] mt-1 text-zinc-500">Try a different search or create a new template.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
              {filteredTemplates.map(template => {
                const category = categorizeTemplate(template);
                return (
                  <TemplateCard 
                    key={template.id} 
                    template={template}
                    category={category}
                    onApply={handleApply}
                    onEdit={(id) => router.push(`/templates/${id}`)}
                    onDelete={handleDelete}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ 
  template,
  category,
  onApply,
  onEdit,
  onDelete
}: { 
  template: Template;
  category: Category;
  onApply: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="group bg-white border border-zinc-200 rounded-3xl p-6 hover:border-zinc-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer relative"
         onClick={() => onApply(template.id!)}
    >
      {/* Context Menu */}
      <div className="absolute top-5 right-5 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-all border border-transparent hover:border-zinc-200">
              <MoreVertical className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-2xl shadow-xl border-zinc-200 bg-white text-zinc-700 p-1.5">
            <DropdownMenuItem onClick={() => onApply(template.id!)} className="rounded-xl hover:bg-zinc-100 focus:bg-zinc-100 cursor-pointer text-[13px] font-semibold py-2.5">
              Use Template
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(template.id!)} className="rounded-xl hover:bg-zinc-100 focus:bg-zinc-100 cursor-pointer text-[13px] font-semibold py-2.5">
              Edit Template
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-zinc-100 my-1" />
            <DropdownMenuItem onClick={() => onDelete(template.id!)} className="text-red-600 focus:text-red-700 focus:bg-red-50 rounded-xl cursor-pointer text-[13px] font-semibold py-2.5">
              Delete Template
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Icon with overlapping badge */}
      <TemplateIcon category={category} />

      {/* Title */}
      <h3 className="font-semibold text-zinc-900 text-[17px] tracking-tight leading-snug mb-2 transition-colors">
        {template.name}
      </h3>

      {/* Description */}
      <p className="text-[14px] text-zinc-500 leading-relaxed line-clamp-2 mb-6">
        {template.title}
        {template.notes ? `. ${template.notes}` : ""}
      </p>

      {/* Category Badge */}
      <div className="mt-auto flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-[11px] font-semibold uppercase tracking-wider border border-zinc-200 text-zinc-500 bg-zinc-50">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          {category}
        </span>
      </div>
    </div>
  );
}
