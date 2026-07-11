const reports = require("../data/reports");
const { addAuditLog, getAuditLogs } = require("../data/auditLogs");


function createReport(req, res) {

    const {
        reporter,
        reportedUser,
        contentType,
        contentId,
        reason,
        description
    } = req.body;

    // Check required fields
    if (!reporter || !reportedUser || !contentType || !contentId || !reason) {
        return res.status(400).json({
            message: "Missing required fields."
        });
    }

    const report = {
        id: reports.length + 1,
        reporter,
        reportedUser,
        contentType,
        contentId,
        reason,
        description: description || ""
    };

    reports.push(report);

    res.status(201).json(report);
}


function getReports(req, res) {

    res.json(reports);

}

function getAuditLogHistory(req, res) {

    const logs = getAuditLogs();

    res.json(logs);

}


function resolveReport(req, res) {

    const reportId = Number(req.params.id);

    const reportIndex = reports.findIndex(
        report => report.id === reportId
    );

    if (reportIndex === -1) {
        return res.status(404).json({
            message: "Report not found."
        });
    }

    const removedReport = reports.splice(reportIndex, 1);

    addAuditLog(
        "REPORT_RESOLVED",
        reportId
    );

    res.json({
        message: "Report resolved successfully.",
        report: removedReport[0]
    });

}


function rejectReport(req, res) {

    const reportId = Number(req.params.id);

    const reportIndex = reports.findIndex(
        report => report.id === reportId
    );

    if (reportIndex === -1) {
        return res.status(404).json({
            message: "Report not found."
        });
    }

    const removedReport = reports.splice(reportIndex, 1);

    addAuditLog(
        "REPORT_REJECTED",
        reportId
    );

    res.json({
        message: "Report rejected successfully.",
        report: removedReport[0]
    });

}


module.exports = {
    createReport,
    getReports,
    resolveReport,
    rejectReport,
    getAuditLogHistory
};