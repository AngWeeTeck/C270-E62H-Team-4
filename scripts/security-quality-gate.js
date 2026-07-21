'use strict';

const fs = require('fs');
const path = require('path');

const reports = {
    backend: path.join('backend', 'npm-audit-backend.json'),
    frontend: path.join('frontend', 'npm-audit-frontend.json'),
    trivy: 'trivy-image-report.json'
};

function readJsonReport(label, filePath) {
    let contents;

    try {
        contents = fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        throw new Error(`${label} report is missing or unreadable (${filePath}): ${error.message}`);
    }

    try {
        return JSON.parse(contents);
    } catch (error) {
        throw new Error(`${label} report contains malformed JSON (${filePath}): ${error.message}`);
    }
}

function npmVulnerabilityTotals(report, label) {
    const totals = report && report.metadata && report.metadata.vulnerabilities;

    if (!totals || typeof totals !== 'object') {
        throw new Error(`${label} report does not contain metadata.vulnerabilities`);
    }

    return {
        moderate: Number(totals.moderate || 0),
        high: Number(totals.high || 0),
        critical: Number(totals.critical || 0)
    };
}

function trivyVulnerabilityTotals(report) {
    if (!report || !Array.isArray(report.Results)) {
        throw new Error('Trivy report does not contain a Results array');
    }

    const totals = { moderate: 0, high: 0, critical: 0 };

    for (const result of report.Results) {
        const vulnerabilities = Array.isArray(result.Vulnerabilities)
            ? result.Vulnerabilities
            : [];

        for (const vulnerability of vulnerabilities) {
            const severity = String(vulnerability.Severity || '').toLowerCase();
            if (Object.prototype.hasOwnProperty.call(totals, severity)) {
                totals[severity] += 1;
            }
        }
    }

    return totals;
}

function runQualityGate() {
    try {
        const backend = npmVulnerabilityTotals(
            readJsonReport('Backend npm audit', reports.backend),
            'Backend npm audit'
        );
        const frontend = npmVulnerabilityTotals(
            readJsonReport('Frontend npm audit', reports.frontend),
            'Frontend npm audit'
        );
        const trivy = trivyVulnerabilityTotals(
            readJsonReport('Trivy', reports.trivy)
        );

        console.log(`Backend npm moderate vulnerabilities: ${backend.moderate}`);
        console.log(`Backend npm high vulnerabilities: ${backend.high}`);
        console.log(`Backend npm critical vulnerabilities: ${backend.critical}`);
        console.log(`Frontend npm moderate vulnerabilities: ${frontend.moderate}`);
        console.log(`Frontend npm high vulnerabilities: ${frontend.high}`);
        console.log(`Frontend npm critical vulnerabilities: ${frontend.critical}`);
        console.log(`Trivy moderate vulnerabilities: ${trivy.moderate}`);
        console.log(`Trivy high vulnerabilities: ${trivy.high}`);
        console.log(`Trivy critical vulnerabilities: ${trivy.critical}`);

        const failed = backend.critical > 0 || frontend.critical > 0 || trivy.critical > 0;
        console.log(`Security quality gate: ${failed ? 'FAILED' : 'PASSED'}`);

        if (failed) {
            process.exitCode = 1;
        }
    } catch (error) {
        console.error(`Security quality gate: ERROR - ${error.message}`);
        process.exitCode = 1;
    }
}

if (require.main === module) {
    runQualityGate();
}

module.exports = {
    npmVulnerabilityTotals,
    trivyVulnerabilityTotals
};
