# Jenkins Configuration Guide

## Overview

This Jenkinsfile implements a comprehensive CI/CD pipeline for the Forum application with the following stages:

1. **Checkout** - Clone repository
2. **Setup** - Verify environment
3. **Dependencies** - Install backend & frontend dependencies
4. **Lint & Analysis** - Code quality checks
5. **Unit Tests** - Run test suites
6. **Security Scan** - Vulnerability detection
7. **Build Docker** - Create container image
8. **Push Docker** - Registry upload (production only)
9. **Deploy** - Environment-specific deployment
10. **Smoke Tests** - Post-deployment verification
11. **Reports** - Generate artifacts

---

## Prerequisites

### Jenkins Setup

1. **Install Jenkins** (2.300+)
   ```bash
   # Docker
   docker run -d -p 8080:8080 -p 50000:50000 jenkins/jenkins:latest
   ```

2. **Required Jenkins Plugins**
   - Pipeline
   - Git
   - Docker
   - Email Extension
   - HTML Publisher
   - JUnit

   Install via: Jenkins → Manage Jenkins → Manage Plugins

3. **Node.js Plugin**
   - Install NodeJS Plugin
   - Configure Node.js (18.x) in Jenkins

4. **Credentials Setup**
   - GitHub: Settings → Developer settings → Personal access tokens
   - Docker Hub: Docker Hub account credentials
   - SSH Keys: For deployment servers

---

## Configuration

### 1. Jenkins Credentials

#### Docker Hub Credentials
```
Jenkins → Manage Jenkins → Manage Credentials
- ID: docker-hub
- Type: Username with password
- Username: your-docker-username
- Password: your-docker-token
```

#### Staging Server SSH
```
Jenkins → Manage Jenkins → Manage Credentials
- ID: staging-server
- Type: SSH Username with private key
- Username: deploy-user
- Private Key: (paste your SSH key)
```

#### Production Server SSH
```
Jenkins → Manage Jenkins → Manage Credentials
- ID: prod-server
- Type: SSH Username with private key
- Username: deploy-user
- Private Key: (paste your SSH key)
```

### 2. Global Configuration

Edit `.env` in root directory:
```env
STAGING_SERVER=staging.example.com
PROD_SERVER=prod.example.com
DEFAULT_RECIPIENTS=team@example.com
```

### 3. Environment Variables

Add to Jenkins job configuration or global environment:

```groovy
environment {
    DOCKER_REGISTRY = 'docker.io'
    DOCKER_IMAGE_NAME = 'forum-backend'
    NODEJS_VERSION = '18'
}
```

---

## Pipeline Parameters

### Manual Triggers

When running the job manually, you can set:

| Parameter | Options | Default | Description |
|-----------|---------|---------|-------------|
| ENVIRONMENT | development, staging, production | development | Target environment |
| RUN_TESTS | true, false | true | Execute test suites |
| BUILD_DOCKER | true, false | true | Build Docker image |
| DEPLOY | true, false | false | Deploy to environment |

---

## Build Stages Explained

### Checkout
- Clones repository from SCM
- Extracts Git commit hash and branch name
- Sets environment variables

### Setup
- Verifies Node.js and npm installation
- Displays version information

### Install Dependencies
- Backend: `npm install --production=false`
- Frontend: `npm install --production=false`

### Lint & Analysis
- Code quality checks
- ESLint (if configured)
- Static analysis

### Unit Tests
- Backend: Jest test suite
  - File: `backend/tests/*.test.js`
  - Coverage: Generates HTML report
- Frontend: Jest test suite
  - File: `frontend/tests/*.test.js`
  - Coverage: Generates HTML report

### Security Scan
- `npm audit` on dependencies
- Checks for known vulnerabilities
- Reports issues (non-blocking)

### Build Docker
- Multi-stage build
- Tags with build number, latest, and branch
- Optimized production image (51.7MB)

### Push Docker
- Only runs in production environment
- Authenticates to Docker Hub
- Pushes tags:
  - `{user}/{image}:{BUILD_NUMBER}`
  - `{user}/{image}:latest`

### Deploy

#### Development
```bash
docker-compose -f docker-compose.dev.yml up -d
```

#### Staging/Production
```bash
# SSH to server and run
docker-compose up -d
```

### Smoke Tests
- Verify services are running
- Test health endpoints
- Validate critical functionality

### Generate Reports
- Creates build summary
- Archives test coverage reports
- Collects artifacts

---

## Usage Examples

