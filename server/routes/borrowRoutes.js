import express from "express";
import {
  getBorrowRecords,
  getOverdueRecords,
  borrowBook,
  returnBook,
  getMemberBorrowHistory,
} from "../controllers/borrowController.js";

const router = express.Router();

router.get("/overdue", getOverdueRecords);
router.get("/", getBorrowRecords);
router.post("/borrow", borrowBook);
router.put("/return/:id", returnBook);
router.get("/history/:memberId", getMemberBorrowHistory);

export default router;
