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
                        env.HOST_PORT = "8010" // Prod Portu
                        echo ">>> CANLI ORTAM (PROD) Hazırlanıyor..."
                    } 
                    else if (env.BRANCH_NAME == 'integration') {
                        env.CONTAINER_NAME = "${BASE_APP_NAME}-integration"
                        env.HOST_PORT = "8011" // Integration Portu
                        echo ">>> ENTEGRASYON ORTAMI (INTEGRATION) Hazırlanıyor..."
                    } 
                    else {
                        env.CONTAINER_NAME = "${BASE_APP_NAME}-test-${env.BRANCH_NAME}"
                        env.HOST_PORT = "8012" 
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
                        -p ${env.HOST_PORT}:80 \
                        ${BASE_APP_NAME}:${env.BRANCH_NAME}
                    """
                    
                    echo "Başarıyla kuruldu: ${env.CONTAINER_NAME} port: ${env.HOST_PORT}"
                }
            }
        }
    }
}