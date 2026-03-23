"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Trash2, TrendingUp, Calendar as CalendarIcon, CheckCircle2, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

import * as todoApi from "@/lib/todos";
import type { Todo, UpdateTodoInput } from "@/lib/todos";

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
         // Combine currentDate + newTodoTime
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
      const followup = await todoApi.promoteTodo(todo.id);
      setTodos(todos.filter(t => t.id !== todo.id));
      toast.success("Promoted to followup");
      
      // Optional: navigate to followups
      // router.push("/followups");
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

  // Separate pending and done
  const pendingTodos = todos.filter(t => t.status === "PENDING");
  const doneTodos = todos.filter(t => t.status === "DONE");

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Header with Date Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">Daily Todos</h1>
          <p className="text-sm text-zinc-500 mt-1">Simple task list for the day</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={gotoPreviousDay}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center gap-2 px-4  py-2 bg-zinc-50 rounded-md border">
            <CalendarIcon className="w-4 h-4 text-zinc-500" />
            <span className="font-medium text-sm">
              {format(currentDate, "MMM dd, yyyy")}
            </span>
          </div>
          
          <Button variant="outline" size="icon" onClick={gotoNextDay}>
            <ChevronRight className="w-4 h-4" />
          </Button>
          
          {!isToday && (
            <Button variant="default" size="sm" onClick={gotoToday}>
              Today
            </Button>
          )}
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Add Todo Input */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 w-full">
             <Input
                placeholder="Add a new todo..."
                value={newTodoTitle}
                onChange={(e) => setNewTodoTitle(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
                disabled={addingTodo}
                className="pr-20"
              />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
             {/* Time Picker for New Todo */}
             <div className="flex-1 sm:w-32">
                <Input 
                   type="time" 
                   value={newTodoTime}
                   onChange={(e) => setNewTodoTime(e.target.value)}
                   className="cursor-pointer w-full"
                />
             </div>

             <Button onClick={handleAddTodo} disabled={addingTodo} className="shrink-0">
               <Plus className="w-4 h-4 mr-2" />
               Add
             </Button>
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12 text-zinc-500">
          Loading todos...
        </div>
      )}

      {/* Empty State */}
      {!loading && todos.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-zinc-500">No todos for this day</p>
          <p className="text-sm text-zinc-400 mt-2">Add your first todo above</p>
        </Card>
      )}

      {/* Todos List */}
      {!loading && todos.length > 0 && (
        <div className="space-y-6">
          {/* Pending Todos */}
          {pendingTodos.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-zinc-700 mb-3 uppercase tracking-wide">
                Pending ({pendingTodos.length})
              </h2>
              <div className="space-y-2">
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
              <h2 className="text-sm font-semibold text-zinc-700 mb-3 uppercase tracking-wide">
                Completed ({doneTodos.length})
              </h2>
              <div className="space-y-2">
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
  );
}

// Todo Item Component
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
  
  // Initialize edit time from todo, or default to ""
  const initialTime = todo.remindAt ? format(new Date(todo.remindAt), "HH:mm") : "";
  const [editTime, setEditTime] = useState(initialTime);

  const handleTimeSave = () => {
      let remindAt = null;
      if (editTime) {
          // Use the todo's existing date (or today/todo.forDate if we need to be precise, usually remindAt includes date)
          // Since remindAt is timestamptz, we should preserve the date part of the *existing* remindAt if possible, 
          // OR use the todo's 'forDate'.
          // Using forDate is safer because users might change the time for the *assigned* day.
          
          const [hours, minutes] = editTime.split(':').map(Number);
          const d = new Date(todo.forDate); // forDate is YYYY-MM-DD
          // Important: forDate is likely UTC or local date string. 
          // new Date("YYYY-MM-DD") -> UTC midnight usually.
          // But we want to set local time.
          // Let's assume forDate is "YYYY-MM-DD".
          // We should parse it as local date parts to avoid timezone shift issues on day boundaries.
          const [y, m, day] = todo.forDate.split('-').map(Number);
          const dateObj = new Date(y, m - 1, day); // local midnight
          
          dateObj.setHours(hours, minutes, 0, 0);
          remindAt = dateObj.toISOString();
      }
      
      onUpdate(todo.id, { remindAt });
      setIsEditingTime(false);
  }

  return (
    <Card className={`p-4 ${isDone ? "opacity-60" : ""}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <Checkbox
          checked={isDone}
          onCheckedChange={() => onToggleDone(todo)}
          className="mt-1"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${isDone ? "line-through text-zinc-500" : "text-zinc-900"}`}>
            {todo.title}
          </h3>
          {todo.notes && (
            <p className="text-sm text-zinc-500 mt-1">{todo.notes}</p>
          )}
          
          {/* Reminder Section */}
          <div className="mt-1.5 flex items-center gap-2">
             {isEditingTime ? (
                 <div className="flex items-center gap-1">
                     <Input 
                        type="time" 
                        value={editTime} 
                        onChange={(e) => setEditTime(e.target.value)}
                        className="h-6 w-24 text-xs px-1"
                     />
                     <Button size="icon" variant="ghost" className="h-6 w-6" onClick={handleTimeSave}>
                         <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                     </Button>
                     <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setIsEditingTime(false)}>
                         <Trash2 className="w-3 h-3 text-zinc-400" />
                     </Button>
                 </div>
             ) : (
                <div 
                  className="group flex items-center gap-1.5 text-xs text-zinc-400 hover:text-blue-600 cursor-pointer transition-colors w-fit"
                  onClick={() => setIsEditingTime(true)}
                >
                    <Clock className="w-3 h-3" />
                    <span>
                        {todo.remindAt ? format(new Date(todo.remindAt), "h:mm a") : "Set reminder"}
                    </span>
                </div>
             )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!isDone && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPromote(todo)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <TrendingUp className="w-4 h-4 mr-1" />
              Promote
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(todo.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
