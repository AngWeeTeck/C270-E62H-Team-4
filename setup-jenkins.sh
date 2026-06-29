#!/bin/bash

# Jenkins Setup Script
# Configures Jenkins for the Forum project CI/CD pipeline

set -e

echo "🚀 Jenkins Setup Script for Forum Project"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if Docker is running
if ! docker ps >/dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Docker is not running. Starting Docker...${NC}"
    if command -v open >/dev/null; then
        open -a Docker
    else
        systemctl start docker
    fi
    sleep 5
fi

echo -e "${BLUE}1️⃣  Starting Jenkins Container...${NC}"
docker run -d \
  --name jenkins-forum \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v /usr/local/bin/docker:/usr/local/bin/docker \
  --env JENKINS_OPTS="--httpPort=8080" \
  jenkins/jenkins:lts-jdk17

echo -e "${GREEN}✅ Jenkins started on http://localhost:8080${NC}"
echo ""

echo -e "${BLUE}2️⃣  Waiting for Jenkins to be ready...${NC}"
sleep 30

echo -e "${BLUE}3️⃣  Getting Initial Admin Password...${NC}"
JENKINS_PASSWORD=$(docker exec jenkins-forum cat /var/jenkins_home/secrets/initialAdminPassword)
echo -e "${GREEN}Initial Admin Password: ${JENKINS_PASSWORD}${NC}"
echo ""

echo -e "${BLUE}4️⃣  Installing Jenkins Plugins...${NC}"
docker exec jenkins-forum bash -c '
    jenkins-plugin-cli \
        --plugins \
        pipeline-model-definition \
        pipeline-stage-view \
        git \
        github-api \
        github-branch-source \
        docker-plugin \
        docker-workflow \
        email-ext \
        publish-over-ssh \
        nodejs \
        timestamper \
        junit \
        jira \
        htmlpublisher
' || echo -e "${YELLOW}⚠️  Some plugins may need manual installation${NC}"

echo -e "${GREEN}✅ Jenkins setup completed!${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Open http://localhost:8080 in your browser"
echo "2. Use the initial password shown above"
echo "3. Complete Jenkins Setup Wizard"
echo "4. Create a new Pipeline job"
echo "5. Use repository URL: https://github.com/AngWeeTeck/C270-E62H-Team-4"
echo "6. Set pipeline script path to: Jenkinsfile"
echo "7. Configure GitHub webhook for automatic builds"
echo ""
echo -e "${YELLOW}📝 To stop Jenkins:${NC}"
echo "docker stop jenkins-forum"
echo ""
echo -e "${YELLOW}📝 To view Jenkins logs:${NC}"
echo "docker logs -f jenkins-forum"
