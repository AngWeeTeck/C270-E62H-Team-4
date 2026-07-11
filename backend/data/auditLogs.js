const auditLogs = [];

function addAuditLog(action, reportId) {

    const log = {
        action: action,
        reportId: reportId,
        timestamp: new Date()
    };

    auditLogs.push(log);

}

function getAuditLogs() {

    return auditLogs;

}

module.exports = {
    addAuditLog,
    getAuditLogs
};