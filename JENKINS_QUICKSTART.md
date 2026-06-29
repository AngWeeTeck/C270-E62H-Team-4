# Quick Start: Jenkins Pipeline for Forum Project

## 🚀 30-Second Setup

### Option 1: Automated Setup (Docker)

```bash
chmod +x setup-jenkins.sh
./setup-jenkins.sh
```

This will:
- Start Jenkins in Docker
- Install required plugins
- Display initial admin password
- Show next steps

### Option 2: Manual Setup

1. **Start Jenkins**
   ```bash
   docker run -d \
     -p 8080:8080 \
     -v jenkins_home:/var/jenkins_home \
     jenkins/jenkins:lts-jdk17
   ```

2. **Get Initial Password**
   ```bash
   docker exec jenkins-forum cat /var/jenkins_home/secrets/initialAdminPassword
   ```

3. **Open Jenkins**
   - Navigate to: `http://localhost:8080`
   - Paste the initial password
   - Install suggested plugins
   - Create admin user

---

## ⚙️ Configure Pipeline

### Step 1: Create New Pipeline Job

1. Jenkins Dashboard → New Item
2. Enter name: `Forum-Application-Pipeline`
3. Select: Pipeline
4. Click OK

### Step 2: Configure SCM

1. Pipeline section
2. Definition: Pipeline script from SCM
3. SCM: Git
4. Repository URL: `https://github.com/AngWeeTeck/C270-E62H-Team-4`
5. Credentials: Add GitHub credentials
6. Branches: `*/feature/wee-teck-user-stories` or `*/main`
7. Script Path: `Jenkinsfile`

### Step 3: Configure Build Triggers

Check these options:
- [ ] GitHub hook trigger for GITscm polling
- [ ] Poll SCM: `H/15 * * * *` (every 15 minutes)

### Step 4: Save Job

Click Save. Pipeline is now configured!

---

## 🔑 Required Credentials

### GitHub Credentials

1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token with:
   - `repo` (full control)
   - `admin:repo_hook` (write access to hooks)
3. Jenkins → Manage Jenkins → Manage Credentials
4. Add credentials:
   - ID: `github-credentials`
   - Kind: Username with password
   - Username: your-github-username
   - Password: your-github-token

### Docker Hub Credentials (Optional)

1. Jenkins → Manage Jenkins → Manage Credentials
2. Add credentials:
   - ID: `docker-hub`
   - Kind: Username with password
   - Username: your-docker-username
   - Password: your-docker-token or password

### SSH Server Credentials (For Deployment)

