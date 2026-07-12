const reports = [];

function resetReports() {
    reports.length = 0;
}

function addReport(report) {
    reports.push(report);
}

function getReportsList() {
    return reports;
}

function findReportById(id) {
    return reports.find((report) => report.id === id);
}

function removeReportById(id) {
    const index = reports.findIndex((report) => report.id === id);
    if (index === -1) {
        return null;
    }
    return reports.splice(index, 1)[0];
}

function hasDuplicateReport({ reporterId, contentType, contentId }) {
    return reports.some((report) => report.reporterId === reporterId && report.contentType === contentType && report.contentId === contentId);
}

module.exports = {
    reports,
    resetReports,
    addReport,
    getReportsList,
    findReportById,
    removeReportById,
    hasDuplicateReport
};