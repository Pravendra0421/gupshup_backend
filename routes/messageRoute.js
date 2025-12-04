import { addMessage,getMessage, getUnreadCounts, markMessageRead } from "../controllers/messageController.js";
import AuthMiddleware from "../middleware/AuthMiddleware.js";
import Router from "express"
const router = Router();
router.post("/addmsg/",AuthMiddleware,addMessage);
router.post("/getmsg",AuthMiddleware,getMessage);
router.get("/unread-counts",AuthMiddleware,getUnreadCounts);
router.post("/mark-read",AuthMiddleware,markMessageRead);
export default router;