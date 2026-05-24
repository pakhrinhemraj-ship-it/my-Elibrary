import express from "express";
import { chatWithLibrarian, summarizeBook } from "../controllers/aiController.js";

const router = express.Router();

router.post("/chat", chatWithLibrarian);
router.post("/summarize-book", summarizeBook);

export default router;
