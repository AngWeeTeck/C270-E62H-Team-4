const express = require("express");
const router = express.Router();

const {
    createReport,
    getReports,
    resolveReport,
    rejectReport,
    getAuditLogHistory
} = require("../controllers/moderationController");

router.post("/reports", createReport);

router.get("/reports", getReports);

router.get("/audit-logs", getAuditLogHistory);

router.delete("/reports/:id/resolve", resolveReport);

router.delete("/reports/:id/reject", rejectReport);

module.exports = router;