1. Generate SSH key pair (if you don't have one):
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/jenkins_deploy
   ```

2. Copy public key to servers:
   ```bash
   ssh-copy-id -i ~/.ssh/jenkins_deploy.pub user@staging.example.com
   ssh-copy-id -i ~/.ssh/jenkins_deploy.pub user@prod.example.com
   ```

3. Jenkins → Manage Jenkins → Manage Credentials
4. Add credentials:
   - ID: `staging-server` or `prod-server`
   - Kind: SSH Username with private key
   - Username: deploy-user
   - Private key: (paste content of ~/.ssh/jenkins_deploy)

---

## 📦 Required Jenkins Plugins

Install via: Jenkins → Manage Jenkins → Manage Plugins → Available

### Essential Plugins

- **Pipeline** - Defines pipeline stages
- **Git** - Git repository support
- **GitHub** - GitHub integration
- **Docker** - Docker CLI support
- **Docker Pipeline** - Docker in pipelines
- **NodeJS** - Node.js tool installation
- **Email Extension** - Email notifications
- **JUnit** - Test result reporting
- **HTML Publisher** - Coverage reports
- **Timestamper** - Build log timestamps

### Optional Plugins

- **Blue Ocean** - Better visualization
- **JacoCo** - Code coverage
- **SonarQube** - Code quality analysis
- **Slack Notification** - Slack integration
- **Ansible** - Infrastructure automation

---

## 🎯 Running Your First Build

### Manual Trigger

1. Jenkins Dashboard → Forum-Application-Pipeline
2. Build with Parameters
3. Select:
   - ENVIRONMENT: development
   - RUN_TESTS: ✓
   - BUILD_DOCKER: ✓
   - DEPLOY: (unchecked for first run)
4. Build Now

### Monitor Build

1. Click on Build #1
2. View Console Output
3. Watch real-time progress

### Check Results

1. Build page shows:
   - ✅ Build Status
   - 📊 Test Results
   - 📈 Coverage Reports
   - 🔍 Build Artifacts

---

## 🧪 Pipeline Stages

```
Checkout
    ↓
Setup
    ↓
Backend: Install Dependencies
    ↓
Frontend: Install Dependencies
    ↓
Backend: Lint & Analysis
    ↓
Frontend: Lint & Analysis
    ↓
Backend: Unit Tests ✓ (17 tests)
    ↓
Frontend: Unit Tests ✓ (41 tests)
    ↓
Security Scan
    ↓
Build Docker Image
    ↓
Push Docker Image (production only)
    ↓
Deploy (if enabled)
    ↓
Smoke Tests
    ↓
Generate Reports
```

---

## 📊 Viewing Reports

### Test Results

```
Forum-Application-Pipeline → Build #123 → Test Result
- 17 backend tests passed
- 41 frontend tests passed
- 0 failures
```

### Coverage Reports

1. **Backend Coverage**
   - URL: `http://localhost:8080/job/Forum-Application-Pipeline/123/Backend_Coverage_Report/`
   - Shows: lines, branches, functions

2. **Frontend Coverage**
   - URL: `http://localhost:8080/job/Forum-Application-Pipeline/123/Frontend_Coverage_Report/`
   - Shows: lines, branches, functions

---

## 🔧 Environment Variables

Set in Jenkinsfile or Jenkins configuration:

```groovy
environment {
    DOCKER_REGISTRY = 'docker.io'
    DOCKER_IMAGE_NAME = 'forum-backend'
    NODE_ENV = "${params.ENVIRONMENT}"
    NODEJS_VERSION = '18'
}
```

---

## 📧 Email Notifications

### Configure Email

1. Jenkins → Manage Jenkins → Configure System
2. E-mail Notification section:
   - SMTP server: smtp.gmail.com
   - Default user e-mail suffix: @gmail.com
   - Enable SSL: ✓
   - SMTP Port: 587

3. Extended E-mail Notification:
   - SMTP server: smtp.gmail.com
   - Default Recipients: team@example.com

### Email Triggers

- ✅ Build success
- ❌ Build failure
- ⚠️ Build unstable

---

## 🚀 Deploying to Environments

### Development

Automatic on successful build:
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Staging

Manual trigger with SSH deploy:
1. Build with Parameters
2. ENVIRONMENT: staging
3. DEPLOY: ✓
4. Jenkins connects via SSH and runs deployment

### Production

Requires manual approval:
1. Build with Parameters
2. ENVIRONMENT: production
3. DEPLOY: ✓
4. Approval prompt appears
5. After approval, deploys with blue-green strategy

---

## ⚡ Performance Tips

1. **Use Docker for Jenkins**
   - Ensures consistent environment
   - Easy to scale and backup
   - Isolates from host system

2. **Enable Docker Plugin**
   - Run build agents in Docker
   - Faster provisioning
   - Better resource isolation

3. **Parallel Testing**
   - Backend and frontend tests run simultaneously
   - Reduces total pipeline time

4. **Docker Layer Caching**
   - Reuses base image layers
   - Faster rebuilds

---

## 🔍 Troubleshooting

### Jenkins Won't Start

```bash
# Check Docker logs
docker logs jenkins-forum

# Increase memory
docker run -e JAVA_OPTS="-Xmx2g" jenkins/jenkins:lts-jdk17
```

### Pipeline Fails at Git Checkout

```
Error: Authentication failed
Solution: Verify GitHub credentials in Jenkins
```

### Tests Timeout

```groovy
// Increase timeout in Jenkinsfile
timeout(time: 45, unit: 'MINUTES')
```

### Docker Build Fails

```bash
# Verify Docker access
docker ps

# Add Jenkins user to docker group
sudo usermod -aG docker jenkins

# Restart Jenkins
docker restart jenkins-forum
```

---

## 📚 Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [Groovy Syntax](https://groovy-lang.org/syntax.html)
- [GitHub Integration](https://docs.github.com/en/developers/webhooks-and-events)

---

## 🎓 Next Steps

1. ✅ Set up Jenkins
2. ✅ Create pipeline job
3. ✅ Configure credentials
4. ✅ Run first build
5. → Optimize pipeline performance
6. → Set up staging/production deployment
7. → Enable automated notifications
8. → Implement blue-green deployment

---

**Happy CI/CD! 🎉**
