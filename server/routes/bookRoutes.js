import express from "express";
import {
  getBookStats,
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} from "../controllers/bookController.js";

const router = express.Router();

router.get("/stats/summary", getBookStats);
router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/", createBook);
router.put("/:id", updateBook);
router.delete("/:id", deleteBook);

export default router;
