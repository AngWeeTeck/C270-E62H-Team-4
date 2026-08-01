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

        booleanParam(
            name: 'STRICT_SECURITY_GATE',
            defaultValue: false,
            description: 'Fail immediately when HIGH or CRITICAL image vulnerabilities are detected'
        )
    }

    environment {
        NODE_IMAGE = 'node:20'
        TRIVY_IMAGE = 'aquasec/trivy:latest'
        BACKEND_IMAGE = 'forum-backend'
        DOCKERHUB_REPOSITORY = '25047232/forum-backend'
        IMAGE_TAG = "${BUILD_NUMBER}"
        SECURITY_GATE_STATUS = 'NOT_RUN'
        SECURITY_HIGH_COUNT = '0'
        SECURITY_CRITICAL_COUNT = '0'
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

        stage('Lint (Hadolint)') {
            steps {
                sh '''
                    docker run --rm -i hadolint/hadolint < Dockerfile
                    docker run --rm -i hadolint/hadolint < archive/legacy-prototypes/fastapi/Dockerfile
                '''
            }
        }

        stage('Python Unit Tests (FastAPI archive)') {
            steps {
                sh '''
                    docker run --rm \
                        -v jenkins_home:/var/jenkins_home \
                        -w "$WORKSPACE/archive/legacy-prototypes/fastapi" \
                        python:3.12-slim sh -c '
                            pwd &&
                            ls -la &&
                            test -f requirements.txt &&
                            test -f requirements-dev.txt &&
                            pip install -q -r requirements.txt -r requirements-dev.txt &&
                            pytest -v --cov=app --junitxml=junit.xml
                        '
                '''
            }
            post {
                always {
                    junit(testResults: 'archive/legacy-prototypes/fastapi/junit.xml', allowEmptyResults: true)
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
                    docker run --rm \
                        --volumes-from jenkins-forum \
                        -w "$WORKSPACE/frontend" \
                        ${NODE_IMAGE} \
                        npm ci
                '''
            }
        }

        stage('Frontend Tests') {
            steps {
                sh '''
                    docker run --rm \
                        --volumes-from jenkins-forum \
                        -w "$WORKSPACE/frontend" \
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

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'

                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }


        stage('Dependency & Security Scan') {
            when {
                expression {
                    return !params.SKIP_SECURITY_SCAN
                }
            }

            steps {
                sh '''
                    docker run --rm \
                        --volumes-from jenkins-forum \
                        -w "$WORKSPACE/backend" \
                        ${NODE_IMAGE} \
                        sh -c "npm audit --json > npm-audit-backend.json || true"

                    docker run --rm \
                        --volumes-from jenkins-forum \
                        -w "$WORKSPACE/frontend" \
                        ${NODE_IMAGE} \
                        sh -c "npm audit --json > npm-audit-frontend.json || true"
                    
                    echo "Running Trivy File System Security Scan..."
                    docker run --rm -v "$WORKSPACE:/apps" aquasec/trivy:latest fs /apps || true
                '''
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

        stage('Trivy Image Scan') {
            when {
                expression {
                    return !params.SKIP_SECURITY_SCAN
                }
            }
            steps {
                sh '''
                    echo "Running Trivy Container Image Scan..."
                    docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy:latest image --severity HIGH,CRITICAL "${BACKEND_IMAGE}:${IMAGE_TAG}" || true
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

        stage('Image Vulnerability Quality Gate') {
            steps {
                echo 'Scanning the built image for HIGH and CRITICAL CVEs...'

                script {
                    int securityGateExitCode = sh(
                        returnStatus: true,
                        script: '''
                            set -u

                            REPORT="$WORKSPACE/trivy-high-critical.txt"
                            trap 'echo "Trivy HIGH/CRITICAL report:"; cat "$REPORT" 2>/dev/null || true' EXIT

                            docker run --rm \
                                -v /var/run/docker.sock:/var/run/docker.sock \
                                --volumes-from jenkins-forum \
                                "${TRIVY_IMAGE}" image \
                                --scanners vuln \
                                --severity HIGH,CRITICAL \
                                --exit-code 1 \
                                --no-progress \
                                --format table \
                                --output "$REPORT" \
                                "${BACKEND_IMAGE}:${IMAGE_TAG}"
                        '''
                    )

                    env.SECURITY_HIGH_COUNT = sh(
                        returnStdout: true,
                        script: '''grep -Ec '[[:space:]]HIGH([[:space:]]|$)' "$WORKSPACE/trivy-high-critical.txt" || true'''
                    ).trim()
                    env.SECURITY_CRITICAL_COUNT = sh(
                        returnStdout: true,
                        script: '''grep -Ec '[[:space:]]CRITICAL([[:space:]]|$)' "$WORKSPACE/trivy-high-critical.txt" || true'''
                    ).trim()

                    if (securityGateExitCode != 0) {
                        env.SECURITY_GATE_STATUS = 'FAILED'

                        if (params.STRICT_SECURITY_GATE) {
                            error('Security Quality Gate detected HIGH or CRITICAL vulnerabilities. Strict mode is enabled; stopping the pipeline.')
                        }

                        currentBuild.result = 'UNSTABLE'
                        echo 'Security Quality Gate detected HIGH or CRITICAL vulnerabilities. Continuing in demonstration mode.'
                    } else {
                        env.SECURITY_GATE_STATUS = 'PASSED'
                    }
                }
            }

            post {
                success {
                    script {
                        if (env.SECURITY_GATE_STATUS == 'PASSED') {
                            echo 'Quality Gate passed: no HIGH or CRITICAL CVEs were found.'
                        } else {
                            echo 'Quality Gate detected vulnerabilities and continued in demonstration mode.'
                        }
                    }
                }

                failure {
                    echo 'Quality Gate failed: the image contains a HIGH or CRITICAL CVE.'
                }

                always {
                    archiveArtifacts(
                        artifacts: 'trivy-high-critical.txt',
                        allowEmptyArchive: true
                    )
                }
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

stage('Sign Image (Cosign)') {
    steps {
        withCredentials([
            file(credentialsId: 'cosign-private-key', variable: 'COSIGN_KEY_FILE'),
            string(credentialsId: 'cosign-key-password', variable: 'COSIGN_PASSWORD'),
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

                cosign sign --key "$COSIGN_KEY_FILE" --yes \
                    "${DOCKERHUB_REPOSITORY}:${IMAGE_TAG}"

                cosign verify --key cosign.pub \
                    "${DOCKERHUB_REPOSITORY}:${IMAGE_TAG}"

                cosign attest --key "$COSIGN_KEY_FILE" --yes \
                    --type cyclonedx \
                    --predicate "$WORKSPACE/sbom.cdx.json" \
                    "${DOCKERHUB_REPOSITORY}:${IMAGE_TAG}"

                cosign verify-attestation --key cosign.pub \
                    --type cyclonedx \
                    "${DOCKERHUB_REPOSITORY}:${IMAGE_TAG}"

                docker logout
            '''
        }
    }
}

        stage('Pre-Deploy Verification Gate') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKERHUB_USERNAME',
                        passwordVariable: 'DOCKERHUB_TOKEN'
                    )
                ]) {
                    sh '''
                        set -eu

                        CONTAINER_NAME="predeploy-${BUILD_NUMBER}"

                        cleanup() {
                            docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
                            docker logout >/dev/null 2>&1 || true
                        }
                        trap cleanup EXIT

                        set +x
                        echo "$DOCKERHUB_TOKEN" | docker login \
                            --username "$DOCKERHUB_USERNAME" \
                            --password-stdin
                        set -x

                        echo "Pulling the deployment image from Docker Hub..."
                        docker pull "${DOCKERHUB_REPOSITORY}:${IMAGE_TAG}"
                        IMAGE_REF=$(docker image inspect \
                            --format='{{index .RepoDigests 0}}' \
                            "${DOCKERHUB_REPOSITORY}:${IMAGE_TAG}")

                        test -n "$IMAGE_REF"
                        echo "Verifying image signature for $IMAGE_REF..."
                        cosign verify --key cosign.pub "$IMAGE_REF"

                        echo "Verifying CycloneDX SBOM attestation..."
                        cosign verify-attestation --key cosign.pub \
                            --type cyclonedx \
                            "$IMAGE_REF"

                        echo "Starting an isolated pre-deploy test container..."
                        docker run -d \
                            --name "$CONTAINER_NAME" \
                            -p 127.0.0.1::5000 \
                            "$IMAGE_REF"

                        HOST_PORT=$(docker port "$CONTAINER_NAME" 5000/tcp | sed 's/.*://')
                        test -n "$HOST_PORT"
                        BASE_URL="http://127.0.0.1:${HOST_PORT}"

                        READY=false
                        for i in $(seq 1 15); do
                            if curl --fail --silent "$BASE_URL/" >/dev/null; then
                                READY=true
                                break
                            fi
                            echo "Waiting for test container ($i/15)..."
                            sleep 2
                        done

                        if [ "$READY" != "true" ]; then
                            docker logs "$CONTAINER_NAME" || true
                            echo "Pre-deploy test container did not become ready."
                            exit 1
                        fi

                        echo "Running pre-deploy smoke tests..."
                        curl --fail --silent --show-error "$BASE_URL/" >/dev/null
                        curl --fail --silent --show-error "$BASE_URL/students" >/dev/null
                        curl --fail --silent --show-error "$BASE_URL/stats" >/dev/null

                        echo "Pre-deploy verification gate passed."
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
                    set +e

                    health_check() {
                        HEALTH_FAILURE_REASON=""

                        for i in $(seq 1 30); do
                            if ! docker container inspect forum-backend >/dev/null 2>&1; then
                                HEALTH_FAILURE_REASON="forum-backend does not exist"
                                echo "Health-check attempt $i of 30: $HEALTH_FAILURE_REASON"
                                sleep 2
                                continue
                            fi

                            RUNNING=$(docker inspect --format='{{.State.Running}}' forum-backend 2>/dev/null)
                            STATUS=$(docker inspect --format='{{.State.Status}}' forum-backend 2>/dev/null)

                            if [ "$RUNNING" != "true" ]; then
                                HEALTH_FAILURE_REASON="forum-backend is not running (status: $STATUS)"
                                echo "Health-check attempt $i of 30: $HEALTH_FAILURE_REASON"
                                return 1
                            fi

                            HAS_HEALTHCHECK=$(docker inspect --format='{{if .Config.Healthcheck}}true{{else}}false{{end}}' forum-backend 2>/dev/null)

                            if [ "$HAS_HEALTHCHECK" = "true" ]; then
                                HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' forum-backend 2>/dev/null)
                                echo "Health-check attempt $i of 30: container=$STATUS health=$HEALTH_STATUS"

                                if [ "$HEALTH_STATUS" = "healthy" ]; then
                                    return 0
                                fi

                                if [ "$HEALTH_STATUS" = "unhealthy" ]; then
                                    HEALTH_FAILURE_REASON="forum-backend became unhealthy"
                                    return 1
                                fi
                            else
                                echo "Health-check attempt $i of 30: container=$STATUS (no Docker healthcheck configured)"
                                return 0
                            fi

                            HEALTH_FAILURE_REASON="forum-backend did not become healthy"
                            sleep 2
                        done

                        return 1
                    }

                    NEW_IMAGE="${BACKEND_IMAGE}:${IMAGE_TAG}"
                    PREVIOUS_IMAGE=""

                    echo "New image: $NEW_IMAGE"

                    if ! docker container inspect forum-mongodb >/dev/null 2>&1; then
                        echo "Required existing MongoDB container forum-mongodb was not found; it will not be created or replaced."
                        exit 1
                    fi

                    echo "Reusing existing MongoDB container: forum-mongodb"

                    MONGODB_RUNNING=$(docker inspect --format='{{.State.Running}}' forum-mongodb 2>/dev/null)
                    if [ "$MONGODB_RUNNING" != "true" ]; then
                        echo "Starting existing MongoDB container: forum-mongodb"
                        docker start forum-mongodb

                        if [ "$?" -ne 0 ]; then
                            echo "Existing MongoDB container could not be started."
                            exit 1
                        fi
                    fi

                    echo "Waiting for the existing MongoDB container to become ready..."
                    for i in $(seq 1 30); do
                        MONGODB_STATUS=$(docker inspect --format='{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' forum-mongodb 2>/dev/null)
                        echo "MongoDB check $i of 30: $MONGODB_STATUS"

                        if [ "$MONGODB_STATUS" = "healthy" ] || [ "$MONGODB_STATUS" = "running" ]; then
                            break
                        fi

                        if [ "$MONGODB_STATUS" = "unhealthy" ] || [ "$MONGODB_STATUS" = "exited" ] || [ "$MONGODB_STATUS" = "dead" ]; then
                            echo "Existing MongoDB container is not usable; it will not be replaced."
                            exit 1
                        fi

                        if [ "$i" -eq 30 ]; then
                            echo "Existing MongoDB container did not become ready; it will not be replaced."
                            exit 1
                        fi

                        sleep 2
                    done

                    if docker container inspect forum-backend >/dev/null 2>&1; then
                        CURRENT_IMAGE_REFERENCE=$(docker inspect --format='{{.Config.Image}}' forum-backend 2>/dev/null)
                        PREVIOUS_IMAGE=$(docker inspect --format='{{.Image}}' forum-backend 2>/dev/null)
                        echo "Current deployed image: $CURRENT_IMAGE_REFERENCE"
                        echo "Immutable rollback image ID: $PREVIOUS_IMAGE"

                        if [ -z "$PREVIOUS_IMAGE" ] || ! docker image inspect "$PREVIOUS_IMAGE" >/dev/null 2>&1; then
                            echo "The current backend image ID is not available locally; rollback will not be attempted."
                            PREVIOUS_IMAGE=""
                        else
                            echo "Verified rollback image exists locally: $PREVIOUS_IMAGE"
                        fi

                        echo "Removing existing backend container: forum-backend"
                        docker rm -f forum-backend || true
                    else
                        echo "Current deployed image: none"
                        echo "No existing forum-backend container was found."
                    fi

                    export IMAGE_TAG="${IMAGE_TAG}"
                    export DEPLOY_IMAGE="$NEW_IMAGE"
                    echo "Deploying exact tested image: $DEPLOY_IMAGE"

                    docker compose -f docker-compose.deploy.yml up -d --no-deps --no-build backend
                    DEPLOY_START_STATUS=$?

                    if [ "$DEPLOY_START_STATUS" -eq 0 ]; then
                        health_check
                        DEPLOY_HEALTH_STATUS=$?
                    else
                        DEPLOY_HEALTH_STATUS=1
                        HEALTH_FAILURE_REASON="Docker Compose failed to start the new backend (exit code: $DEPLOY_START_STATUS)"
                    fi

                    if [ "$DEPLOY_START_STATUS" -eq 0 ] && [ "$DEPLOY_HEALTH_STATUS" -eq 0 ]; then
                        echo "Deployment successful. Rollback is not required."
                        exit 0
                    fi

                    echo "Reason for rollback: $HEALTH_FAILURE_REASON"
                    echo "Failed new image: $NEW_IMAGE"

                    if docker container inspect forum-backend >/dev/null 2>&1; then
                        echo "Logs from failed forum-backend container:"
                        docker logs --tail=100 forum-backend || true
                    fi

                    if [ -z "$PREVIOUS_IMAGE" ]; then
                        echo "Deployment failed and no previous version was available for rollback."
                        exit 1
                    fi

                    echo "Rollback image: $PREVIOUS_IMAGE"
                    docker rm -f forum-backend || true

                    export DEPLOY_IMAGE="$PREVIOUS_IMAGE"
                    docker compose -f docker-compose.deploy.yml up -d --no-deps --no-build backend
                    ROLLBACK_START_STATUS=$?

                    if [ "$ROLLBACK_START_STATUS" -eq 0 ]; then
                        health_check
                        ROLLBACK_HEALTH_STATUS=$?
                    else
                        ROLLBACK_HEALTH_STATUS=1
                        HEALTH_FAILURE_REASON="Docker Compose failed to start the rollback backend (exit code: $ROLLBACK_START_STATUS)"
                    fi

                    if [ "$ROLLBACK_START_STATUS" -eq 0 ] && [ "$ROLLBACK_HEALTH_STATUS" -eq 0 ]; then
                        echo "Rollback completed successfully."
                        echo "New deployment failed. Previous version was restored successfully."
                        exit 1
                    fi

                    echo "Rollback result: failed - $HEALTH_FAILURE_REASON"
                    if docker container inspect forum-backend >/dev/null 2>&1; then
                        docker logs --tail=100 forum-backend || true
                    fi
                    echo "New deployment and automatic rollback both failed."
                    exit 1
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
                    echo "Running Thread Quest smoke test..."

                    docker run --rm \
                        --network forum-network \
                        -v "$WORKSPACE/smoke.test.json:/etc/newman/smoke.test.json:ro" \
                        postman/newman:6-alpine \
                        run smoke.test.json \
                        --env-var baseUrl=http://forum-backend:5000
                '''
            }
        }

        stage('Generate Report') {
            steps {
                echo "Build number: ${env.BUILD_NUMBER}"
                echo "Commit: ${env.GIT_COMMIT_SHORT}"
                echo "Build URL: ${env.BUILD_URL}"
                echo "Deployment target: ${params.DEPLOY_TARGET}"
                echo "Security gate status: ${env.SECURITY_GATE_STATUS}"
                echo "HIGH vulnerabilities: ${env.SECURITY_HIGH_COUNT}"
                echo "CRITICAL vulnerabilities: ${env.SECURITY_CRITICAL_COUNT}"
                echo "Strict security gate enabled: ${params.STRICT_SECURITY_GATE}"
                echo "Final Jenkins build result: ${currentBuild.currentResult}"
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
                compose() {
                    if docker compose version >/dev/null 2>&1; then
                        docker compose "$@"
                    else
                        docker-compose "$@"
                    fi
                }

                compose ps || true
                compose logs --tail=100 || true
            '''
        }

        always {
            archiveArtifacts(
                artifacts: '''backend/coverage/**,
                    frontend/coverage/**,
                    backend/npm-audit-backend.json,
                    frontend/npm-audit-frontend.json,
                    sbom.cdx.json,
                    sbom.txt,
                    trivy-high-critical.txt,
                    **/test-results.txt,
                    **/junit.xml''',
                allowEmptyArchive: true
            )
        }
    }
}
