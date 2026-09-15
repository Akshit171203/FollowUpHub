import * as todoService from "./todo.service.js";

export const todoController = {
  /**
   * GET /api/todos?date=YYYY-MM-DD
   */
  async list(req, res) {
    try {
      const { date } = req.query;
      const todos = await todoService.listTodos(req.user.id, date);

      return res.json({ todos });
    } catch (error) {
      console.error("List todos error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * POST /api/todos
   */
  async create(req, res) {
    try {
      const { title, notes, remindAt, forDate } = req.body;

      if (!title) {
        return res.status(400).json({ message: "title is required" });
      }

      const todo = await todoService.createTodo(req.user.id, {
        title,
        notes,
        remindAt,
        forDate,
      });

      return res.status(201).json({
        message: "Todo created",
        todo,
      });
    } catch (error) {
      console.error("Create todo error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * PATCH /api/todos/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { title, notes, status, remindAt } = req.body;

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (notes !== undefined) updates.notes = notes;
      if (status !== undefined) updates.status = status;
      if (remindAt !== undefined) updates.remindAt = remindAt ? new Date(remindAt) : null;

      const todo = await todoService.updateTodo(req.user.id, id, updates);

      if (!todo) {
        return res.status(404).json({ message: "Todo not found" });
      }

      return res.json({
        message: "Todo updated",
        todo,
      });
    } catch (error) {
      console.error("Update todo error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * DELETE /api/todos/:id
   */
  async remove(req, res) {
    try {
      const { id } = req.params;

      const success = await todoService.deleteTodo(req.user.id, id);

      if (!success) {
        return res.status(404).json({ message: "Todo not found" });
      }

      return res.json({ message: "Todo deleted" });
    } catch (error) {
      console.error("Delete todo error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },

  /**
   * POST /api/todos/:id/promote
   */
  async promote(req, res) {
    try {
      const { id } = req.params;

      const result = await todoService.promoteTodoToFollowup(req.user.id, id);

      if (!result.success) {
        return res.status(404).json({ message: result.error });
      }

      return res.json({
        message: "Todo promoted to followup",
        followup: result.followup,
      });
    } catch (error) {
      console.error("Promote todo error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  },
};
