stages {
        stage('Branch Analizi') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main' || env.BRANCH_NAME == 'master') {
                        env.CONTAINER_NAME = "${BASE_APP_NAME}-prod"
                        env.HOST_PORT = "8010"
                        env.APP_ORIGIN = "https://kronos.afet.space" 
                        echo ">>> PROD ORTAMI"
                    } 
                    else if (env.BRANCH_NAME == 'integration') {
                        env.CONTAINER_NAME = "${BASE_APP_NAME}-integration"
                        env.HOST_PORT = "8011"
                        env.APP_ORIGIN = "https://kronos-int.afet.space"
                    } 
                    else {
                        env.CONTAINER_NAME = "${BASE_APP_NAME}-test-${env.BRANCH_NAME}"
                        env.HOST_PORT = "8012"
                        env.APP_ORIGIN = "http://212.64.199.127:8012"
                    }
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
                        -e ORIGIN=${env.APP_ORIGIN} \
                        -e BODY_SIZE_LIMIT=Infinity \
                        -p ${env.HOST_PORT}:3000 \
                        ${BASE_APP_NAME}:${env.BRANCH_NAME}
                    """
                    
                    echo "Kurulum tamam. Origin: ${env.APP_ORIGIN}"
                }
            }
        }
    }