### Run with Default Settings
1. New Item → Pipeline
2. Select "Pipeline script from SCM"
3. SCM: Git → Repository URL
4. Credentials: GitHub credentials
5. Script Path: `Jenkinsfile`
6. Build Now

### Manual Build with Parameters
```groovy
Build with Parameters

ENVIRONMENT: production
RUN_TESTS: true
BUILD_DOCKER: true
DEPLOY: true (requires approval)
```

### Build on Git Push
```
Pipeline → Configure
Build Triggers: [✓] GitHub hook trigger for GITscm polling
```

---

## Test Reports

### Access Test Results

1. **Build Page**
   - Jenkins → Job → Build #123
   - Test Result: "17 tests passed"

2. **Coverage Reports**
   - HTML Publisher → Backend Coverage Report
   - HTML Publisher → Frontend Coverage Report
   - Shows line, branch, function coverage

3. **Test History**
   - Trend graph showing pass/fail over builds
   - Performance metrics

---

## Deployment Workflow

### Development Flow
```
Push to branch → Jenkins triggers → Tests run → Docker built → Auto-deploy
```

### Staging Flow
```
Merge to staging → Jenkins triggers → Tests run → Docker built → SSH deploy → Approval required
```

### Production Flow
```
Merge to main → Jenkins triggers → Tests run → Docker built → Push to registry → Manual approval → SSH deploy
```

---

## Notifications

### Email Notifications

Success Email:
```
✅ Build #123 Successful
Job: Forum-Pipeline
Branch: main
URL: http://jenkins:8080/job/Forum-Pipeline/123/
```

Failure Email:
```
❌ Build #123 Failed
Job: Forum-Pipeline
Branch: feature/user-stories
URL: http://jenkins:8080/job/Forum-Pipeline/123/
Reason: Test failure in backend
```

### Slack Integration (Optional)

Add to post section:
```groovy
slackSend(
    color: '${currentBuild.result}' == 'SUCCESS' ? 'good' : 'danger',
    message: "Build ${BUILD_NUMBER} - ${currentBuild.result}",
    channel: '#devops'
)
```

---

## Troubleshooting

### Jenkins Can't Find Node.js
```
Jenkins → Manage Jenkins → Global Tool Configuration
- NodeJS → NodeJS installations
- Add Node.js 18.x
```

### Docker Build Fails
```bash
# Check Docker daemon
docker ps

# Verify Docker access in Jenkins user
sudo usermod -aG docker jenkins

# Restart Jenkins
sudo systemctl restart jenkins
```

### Tests Timeout
```groovy
// Increase timeout in Jenkinsfile
timeout(time: 45, unit: 'MINUTES')
```

### SSH Deployment Fails
```bash
# Test SSH connection
ssh -i key-file -o StrictHostKeyChecking=no user@server "ls"

# Check credentials in Jenkins
Jenkins → Manage Credentials → Verify SSH key
```

---

## Best Practices

1. **Secure Credentials**
   - Store in Jenkins Credentials Store
   - Never commit secrets to repo
   - Use separate credentials per environment

2. **Pipeline Performance**
   - Parallel stages where possible
   - Cache Docker layers
   - Clean old artifacts

3. **Testing**
   - Always run tests before deployment
   - Maintain > 70% code coverage
   - Run security scans

4. **Deployment**
   - Use blue-green deployment for production
   - Always require manual approval for prod
   - Keep deployment scripts in version control

5. **Monitoring**
   - Set up health checks after deployment
   - Monitor build trends
   - Review failed builds promptly

---

## Advanced Configuration

### Parallel Testing
```groovy
parallel(
    'Backend Tests': { sh 'cd backend && npm test' },
    'Frontend Tests': { sh 'cd frontend && npm test' }
)
```

### Conditional Steps
```groovy
when {
    expression { params.ENVIRONMENT == 'production' }
}
```

### Stage View
```
Jenkins → Blue Ocean
- Visual pipeline view
- Better error reporting
- Real-time execution
```

---

## Maintenance

### Regular Tasks

1. **Weekly**
   - Review build logs
   - Check test coverage trends
   - Verify deployments successful

2. **Monthly**
   - Update dependencies
   - Review security scans
   - Archive old builds

3. **Quarterly**
   - Update Node.js version
   - Review pipeline efficiency
   - Optimize Docker builds

---

## Related Documentation

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Pipeline Syntax Reference](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Docker Documentation](https://docs.docker.com/)
- [GitHub Webhooks](https://docs.github.com/en/developers/webhooks-and-events)
