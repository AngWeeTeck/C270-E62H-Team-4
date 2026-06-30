job {
    name 'Forum-Application-Pipeline'
    description 'CI/CD Pipeline for Forum Application with Thread and Reply System'
    
    // SCM Configuration
    scm {
        git {
            remote {
                url 'https://github.com/AngWeeTeck/C270-E62H-Team-4.git'
                credentials 'github-credentials'
            }
            branches '*/feature/wee-teck-user-stories'
            wipeOutWorkspace true
        }
    }
    
    // Pipeline Configuration
    pipelineJob {
        definition {
            cps {
                script readFileFromWorkspace('Jenkinsfile')
                sandbox true
            }
        }
    }
    
    // Triggers
    triggers {
        githubPush()
        pollSCM('H/15 * * * *')
    }
    
    // Parameters
    parameters {
        choice {
            name 'ENVIRONMENT'
            choices ['development', 'staging', 'production']
            description 'Deployment environment'
            defaultValue 'development'
        }
        
        booleanParam {
            name 'RUN_TESTS'
            defaultValue true
            description 'Run all tests'
        }
        
        booleanParam {
            name 'BUILD_DOCKER'
            defaultValue true
            description 'Build Docker images'
        }
        
        booleanParam {
            name 'DEPLOY'
            defaultValue false
            description 'Deploy to environment'
        }
    }
    
    // Options
    options {
        buildDiscarder {
            strategy {
                logRotator {
                    daysToKeepStr '30'
                    numToKeepStr '10'
                    artifactDaysToKeepStr '-1'
                    artifactNumToKeepStr '5'
                }
            }
        }
        timeout {
            absolute 30
        }
        timestamps()
    }
    
    // Post Build Actions
    publishers {
        junit {
            testResults 'backend/test-results.xml,frontend/test-results.xml'
            healthScaleFactor 100.0
            allowEmptyResults true
        }
        
        publishHTML {
            reportDir 'backend/coverage'
            reportFiles 'index.html'
            reportName 'Backend Coverage Report'
            keepAll true
            alwaysLinkToLastBuild true
        }
        
        publishHTML {
            reportDir 'frontend/coverage'
            reportFiles 'index.html'
            reportName 'Frontend Coverage Report'
            keepAll true
            alwaysLinkToLastBuild true
        }
        
        archiveArtifacts {
            artifacts 'build-reports/**,backend/coverage/**,frontend/coverage/**'
            onlyIfSuccessful false
            fingerprint true
        }
        
        emailext {
            triggers {
                success()
                failure()
                unstable()
            }
            subject '${PROJECT_NAME} - Build #${BUILD_NUMBER} - ${BUILD_STATUS}'
            body '''
                Build Information:
                Project: ${PROJECT_NAME}
                Build Number: ${BUILD_NUMBER}
                Build Status: ${BUILD_STATUS}
                Build URL: ${BUILD_URL}
                
                Git Information:
                Branch: ${GIT_BRANCH}
                Commit: ${GIT_COMMIT_SHORT}
                
                Check console output at ${BUILD_URL} to view the results.
            '''
            to '${DEFAULT_RECIPIENTS}'
            mimeType 'text/html'
        }
    }
}
