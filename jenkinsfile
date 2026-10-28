
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        GIT_REPO  = 'https://github.com/elaraby3705/AI-Voice-Platform-Root.git'
        GIT_BRANCH = 'main'

        // Replace with your current Nexus IP or hostname
        NEXUS_HOST = 'http://63.189.153.14/:8082'

        // Jenkins Credentials ID
        NEXUS_CREDENTIALS = 'nexus-docker-creds'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: "${GIT_BRANCH}",
                    url: "${GIT_REPO}"

                sh '''
                    echo "Repository checked out successfully"
                    git log -1 --oneline
                '''
            }
        }

        stage('Validate Environment') {
            steps {
                sh '''
                    set -eu

                    docker --version
                    test -f services/core-api/Dockerfile
                    test -f services/ai-worker/Dockerfile
                    test -f services/realtime-api/Dockerfile
                    test -f voice-frontend/Dockerfile

                    echo "All four Dockerfiles found."
                '''
            }
        }

        stage('Check Nexus Registry') {
            steps {
                sh '''
                    set -eu

                    STATUS=$(curl -sS \
                        --max-time 10 \
                        -o /dev/null \
                        -w '%{http_code}' \
                        "http://${NEXUS_HOST}/v2/")

                    if [ "$STATUS" != "200" ] && [ "$STATUS" != "401" ]; then
                        echo "Nexus registry returned HTTP $STATUS"
                        exit 1
                    fi

                    echo "Nexus Docker Registry endpoint is reachable."
                '''
            }
        }

        stage('Login to Nexus') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: "${NEXUS_CREDENTIALS}",
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASS'
                    )
                ]) {
                    sh '''
                        set +x
                        set -eu

                        printf '%s' "$NEXUS_PASS" |
                            docker login "$NEXUS_HOST" \
                                --username "$NEXUS_USER" \
                                --password-stdin
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -eu

                    TAG="${BUILD_NUMBER}"

                    docker build \
                        -f services/core-api/Dockerfile \
                        -t "${NEXUS_HOST}/core-api:${TAG}" \
                        -t "${NEXUS_HOST}/core-api:latest" \
                        services/core-api

                    docker build \
                        -f services/ai-worker/Dockerfile \
                        -t "${NEXUS_HOST}/ai-worker:${TAG}" \
                        -t "${NEXUS_HOST}/ai-worker:latest" \
                        services/ai-worker

                    docker build \
                        -f services/realtime-api/Dockerfile \
                        -t "${NEXUS_HOST}/realtime-api:${TAG}" \
                        -t "${NEXUS_HOST}/realtime-api:latest" \
                        services/realtime-api

                    docker build \
                        -f voice-frontend/Dockerfile \
                        -t "${NEXUS_HOST}/voice-frontend:${TAG}" \
                        -t "${NEXUS_HOST}/voice-frontend:latest" \
                        voice-frontend
                '''
            }
        }

        stage('Push Images to Nexus') {
            steps {
                sh '''
                    set -eu

                    TAG="${BUILD_NUMBER}"

                    docker push "${NEXUS_HOST}/core-api:${TAG}"
                    docker push "${NEXUS_HOST}/core-api:latest"

                    docker push "${NEXUS_HOST}/ai-worker:${TAG}"
                    docker push "${NEXUS_HOST}/ai-worker:latest"

                    docker push "${NEXUS_HOST}/realtime-api:${TAG}"
                    docker push "${NEXUS_HOST}/realtime-api:latest"

                    docker push "${NEXUS_HOST}/voice-frontend:${TAG}"
                    docker push "${NEXUS_HOST}/voice-frontend:latest"
                '''
            }
        }

        stage('Verify Published Images') {
            steps {
                sh '''
                    set -eu

                    docker images "${NEXUS_HOST}/*" \
                        --format '{{.Repository}}:{{.Tag}}' || true

                    echo "Build ${BUILD_NUMBER} completed."
                    echo "Images have been pushed to Nexus."
                '''
            }
        }
    }

    post {
        always {
            sh '''
                docker logout "$NEXUS_HOST" || true
            '''
        }

        success {
            echo 'CI pipeline completed successfully.'
        }

        failure {
            echo 'CI pipeline failed. Check the stage logs.'
        }
    }
}
