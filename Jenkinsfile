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
                env.APP_ORIGIN = "https://kronos.afet.space"
                env.VITE_API_URL = "https://kronos-prod.afet.space"
                env.SHOULD_DEPLOY = "true"
                echo ">>> PROD ORTAMI"
            } 
            else if (env.BRANCH_NAME == 'integration') {
                env.CONTAINER_NAME = "${BASE_APP_NAME}-integration"
                env.HOST_PORT = "8011"
                env.APP_ORIGIN = "https://kronos-int.afet.space"
                env.VITE_API_URL = "https://kronos-int.afet.space"
                env.SHOULD_DEPLOY = "true"
                echo ">>> INTEGRATION ORTAMI"
            } 
            else {
                env.SHOULD_DEPLOY = "false"
                echo ">>> Bu branch için deployment yapılmayacak: ${env.BRANCH_NAME}"
            }
        }
    }
}

      stage('Build Image') {
    when {
        expression { env.SHOULD_DEPLOY == 'true' }
    }
    steps {
        script {
            sh """
                docker build \
                --build-arg VITE_API_URL=${env.VITE_API_URL} \
                -t ${BASE_APP_NAME}:${env.BRANCH_NAME} .
            """
        }
    }
}

       stage('Deploy') {
    when {
        expression { env.SHOULD_DEPLOY == 'true' }
    }
    steps {
        script {
            // Eski container varsa durdur ve sil
            sh "docker stop ${env.CONTAINER_NAME} || true"
            sh "docker rm ${env.CONTAINER_NAME} || true"
            
            // Yeni container'ı başlat
            sh """
                docker run -d \
                --name ${env.CONTAINER_NAME} \
                --network ${NETWORK_NAME} \
                --restart always \
                -e PORT=3000 \
                -e ORIGIN=${env.APP_ORIGIN} \
                -e VITE_API_URL=${env.VITE_API_URL} \
                -e BODY_SIZE_LIMIT=Infinity \
                -p ${env.HOST_PORT}:3000 \
                ${BASE_APP_NAME}:${env.BRANCH_NAME}
            """
            
            echo "Kurulum tamam. Origin: ${env.APP_ORIGIN}, API: ${env.VITE_API_URL}"
        }
    }
}
    }
}