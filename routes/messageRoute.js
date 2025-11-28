import { addMessage,getMessage } from "../controllers/messageController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
import Router from "express"
const router = Router();
router.post("/addmsg/",AuthMiddleware,addMessage);
router.post("/getmsg",AuthMiddleware,getMessage);
export default router;