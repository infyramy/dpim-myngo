import { Router } from "express";
import { AuthController } from "../controllers/states.controller";

const router = Router();

// OTP-based authentication routes
router.get("/", AuthController.getStates);

export default router;
