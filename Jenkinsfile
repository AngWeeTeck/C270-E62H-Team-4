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
            defaultValue: false,
            description: 'Skip dependency security scans only when troubleshooting'
        )
    }

    environment {
        NODE_IMAGE = 'node:20'
        BACKEND_IMAGE = 'forum-backend'
        DOCKERHUB_REPOSITORY = '25047232/forum-backend'
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
                    docker compose version || docker-compose --version
                '''
            }
        }

        stage('Backend Dependencies') {
            steps {
                sh '''
                    docker run --rm \
                        --volumes-from jenkins-forum \
                        -w "$WORKSPACE/backend" \
                        ${NODE_IMAGE} \
                        npm ci
                '''
            }
        }

        stage('Backend Tests') {
            steps {
                sh '''
                    docker run --rm \
                        --volumes-from jenkins-forum \
                        -w "$WORKSPACE/backend" \
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
                    JENKINS_UID=$(id -u)
                    JENKINS_GID=$(id -g)

                    docker run --rm -u ${JENKINS_UID}:${JENKINS_GID} \
                        -v ${WORKSPACE}:/workspace -w /workspace/frontend \
                        node:20 bash -lc "npm ci"
                '''
            }
        }

        stage('Frontend Tests') {
            steps {
                sh '''
                    JENKINS_UID=$(id -u)
                    JENKINS_GID=$(id -g)

                    docker run --rm -u ${JENKINS_UID}:${JENKINS_GID} \
                        -v ${WORKSPACE}:/workspace -w /workspace/frontend \
                        -e CI=true \
                        node:20 bash -lc "npm run test:ci"
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

        stage('Security Scans') {
            environment {
                DOCKER_HOST = 'tcp://host.docker.internal:2375'
            }
            steps {
                echo 'Running Trivy Scan...'
                sh 'docker run --privileged --rm -v ${WORKSPACE}:/apps aquasec/trivy:latest fs /apps'
                
                echo 'Running OWASP Dependency-Check...'
                sh 'docker run --privileged --rm -v ${WORKSPACE}:/report owasp/dependency-check:latest --project "Forum App" --scan /report'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build --pull --no-cache \
                        -t "${BACKEND_IMAGE}:${IMAGE_TAG}" \
                        -t "${BACKEND_IMAGE}:latest" \
                        -t "${DOCKERHUB_REPOSITORY}:${IMAGE_TAG}" \
                        -t "${DOCKERHUB_REPOSITORY}:latest" \
                        .

                    docker run --rm "forum-backend:${BUILD_NUMBER}" \
                        sh -c "node --version; npm --version; npm root -g; npm ls -g tar --all || true; apk info -v libcrypto3 libssl3 || true"
                '''
            }
        }

        stage('Generate SBOM') {
            steps {
                sh '''
                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        --volumes-from jenkins-forum \
                        anchore/syft:latest \
                        "forum-backend:${BUILD_NUMBER}" \
                        -o cyclonedx-json="$WORKSPACE/sbom.cdx.json"

                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        --volumes-from jenkins-forum \
                        anchore/syft:latest \
                        "forum-backend:${BUILD_NUMBER}" \
                        -o table="$WORKSPACE/sbom.txt"
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_TOKEN'
                    )
                ]) {
                    sh '''
                        set +x
                        echo "$DOCKERHUB_TOKEN" | docker login \
                            --username "$DOCKERHUB_USERNAME" \
                            --password-stdin
                        set -x

                        docker push "${DOCKERHUB_REPOSITORY}:${IMAGE_TAG}"
                        docker push "${DOCKERHUB_REPOSITORY}:latest"
                        docker logout
                    '''
                }
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
                    # (health_check + deploy/rollback logic unchanged)
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
        always {
            sh 'docker run --rm -v ${WORKSPACE}:/workspace -w /workspace alpine chown -R 1000:1000 .'
            deleteDir()
        }

        failure {
            echo 'Pipeline failed. Review the first failed stage.'
            echo "Build URL: ${env.BUILD_URL}"

            sh <<'BASH'
                compose() {
                    if docker compose version >/dev/null 2>&1; then
                        docker compose "$@"
                    else
                        docker-compose "$@"
                    fi
                }

                compose ps || true
                compose logs --tail=100 || true
            BASH
        }

        always {
            archiveArtifacts(
                artifacts: '''backend/coverage/**,
                    frontend/coverage/**,
                    backend/npm-audit-backend.json,
                    frontend/npm-audit-frontend.json,
                    sbom.cdx.json,
                    sbom.txt,
                    **/test-results.txt,
                    **/junit.xml''',
                allowEmptyArchive: true
            )
        }

        cleanup {
            script {
                sh "docker run --rm -v /var/jenkins_home/workspace:/ws alpine chown -R 1000:1000 /ws/Forum-Application-Pipeline /ws/Forum-Application-Pipeline@2 || true"
                deleteDir()
            }
        }
    }
}
