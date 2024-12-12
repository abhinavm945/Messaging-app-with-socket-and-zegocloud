// routes/AuthRoutes.js
import { Router } from "express";
import {
  checkUser,
  generateToken,
  getAllUsers,
  onBoardUser,
} from "../controllers/AuthController.js";

const router = Router();

router.post("/checkuser", checkUser);
router.post("/onboard-user", onBoardUser);
router.get("/get-contacts", getAllUsers);
router.get("/generate-token/:userId", generateToken)

export default router;
