import { Request, Response } from "express";
import { db } from "../config/database";
import { sendSuccess, sendError } from "../utils/response";

export class AuthController {
  /**
   * Send OTP to user's email
   */
  static async getStates(req: Request, res: Response) {
    try {
      const states = await db("states")
        .select(
          "state_title as title",
          "state_code as code",
          "state_flag as flag"
        )
        .where("state_status", 1);

      return sendSuccess(res, { states }, "States fetched successfully");
    } catch (error) {
      console.error("States error:", error);
      return sendError(res, 500, "Internal server error");
    }
  }
}
