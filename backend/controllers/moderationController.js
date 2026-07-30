const { addReport, getReportsList, findReportById, removeReportById, hasDuplicateReport } = require("../data/reports");
const { addAuditLog, getAuditLogs } = require("../data/auditLogs");

const posts = [];

function createPost(content) {
    const post = {
        id: posts.length + 1,
        content,
        deleted: false
    };
    posts.push(post);
    return post;
}

function getPosts() {
    return posts.filter((post) => !post.deleted);
}

function deletePost(id) {
    const post = posts.find((entry) => entry.id === id);
    if (!post) {
        return null;
    }
    post.deleted = true;
    return post;
}

function ensureModerator(req, res, next) {
    const role = req.headers["x-user-role"] || req.headers["x-user-role"].toLowerCase();
    if (role !== "moderator" && role !== "admin") {
        return res.status(403).json({ message: "Moderator access required." });
    }
    next();
}

function createReport(req, res) {
    const {
        reporterId,
        reportedUserId,
        contentType,
        contentId,
        reason,
        description
    } = req.body;

    if (!reporterId || !reportedUserId || !contentType || !contentId || !reason || !String(reason).trim()) {
        return res.status(400).json({ message: "Missing required fields." });
    }

    if (hasDuplicateReport({ reporterId, contentType, contentId })) {
        return res.status(409).json({ message: "You have already reported this content." });
    }

    const report = {
        id: getReportsList().length + 1,
        reporterId,
        reportedUserId,
        contentType,
        contentId,
        reason: String(reason).trim(),
        description: description ? String(description).trim() : "",
        status: "pending"
    };

    addReport(report);
    addAuditLog({
        action: "REPORT_SUBMITTED",
        reportId: report.id,
        actor: reporterId,
        target: `${contentType}:${contentId}`,
        outcome: "submitted",
        details: { reason }
    });

    res.status(201).json(report);
}

function getReports(req, res) {
    const role = req.headers["x-user-role"];
    if (role !== "moderator" && role !== "admin") {
        return res.status(403).json({ message: "Moderator access required." });
    }

    res.json(getReportsList());
}

function getAuditLogHistory(req, res) {
    const role = req.headers["x-user-role"];
    if (role !== "moderator" && role !== "admin") {
        return res.status(403).json({ message: "Moderator access required." });
    }

    res.json(getAuditLogs());
}

function resolveReport(req, res) {
    const role = req.headers["x-user-role"];
    if (role !== "moderator" && role !== "admin") {
        return res.status(403).json({ message: "Moderator access required." });
    }

    const reportId = Number(req.params.id);
    const report = findReportById(reportId);

    if (!report) {
        return res.status(404).json({ message: "Report not found." });
    }

    removeReportById(reportId);
    addAuditLog({
        action: "REPORT_RESOLVED",
        reportId,
        actor: role,
        target: `${report.contentType}:${report.contentId}`,
        outcome: "resolved",
        details: { reason: report.reason }
    });

    res.json({ message: "Report resolved successfully.", report });
}

function rejectReport(req, res) {
    const role = req.headers["x-user-role"];
    if (role !== "moderator" && role !== "admin") {
        return res.status(403).json({ message: "Moderator access required." });
    }

    const reportId = Number(req.params.id);
    const report = findReportById(reportId);

    if (!report) {
        return res.status(404).json({ message: "Report not found." });
    }

    removeReportById(reportId);
    addAuditLog({
        action: "REPORT_REJECTED",
        reportId,
        actor: role,
        target: `${report.contentType}:${report.contentId}`,
        outcome: "rejected",
        details: { reason: report.reason }
    });

    res.json({ message: "Report rejected successfully.", report });
}

function deletePostHandler(req, res) {
    const role = req.headers["x-user-role"];
    if (role !== "moderator" && role !== "admin") {
        return res.status(403).json({ message: "Moderator access required." });
    }

    const postId = Number(req.params.id);
    const deletedPost = deletePost(postId);
    if (!deletedPost) {
        return res.status(404).json({ message: "Post not found." });
    }

    addAuditLog({
        action: "POST_DELETED",
        reportId: null,
        actor: role,
        target: `post:${postId}`,
        outcome: "deleted",
        details: { deletedPost }
    });

    res.json({ message: "Post deleted successfully.", post: deletedPost });
}

function getPostsHandler(req, res) {
    res.json(getPosts());
}

module.exports = {
    createReport,
    getReports,
    resolveReport,
    rejectReport,
    getAuditLogHistory,
    deletePostHandler,
    getPostsHandler,
    getPosts,
    createPost,
    ensureModerator,
    resetModerationData: () => {
        const { resetReports } = require("../data/reports");
        const { resetAuditLogs } = require("../data/auditLogs");
        resetReports();
        resetAuditLogs();
        posts.length = 0;
        createPost("Sample post");
    }
};