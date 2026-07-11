class ModeratorDashboard {

    constructor() {

        this.reportsContainer = document.getElementById("reports-container");
        this.auditContainer = document.getElementById("audit-container");

        this.loadReports();
        this.loadAuditLogs();

    }


    async loadReports() {

        const response = await fetch(
            "http://localhost:3000/api/reports"
        );

        const reports = await response.json();

        this.renderReports(reports);

    }


    renderReports(reports) {

        if (reports.length === 0) {

            this.reportsContainer.innerHTML = `
                <p>No pending reports.</p>
            `;

            return;

        }


        this.reportsContainer.innerHTML = reports.map(report => `

            <div class="card">

                <h3>Report #${report.id}</h3>

                <p>
                    <strong>Reporter:</strong>
                    ${report.reporter}
                </p>

                <p>
                    <strong>Reported User:</strong>
                    ${report.reportedUser}
                </p>

                <p>
                    <strong>Content Type:</strong>
                    ${report.contentType}
                </p>

                <p>
                    <strong>Reason:</strong>
                    ${report.reason}
                </p>

                <p>
                    ${report.description}
                </p>


                <button onclick="dashboard.resolveReport(${report.id})">
                    Resolve
                </button>


                <button onclick="dashboard.rejectReport(${report.id})">
                    Reject
                </button>

            </div>

        `).join("");

    }


    async resolveReport(id) {

        await fetch(
            `http://localhost:3000/api/reports/${id}/resolve`,
            {
                method: "DELETE"
            }
        );


        this.loadReports();
        this.loadAuditLogs();

    }



    async rejectReport(id) {

        await fetch(
            `http://localhost:3000/api/reports/${id}/reject`,
            {
                method: "DELETE"
            }
        );


        this.loadReports();
        this.loadAuditLogs();

    }



    async loadAuditLogs() {

        const response = await fetch(
            "http://localhost:3000/api/audit-logs"
        );

        const logs = await response.json();


        this.renderAuditLogs(logs);

    }



    renderAuditLogs(logs) {


        if (logs.length === 0) {

            this.auditContainer.innerHTML = `
                <p>No moderation actions yet.</p>
            `;

            return;

        }


        this.auditContainer.innerHTML = logs.map(log => `

            <div class="card">

                <p>
                    <strong>${log.action}</strong>
                </p>

                <p>
                    Report ID: ${log.reportId}
                </p>

                <p>
                    ${log.timestamp}
                </p>

            </div>

        `).join("");

    }

}


const dashboard = new ModeratorDashboard();