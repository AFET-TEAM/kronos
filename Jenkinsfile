pipeline {
    agent any
    environment {
        BASE_APP_NAME = "kronos-fe"
        NETWORK_NAME = "app-network"
    }

    stages {
        stage('Branch Analizi') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
                        env.CONTAINER_NAME = "${BASE_APP_NAME}-prod"
                        env.HOST_PORT = "8010" 
                        echo ">>> PROD ORTAMI SEÇİLDİ"
                    } 
                    else if (env.BRANCH_NAME == 'integration') {
                        env.CONTAINER_NAME = "${BASE_APP_NAME}-integration"
                        env.HOST_PORT = "8011"
                        echo ">>> INTEGRATION ORTAMI SEÇİLDİ"
                    } 
                }
            }
        }

        stage('Build Image') {
            steps {
                script {
                    sh "docker build -t ${BASE_APP_NAME}:${env.BRANCH_NAME} ."
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    sh "docker stop ${env.CONTAINER_NAME} || true"
                    sh "docker rm ${env.CONTAINER_NAME} || true"
                    
                    sh """
                        docker run -d \
                        --name ${env.CONTAINER_NAME} \
                        --network ${NETWORK_NAME} \
                        --restart always \
                        -e PORT=3000 \
                        -e ORIGIN=http://localhost:${env.HOST_PORT} \
                        -p ${env.HOST_PORT}:3000 \
                        ${BASE_APP_NAME}:${env.BRANCH_NAME}
                    """
                    
                    echo "Kurulum tamam: ${env.CONTAINER_NAME} -> Port: ${env.HOST_PORT}"
                }
            }
        }
    }
}