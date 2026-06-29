// Shared Jenkins Library for Reusable Pipeline Functions
// Place this file in: vars/forumPipeline.groovy in Jenkins Shared Library

def notify(String status, String message) {
    echo "📨 Sending notification: ${status}"
    emailext(
        subject: "${status} - Build #${BUILD_NUMBER}",
        body: message,
        to: '${DEFAULT_RECIPIENTS}'
    )
}

def runTests(String projectDir) {
    echo "🧪 Running tests in ${projectDir}..."
    dir(projectDir) {
        sh '''
            npm test -- --coverage --testPathPattern=tests/ 2>&1 | tee test-results.txt
            tail -20 test-results.txt
        '''
    }
}

def buildDocker(String imageName, String tag) {
    echo "🐳 Building Docker image: ${imageName}:${tag}"
    sh """
        docker build -t ${imageName}:${tag} \
                     -t ${imageName}:latest .
        docker images | grep ${imageName}
    """
}

def pushDocker(String imageName, String tag, String registry, String username, String password) {
    echo "📤 Pushing Docker image to ${registry}"
    sh """
        echo "${password}" | docker login -u "${username}" --password-stdin
        docker tag ${imageName}:${tag} ${registry}/${imageName}:${tag}
        docker push ${registry}/${imageName}:${tag}
        docker logout
    """
}

def deployToServer(String server, String sshKey, String sshUser, String deployScript) {
    echo "🚀 Deploying to ${server}"
    sh """
        ssh -i ${sshKey} -o StrictHostKeyChecking=no ${sshUser}@${server} \
            "${deployScript}"
    """
}

def healthCheck(String url, int maxRetries = 5, int delaySeconds = 10) {
    echo "✅ Running health check on ${url}"
    sh """
        for i in {1..${maxRetries}}; do
            echo "Attempt \$i of ${maxRetries}..."
            HTTP_CODE=\$(curl -s -o /dev/null -w "%{http_code}" ${url})
            
            if [ "\$HTTP_CODE" -eq 200 ]; then
                echo "✅ Health check passed"
                exit 0
            fi
            
            if [ \$i -lt ${maxRetries} ]; then
                sleep ${delaySeconds}
            fi
        done
        
        echo "❌ Health check failed after ${maxRetries} attempts"
        exit 1
    """
}

def cleanupDockerImages() {
    echo "🧹 Cleaning up Docker images"
    sh '''
        docker image prune -f --filter="dangling=true" || true
        docker container prune -f || true
    '''
}

def runSecurityScan() {
    echo "🔒 Running security scan"
    sh '''
        echo "Checking backend dependencies..."
        cd backend && npm audit --production || true
        
        echo "Checking frontend dependencies..."
        cd ../frontend && npm audit --production || true
    '''
}

def generateReport(String artifactPath) {
    echo "📊 Generating build report"
    sh """
        mkdir -p ${artifactPath}
        cat > ${artifactPath}/summary.txt << EOF
Build Information
=================
Build Number: \${BUILD_NUMBER}
Git Branch: \${GIT_BRANCH}
Git Commit: \${GIT_COMMIT_SHORT}
Build Status: \${currentBuild.result}
Build URL: \${BUILD_URL}

Timestamp: \$(date)
EOF
    """
}
