const reports = [

    {
        id: 1,
        reporter: "Sarah Lim",
        reportedUser: "Jason Tan",
        contentType: "Comment",
        contentId: "CMT-1042",
        reason: "Harassment",
        description: "The comment contained multiple racial slurs, including the N-word, directed at another student. It also included repeated personal insults and encouraged other users to target the student."
    },

    {
        id: 2,
        reporter: "Daniel Wong",
        reportedUser: "Emily Lee",
        contentType: "Thread",
        contentId: "THR-215",
        reason: "Harassment",
        description: "The user disagreed with my opinion about study methods and replied that my approach was ineffective. I felt offended and believe this should be considered harassment, even though no abusive language, threats or personal attacks were used."
    }

];

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