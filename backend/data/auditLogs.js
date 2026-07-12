const auditLogs = [];

function addAuditLog(entry) {
    const log = {
        action: entry.action,
        reportId: entry.reportId || null,
        actor: entry.actor || "system",
        target: entry.target || null,
        outcome: entry.outcome || "recorded",
        details: entry.details || null,
        timestamp: new Date().toISOString()
    };

    auditLogs.push(log);
}

function getAuditLogs() {
    return auditLogs;
}

function resetAuditLogs() {
    auditLogs.length = 0;
}

module.exports = {
    addAuditLog,
    getAuditLogs,
    resetAuditLogs
};