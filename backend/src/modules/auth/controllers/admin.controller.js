import * as adminService from "../services/admin.service.js";

export const adminController = {
  async listUsers(req, res) {
    const users = await adminService.listAllUsers();

    return res.json({
      message: "All users retrieved",
      users,
    });
  },
};
