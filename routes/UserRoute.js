import { SignUpController,LoginController,GetAllUser, Logout } from "../controllers/UserController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
import { Router } from "express";
const router= Router();
router.post('/sign-up',SignUpController);
router.post('/login',LoginController);
router.get('/all-user',AuthMiddleware,GetAllUser);
router.get('/logout',Logout);
export default router;