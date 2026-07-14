class ModeratorDashboard {
    constructor() {
        this.baseUrl = "http://localhost:3000";
        this.postsContainer = document.getElementById("posts-container");
        this.reportsContainer = document.getElementById("reports-container");
        this.auditContainer = document.getElementById("audit-container");
        this.roleSelect = document.getElementById("role-select");
        this.roleSelect.addEventListener("change", () => this.onRoleChange());

        this.loadPosts();
        this.loadReports();
        this.loadAuditLogs();
    }

    getRole() {
        return this.roleSelect.value;
    }

    getHeaders() {
        return {
            "Content-Type": "application/json",
            "x-user-role": this.getRole()
        };
    }

    async onRoleChange() {
        this.loadPosts();
        this.loadReports();
        this.loadAuditLogs();
    }

    async loadPosts() {
        const response = await fetch(`${this.baseUrl}/api/posts`, {
            headers: this.getHeaders()
        });
        const posts = await response.json();
        this.renderPosts(posts);
    }

    renderPosts(posts) {
        if (!posts.length) {
            this.postsContainer.innerHTML = "<p>No posts available.</p>";
            return;
        }

        this.postsContainer.innerHTML = posts.map((post) => `
            <div class="card">
                <p>${post.content}</p>
                <div class="actions">
                    <button data-action="report" data-post-id="${post.id}">Report</button>
                    ${this.getRole() === "moderator" || this.getRole() === "admin" ? `<button data-action="delete" data-post-id="${post.id}">Delete</button>` : ""}
                </div>
            </div>
        `).join("");

        this.postsContainer.querySelectorAll("button[data-action='report']").forEach((button) => {
            button.addEventListener("click", () => this.reportPost(Number(button.dataset.postId)));
        });

        this.postsContainer.querySelectorAll("button[data-action='delete']").forEach((button) => {
            button.addEventListener("click", () => this.deletePost(Number(button.dataset.postId)));
        });
    }

    async reportPost(postId) {
        const reason = window.prompt("Enter a report reason", "spam");
        if (!reason) {
            return;
        }

        const response = await fetch(`${this.baseUrl}/api/reports`, {
            method: "POST",
            headers: this.getHeaders(),
            body: JSON.stringify({
                reporterId: `user-${Date.now()}`,
                reportedUserId: "user-2",
                contentType: "post",
                contentId: postId,
                reason,
                description: "Reported from the moderation UI"
            })
        });

        const result = await response.json();
        if (response.ok) {
            this.loadReports();
            this.loadAuditLogs();
            window.alert(`Report submitted: ${result.reason}`);
        } else {
            window.alert(result.message || "Unable to submit report.");
        }
    }

    async deletePost(postId) {
        const response = await fetch(`${this.baseUrl}/api/posts/${postId}`, {
            method: "DELETE",
            headers: this.getHeaders()
        });
        const result = await response.json();
        if (response.ok) {
            this.loadPosts();
            this.loadReports();
            this.loadAuditLogs();
            window.alert(result.message || "Post deleted.");
        } else {
            window.alert(result.message || "Unable to delete post.");
        }
    }

    async loadReports() {
        const response = await fetch(`${this.baseUrl}/api/reports`, {
            headers: this.getHeaders()
        });
        const reports = await response.json();
        this.renderReports(reports);
    }

    renderReports(reports) {
        if (!Array.isArray(reports) || reports.length === 0) {
            this.reportsContainer.innerHTML = "<p>No pending reports.</p>";
            return;
        }

        this.reportsContainer.innerHTML = reports.map((report) => `
            <div class="card">
                <h3>Report #${report.id}</h3>
                <p><strong>Reporter:</strong> ${report.reporterId}</p>
                <p><strong>Reported User:</strong> ${report.reportedUserId}</p>
                <p><strong>Content:</strong> ${report.contentType}:${report.contentId}</p>
                <p><strong>Reason:</strong> ${report.reason}</p>
                <p>${report.description || ""}</p>
                <div class="actions">
                    <button data-action="resolve" data-report-id="${report.id}">Resolve</button>
                    <button data-action="reject" data-report-id="${report.id}">Reject</button>
                </div>
            </div>
        `).join("");

        this.reportsContainer.querySelectorAll("button[data-action='resolve']").forEach((button) => {
            button.addEventListener("click", () => this.resolveReport(Number(button.dataset.reportId)));
        });

        this.reportsContainer.querySelectorAll("button[data-action='reject']").forEach((button) => {
            button.addEventListener("click", () => this.rejectReport(Number(button.dataset.reportId)));
        });
    }

    async resolveReport(id) {
        const response = await fetch(`${this.baseUrl}/api/reports/${id}/resolve`, {
            method: "DELETE",
            headers: this.getHeaders()
        });
        const result = await response.json();
        if (response.ok) {
            this.loadReports();
            this.loadAuditLogs();
            this.loadPosts();
            window.alert(result.message || "Report resolved.");
        } else {
            window.alert(result.message || "Unable to resolve report.");
        }
    }

    async rejectReport(id) {
        const response = await fetch(`${this.baseUrl}/api/reports/${id}/reject`, {
            method: "DELETE",
            headers: this.getHeaders()
        });
        const result = await response.json();
        if (response.ok) {
            this.loadReports();
            this.loadAuditLogs();
            window.alert(result.message || "Report rejected.");
        } else {
            window.alert(result.message || "Unable to reject report.");
        }
    }

    async loadAuditLogs() {
        const response = await fetch(`${this.baseUrl}/api/audit-logs`, {
            headers: this.getHeaders()
        });
        const logs = await response.json();
        this.renderAuditLogs(logs);
    }

    renderAuditLogs(logs) {
        if (!Array.isArray(logs) || logs.length === 0) {
            this.auditContainer.innerHTML = "<p>No moderation actions yet.</p>";
            return;
        }

        this.auditContainer.innerHTML = logs.map((log) => `
            <div class="card">
                <p><strong>${log.action}</strong></p>
                <p>Actor: ${log.actor}</p>
                <p>Target: ${log.target || "n/a"}</p>
                <p>Outcome: ${log.outcome}</p>
                <p>${log.timestamp}</p>
            </div>
        `).join("");
    }
}

const dashboard = new ModeratorDashboard();