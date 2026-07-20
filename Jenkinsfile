pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    parameters {
        choice(
            name: 'DEPLOY_TARGET',
            choices: ['none', 'local'],
            description: 'Choose whether to start the application locally after tests'
        )

        booleanParam(
            name: 'SKIP_SECURITY_SCAN',
            defaultValue: true,
            description: 'Skip npm audit during initial pipeline testing'
        )
    }

    environment {
        NODE_IMAGE = 'node:18'
        BACKEND_IMAGE = 'forum-backend'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm

                script {
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()

                    echo "Commit: ${env.GIT_COMMIT_SHORT}"
                    echo "Branch: ${env.BRANCH_NAME ?: 'SCM branch'}"
                }
            }
        }

        stage('Environment Check') {
            steps {
                sh '''
                    docker --version
                    docker ps
                    docker-compose --version || true
                '''
            }
        }

        stage('Backend Dependencies') {
            steps {
                sh '''
                    docker run --rm \
                        -v "$WORKSPACE:/workspace" \
                        -w /workspace/backend \
                        ${NODE_IMAGE} \
                        npm ci
                '''
            }
        }

        stage('Backend Tests') {
            steps {
                sh '''
                    docker run --rm \
                        -v "$WORKSPACE:/workspace" \
                        -w /workspace/backend \
                        -e CI=true \
                        ${NODE_IMAGE} \
                        npm run test:ci
                '''
            }

            post {
                always {
                    junit(
                        testResults: 'backend/junit.xml',
                        allowEmptyResults: true
                    )

                    archiveArtifacts(
                        artifacts: 'backend/coverage/**',
                        allowEmptyArchive: true
                    )
                }
            }
        }

        stage('Frontend Dependencies') {
            steps {
                sh '''
                    docker run --rm \
                        -v "$WORKSPACE:/workspace" \
                        -w /workspace/frontend \
                        ${NODE_IMAGE} \
                        npm ci
                '''
            }
        }

        stage('Frontend Tests') {
            steps {
                sh '''
                    docker run --rm \
                        -v "$WORKSPACE:/workspace" \
                        -w /workspace/frontend \
                        -e CI=true \
                        ${NODE_IMAGE} \
                        npm run test:ci
                '''
            }

            post {
                always {
                    junit(
                        testResults: 'frontend/junit.xml',
                        allowEmptyResults: true
                    )

                    archiveArtifacts(
                        artifacts: 'frontend/coverage/**',
                        allowEmptyArchive: true
                    )
                }
            }
        }

        stage('Security Scan') {
            when {
                expression {
                    return !params.SKIP_SECURITY_SCAN
                }
            }

            steps {
                sh '''
                    docker run --rm \
                        -v "$WORKSPACE:/workspace" \
                        -w /workspace/backend \
                        ${NODE_IMAGE} \
                        npm audit --audit-level=high

                    docker run --rm \
                        -v "$WORKSPACE:/workspace" \
                        -w /workspace/frontend \
                        ${NODE_IMAGE} \
                        npm audit --audit-level=high
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                        -t ${BACKEND_IMAGE}:${IMAGE_TAG} \
                        -t ${BACKEND_IMAGE}:latest \
                        .
                '''
            }
        }

        stage('Deploy Locally') {
            when {
                expression {
                    return params.DEPLOY_TARGET == 'local'
                }
            }

            steps {
                sh '''
                    docker-compose down || true
                    docker-compose up -d --build
                '''
            }
        }

        stage('Smoke Test') {
            when {
                expression {
                    return params.DEPLOY_TARGET == 'local'
                }
            }

            steps {
                sh '''
                    echo "Waiting for backend..."

                    for i in $(seq 1 30); do
                        if curl --fail --silent http://localhost:5000 > /dev/null; then
                            echo "Backend is reachable"
                            exit 0
                        fi

                        sleep 2
                    done

                    echo "Backend smoke test failed"
                    docker-compose logs --tail=100 backend || true
                    exit 1
                '''
            }
        }

        stage('Generate Report') {
            steps {
                echo "Build number: ${env.BUILD_NUMBER}"
                echo "Commit: ${env.GIT_COMMIT_SHORT}"
                echo "Build URL: ${env.BUILD_URL}"
                echo "Deployment target: ${params.DEPLOY_TARGET}"
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
            echo "Build URL: ${env.BUILD_URL}"
        }

        failure {
            echo 'Pipeline failed. Review the first failed stage.'
            echo "Build URL: ${env.BUILD_URL}"

            sh '''
                docker-compose ps || true
                docker-compose logs --tail=100 || true
            '''
        }

        always {
            archiveArtifacts(
                artifacts: '**/test-results.txt, **/junit.xml',
                allowEmptyArchive: true
            )
        }
    }
}
