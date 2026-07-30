const express = require("express");
const router = express.Router();

const {
    createReport,
    getReports,
    resolveReport,
    rejectReport,
    getAuditLogHistory,
    deletePostHandler,
    getPostsHandler
} = require("../controllers/moderationController");

router.get("/posts", getPostsHandler);
router.post("/reports", createReport);
router.get("/reports", getReports);
router.get("/audit-logs", getAuditLogHistory);
router.delete("/reports/:id/resolve", resolveReport);
router.delete("/reports/:id/reject", rejectReport);
router.delete("/posts/:id", deletePostHandler);

module.exports = router;