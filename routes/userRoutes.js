import express from "express";
import {
  auth,
  register,
  confirm,
  forgotPassword,
  checkToken,
  newPassword,
  profile,
} from "../controllers/userControllers.js";
import checkAuth from "../middleware/checkAuth.js";

const router = express.Router();
router.post("/", register); // Creater a new user
router.post("/login", auth); // Auth
router.get("/confirm/:token", confirm);
router.post("/forgot-password", forgotPassword);
router.route("/forgot-password/:token").get(checkToken).post(newPassword);

router.get("/profile", checkAuth, profile);
//* Auth, Register and Confirmation users

export default router;
