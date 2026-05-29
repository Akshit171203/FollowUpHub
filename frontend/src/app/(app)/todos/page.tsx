"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  Clock,
  Circle,
  Check,
  ListTodo
} from "lucide-react";

import * as todoApi from "@/lib/todos";
import type { Todo, UpdateTodoInput } from "@/lib/todos";
import { cn } from "@/lib/utils";

export default function TodosPage() {
  const router = useRouter();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoTime, setNewTodoTime] = useState("");
  const [addingTodo, setAddingTodo] = useState(false);

  // Load todos for current date
  const loadTodos = async () => {
    try {
      setLoading(true);
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const data = await todoApi.listTodos(dateStr);
      setTodos(data);
    } catch (error) {
      console.error("Failed to load todos:", error);
      toast.error("Failed to load todos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTodos();
  }, [currentDate]);

  // Add todo
  const handleAddTodo = async () => {
    if (!newTodoTitle.trim()) {
      toast.error("Please enter a todo title");
      return;
    }

    try {
      setAddingTodo(true);
      const dateStr = format(currentDate, "yyyy-MM-dd");
      
      let remindAt = undefined;
      if (newTodoTime) {
         const [hours, minutes] = newTodoTime.split(':').map(Number);
         const d = new Date(currentDate);
         d.setHours(hours, minutes, 0, 0);
         remindAt = d.toISOString();
      }

      const newTodo = await todoApi.createTodo({
        title: newTodoTitle,
        forDate: dateStr,
        remindAt,
      });
      
      setTodos([...todos, newTodo]);
      setNewTodoTitle("");
      setNewTodoTime("");
      toast.success("Todo added");
    } catch (error) {
      console.error("Failed to add todo:", error);
      toast.error("Failed to add todo");
    } finally {
      setAddingTodo(false);
    }
  };

  // Toggle todo status
  const handleToggleDone = async (todo: Todo) => {
    try {
      const newStatus = todo.status === "DONE" ? "PENDING" : "DONE";
      const updated = await todoApi.updateTodo(todo.id, { status: newStatus });
      
      setTodos(todos.map(t => t.id === todo.id ? updated : t));
      toast.success(newStatus === "DONE" ? "Todo completed" : "Todo reopened");
    } catch (error) {
      console.error("Failed to toggle todo:", error);
      toast.error("Failed to update todo");
    }
  };

  // Update todo details (e.g. reminder)
  const handleUpdateTodo = async (id: string, updates: UpdateTodoInput) => {
      try {
          const updated = await todoApi.updateTodo(id, updates);
          setTodos(todos.map(t => t.id === id ? updated : t));
          toast.success("Todo updated");
      } catch (error) {
          console.error("Failed to update todo:", error);
          toast.error("Failed to update todo");
      }
  }

  // Delete todo
  const handleDelete = async (todoId: string) => {
    try {
      await todoApi.deleteTodo(todoId);
      setTodos(todos.filter(t => t.id !== todoId));
      toast.success("Todo deleted");
    } catch (error) {
      console.error("Failed to delete todo:", error);
      toast.error("Failed to delete todo");
    }
  };

  // Promote to followup
  const handlePromote = async (todo: Todo) => {
    try {
      await todoApi.promoteTodo(todo.id);
      setTodos(todos.filter(t => t.id !== todo.id));
      toast.success("Promoted to followup");
    } catch (error) {
      console.error("Failed to promote todo:", error);
      toast.error("Failed to promote to followup");
    }
  };

  // Navigate dates
  const gotoPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const gotoNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const gotoToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");

  const pendingTodos = todos.filter(t => t.status === "PENDING");
  const doneTodos = todos.filter(t => t.status === "DONE");

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24">
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-10 md:pt-16">
        
        {/* Header with Date Navigation */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Daily Todos</h1>
            <p className="text-[15px] font-medium text-zinc-500 mt-1">Focus on what matters today.</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Nav Pill */}
            <div className="flex items-center bg-white border border-zinc-200 shadow-sm rounded-full p-1">
              <button 
                onClick={gotoPreviousDay}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-2 px-3 text-[14px] font-semibold text-zinc-800 select-none min-w-[120px] justify-center">
                <CalendarIcon className="w-4 h-4 text-zinc-400" />
                {format(currentDate, "MMM dd, yyyy")}
              </div>
              
              <button 
                onClick={gotoNextDay}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100 text-zinc-500 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {!isToday && (
              <button 
                onClick={gotoToday}
                className="px-4 py-2 bg-zinc-900 text-white text-[13px] font-semibold rounded-full hover:bg-zinc-800 transition-all shadow-sm"
              >
                Today
              </button>
            )}
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-r from-orange-400 via-rose-400 to-purple-400 p-8 md:p-10 mb-10 shadow-lg">
           <div className="relative z-10 max-w-xl">
              <h2 className="text-3xl md:text-[32px] font-bold text-white mb-3 tracking-tight">Conquer your day</h2>
              <p className="text-white/90 text-[15px] leading-relaxed max-w-lg">
                Stay on top of your daily tasks, set timely reminders, and seamlessly promote important items to full follow-ups.
              </p>
           </div>
           
           {/* Decorative UI Element: Task Cards */}
           <div className="hidden md:block absolute top-1/2 -translate-y-1/2 right-12">
              <div className="relative w-40 h-32">
                 {/* Back blurred card */}
                 <div className="absolute top-2 right-0 w-32 h-24 bg-white/20 backdrop-blur-md rounded-xl shadow-xl border border-white/30 z-10 p-3 transform rotate-6">
                    <div className="flex items-center gap-2 mb-3">
                       <div className="w-4 h-4 rounded-full bg-white/40" />
                       <div className="w-16 h-2 bg-white/30 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-4 h-4 rounded-full bg-white/40" />
                       <div className="w-12 h-2 bg-white/30 rounded-full" />
                    </div>
                 </div>
                 {/* Front solid card */}
                 <div className="absolute top-4 right-8 w-32 h-28 bg-white rounded-xl shadow-2xl border border-white/50 z-20 p-3 flex flex-col gap-3 transform -rotate-3">
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                       </div>
                       <div className="w-16 h-2 bg-zinc-200 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2 opacity-60">
                       <div className="w-4 h-4 rounded-full border-2 border-zinc-200" />
                       <div className="w-12 h-2 bg-zinc-100 rounded-full" />
                    </div>
                    <div className="flex items-center gap-2 opacity-60">
                       <div className="w-4 h-4 rounded-full border-2 border-zinc-200" />
                       <div className="w-10 h-2 bg-zinc-100 rounded-full" />
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Floating Add Todo Input */}
        <div className="bg-white border border-zinc-200/80 shadow-sm rounded-2xl p-2 mb-10 flex flex-col sm:flex-row items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-zinc-900/10">
          <div className="flex-1 w-full flex items-center px-4">
             <input
                placeholder="What do you need to do?"
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
                disabled={addingTodo}
                className="w-full bg-transparent border-none outline-none text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 py-3"
              />
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto px-2 sm:px-0 pb-2 sm:pb-0">
             {/* Time Picker */}
             <div className="relative flex items-center group">
                <Clock className="absolute left-3 w-4 h-4 text-zinc-400 pointer-events-none group-focus-within:text-zinc-900 transition-colors" />
                <input 
                   type="time" 
                   value={newTodoTime}
                   onChange={(e) => setNewTodoTime(e.target.value)}
                   className="pl-9 pr-3 py-2.5 bg-zinc-50 rounded-xl border border-zinc-200/80 text-[14px] font-medium text-zinc-700 outline-none focus:bg-white focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 w-full sm:w-[110px] cursor-text transition-all"
                />
             </div>

             <button 
               onClick={handleAddTodo} 
               disabled={addingTodo || !newTodoTitle.trim()} 
               className="flex items-center gap-1.5 px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-[14px] font-semibold transition-all shadow-md hover:shadow-lg shrink-0"
             >
               <Plus className="w-4 h-4" />
               Add
             </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 text-zinc-400 gap-3">
             <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
             <span className="text-[14px] font-medium">Loading tasks...</span>
          </div>
        )}

        {/* Empty State */}
        {!loading && todos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-white border border-zinc-200 shadow-sm rounded-2xl flex items-center justify-center mb-4">
              <ListTodo className="w-8 h-8 text-zinc-300" />
            </div>
            <p className="text-xl font-semibold text-zinc-900 tracking-tight">No tasks yet</p>
            <p className="text-[15px] font-medium text-zinc-500 mt-1">Enjoy your day or add a task above.</p>
          </div>
        )}

        {/* Todos List */}
        {!loading && todos.length > 0 && (
          <div className="space-y-8">
            {/* Pending Todos */}
            {pendingTodos.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-[12px] font-bold text-zinc-400 mb-4 uppercase tracking-wider pl-1">
                  Pending <span className="px-2 py-0.5 bg-zinc-200 text-zinc-600 rounded-full text-[10px]">{pendingTodos.length}</span>
                </h2>
                <div className="space-y-3">
                  {pendingTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggleDone={handleToggleDone}
                      onDelete={handleDelete}
                      onPromote={handlePromote}
                      onUpdate={handleUpdateTodo}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Done Todos */}
            {doneTodos.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 text-[12px] font-bold text-zinc-400 mb-4 uppercase tracking-wider pl-1">
                  Completed <span className="px-2 py-0.5 bg-zinc-200 text-zinc-600 rounded-full text-[10px]">{doneTodos.length}</span>
                </h2>
                <div className="space-y-3">
                  {doneTodos.map((todo) => (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      onToggleDone={handleToggleDone}
                      onDelete={handleDelete}
                      onPromote={handlePromote}
                      onUpdate={handleUpdateTodo}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Todo Item Component
function TodoItem({
  todo,
  onToggleDone,
  onDelete,
  onPromote,
  onUpdate,
}: {
  todo: Todo;
  onToggleDone: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onPromote: (todo: Todo) => void;
  onUpdate: (id: string, updates: UpdateTodoInput) => void;
}) {
  const isDone = todo.status === "DONE";
  const [isEditingTime, setIsEditingTime] = useState(false);
  
  const initialTime = todo.remindAt ? format(new Date(todo.remindAt), "HH:mm") : "";
  const [editTime, setEditTime] = useState(initialTime);

  const handleTimeSave = () => {
      let remindAt = null;
      if (editTime) {
          const [hours, minutes] = editTime.split(':').map(Number);
          const [y, m, day] = todo.forDate.split('-').map(Number);
          const dateObj = new Date(y, m - 1, day);
          dateObj.setHours(hours, minutes, 0, 0);
          remindAt = dateObj.toISOString();
      }
      onUpdate(todo.id, { remindAt });
      setIsEditingTime(false);
  }

  return (
    <div className={cn(
      "group bg-white rounded-2xl p-4 md:px-6 flex items-start gap-4 transition-all duration-300 relative border",
      isDone 
        ? "border-zinc-100 opacity-50 shadow-none bg-zinc-50/50" 
        : "border-zinc-200/80 hover:border-zinc-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:-translate-y-0.5"
    )}>
      
      {/* Custom Animated Checkbox */}
      <button 
        onClick={() => onToggleDone(todo)}
        className="mt-0.5 shrink-0 relative flex items-center justify-center outline-none group/btn"
      >
        <div className={cn(
          "w-[22px] h-[22px] rounded-full border-[2px] transition-all duration-300 flex items-center justify-center",
          isDone 
            ? "border-emerald-500 bg-emerald-500 scale-110" 
            : "border-zinc-300 group-hover/btn:border-emerald-400 bg-transparent"
        )}>
          <Check className={cn("w-3.5 h-3.5 text-white transition-transform duration-300 delay-100", isDone ? "scale-100" : "scale-0")} strokeWidth={3} />
        </div>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-24">
        <div className="relative inline-block max-w-full">
          <h3 className={cn(
            "font-medium text-[16px] transition-colors duration-300 break-words leading-tight",
            isDone ? "text-zinc-400" : "text-zinc-900"
          )}>
            {todo.title}
          </h3>
          {/* Animated Strikethrough Line */}
          <div className={cn(
            "absolute top-1/2 left-0 h-[2px] bg-zinc-400 -translate-y-1/2 transition-all duration-300 rounded-full",
            isDone ? "w-full opacity-100" : "w-0 opacity-0"
          )} />
        </div>

        {todo.notes && (
          <p className="text-[13px] font-medium text-zinc-500 mt-1.5 line-clamp-2 leading-relaxed">{todo.notes}</p>
        )}
        
        {/* Reminder Pill */}
        <div className="mt-2.5 flex items-center gap-2">
           {isEditingTime ? (
               <div className="flex items-center gap-1.5 bg-zinc-50 border border-zinc-200 rounded-lg p-1 animate-in fade-in slide-in-from-left-2">
                   <input 
                      type="time" 
                      value={editTime} 
                      onChange={(e) => setEditTime(e.target.value)}
                      className="h-7 bg-white text-[13px] font-medium text-zinc-900 px-2 rounded outline-none w-28 border border-zinc-200"
                   />
                   <button onClick={handleTimeSave} className="w-7 h-7 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-700 flex items-center justify-center transition-colors">
                       <CheckCircle2 className="w-4 h-4" />
                   </button>
                   <button onClick={() => setIsEditingTime(false)} className="w-7 h-7 rounded-md hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors">
                       <Trash2 className="w-4 h-4" />
                   </button>
               </div>
           ) : (
              <button 
                onClick={() => setIsEditingTime(true)}
                className="group/time flex items-center gap-1.5 text-[12px] font-semibold px-2.5 py-1 rounded-md bg-zinc-100 border border-zinc-200/60 text-zinc-600 hover:bg-white hover:border-zinc-300 hover:text-zinc-900 hover:shadow-sm transition-all"
              >
                  <Clock className="w-3.5 h-3.5 text-zinc-400 group-hover/time:text-zinc-900 transition-colors" />
                  <span>
                      {todo.remindAt ? format(new Date(todo.remindAt), "h:mm a") : "Set reminder"}
                  </span>
              </button>
           )}
        </div>
      </div>

      {/* Hover Actions (Desktop) */}
      <div className={cn(
        "absolute right-4 top-4 flex items-center gap-1.5 transition-opacity duration-200",
        "opacity-100 md:opacity-0 group-hover:opacity-100"
      )}>
        {!isDone && (
          <button
            onClick={() => onPromote(todo)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-zinc-200 text-blue-600 hover:bg-blue-50 text-[12px] font-bold shadow-sm transition-colors"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Promote</span>
          </button>
        )}
        
        <button
          onClick={() => onDelete(todo.id)}
          className="p-1.5 rounded-lg bg-white border border-zinc-200 text-red-500 hover:bg-red-50 hover:border-red-200 shadow-sm transition-colors"
          title="Delete task"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
