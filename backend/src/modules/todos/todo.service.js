import { db } from "../../config/db.js";
import { todos, followups } from "../../db/schema.js";
import { eq, and, lte, or, isNull } from "drizzle-orm";

/**
 * List todos for a specific date
 */
export async function listTodos(userId, forDate) {
  const targetDate = forDate ? new Date(forDate) : new Date();
  
  const results = await db
    .select()
    .from(todos)
    .where(
      and(
        eq(todos.userId, userId),
        eq(todos.forDate, targetDate)
      )
    )
    .orderBy(todos.createdAt);
  
  return results;
}

/**
 * Create a new todo
 */
export async function createTodo(userId, { title, notes, remindAt, forDate }) {
  const targetDate = forDate ? new Date(forDate) : new Date();
  
  const inserted = await db
    .insert(todos)
    .values({
      userId,
      title,
      notes,
      forDate: targetDate,
      remindAt: remindAt ? new Date(remindAt) : null,
    })
    .returning();
  
  return inserted[0];
}

/**
 * Update a todo
 */
export async function updateTodo(userId, todoId, updates) {
  const updated = await db
    .update(todos)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
    .returning();
  
  if (!updated.length) {
    return null;
  }
  
  return updated[0];
}

/**
 * Delete a todo
 */
export async function deleteTodo(userId, todoId) {
  const deleted = await db
    .delete(todos)
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)))
    .returning();
  
  return deleted.length > 0;
}

/**
 * Get a single todo
 */
export async function getTodoById(userId, todoId) {
  const results = await db
    .select()
    .from(todos)
    .where(and(eq(todos.id, todoId), eq(todos.userId, userId)));
  
  return results.length > 0 ? results[0] : null;
}

/**
 * Promote todo to followup
 */
export async function promoteTodoToFollowup(userId, todoId) {
  // Get the todo
  const todo = await getTodoById(userId, todoId);
  
  if (!todo) {
    return { success: false, error: "Todo not found" };
  }
  
  // Calculate dueAt: use remindAt if available, otherwise now + 60 minutes
  const dueAt = todo.remindAt || new Date(Date.now() + 60 * 60 * 1000);
  
  // Create followup
  const inserted = await db
    .insert(followups)
    .values({
      userId,
      title: todo.title,
      notes: todo.notes,
      dueAt,
      reminderPolicy: "NORMAL",
      priority: "MEDIUM",
    })
    .returning();
  
  const followup = inserted[0];
  
  // Delete the todo
  await deleteTodo(userId, todoId);
  
  return { success: true, followup };
}

/**
 * Get todos due for reminder
 */
export async function getTodosDueForReminder() {
  const now = new Date();
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
  
  const results = await db
    .select()
    .from(todos)
    .where(
      and(
        lte(todos.remindAt, now),
        eq(todos.status, "PENDING"),
        or(
          isNull(todos.lastRemindedAt),
          lte(todos.lastRemindedAt, thirtyMinutesAgo)
        )
      )
    );
  
  return results;
}

/**
 * Update lastRemindedAt for a todo
 */
export async function updateLastRemindedAt(todoId) {
  await db
    .update(todos)
    .set({ lastRemindedAt: new Date() })
    .where(eq(todos.id, todoId));
}
