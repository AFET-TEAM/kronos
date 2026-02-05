pipeline {
    agent any

    environment {
        BASE_APP_NAME = "kronos-fe"
        NETWORK_NAME = "traefik_public"
        SCANNER_HOME = tool 'sonar-scanner'
    }

    stages {
        stage('1. Ortam ve Domain Belirleme') {
            steps {
                script {
                    if (env.BRANCH_NAME == 'main') {
                        env.CONTAINER_NAME = "${BASE_APP_NAME}-prod"
                        env.APP_DOMAIN = "kronos.afet.team"
                        env.VITE_API_URL = "https://api-kronos.afet.team"
                        env.SHOULD_DEPLOY = "true"
                        echo ">>> CANLI ORTAM (PROD) - Domain: ${env.APP_DOMAIN}"
                    } 
                    else if (env.BRANCH_NAME == 'integration') {
                        env.CONTAINER_NAME = "${BASE_APP_NAME}-dev"
                        env.APP_DOMAIN = "kronos-dev.afet.space"
                        env.VITE_API_URL = "https://api-kronos-dev.afet.team" 
                        env.SHOULD_DEPLOY = "true"
                        echo ">>> GELİŞTİRME/INT ORTAMI - Domain: ${env.APP_DOMAIN}"
                    }
                    else {
                        env.SHOULD_DEPLOY = "false"
                        echo ">>> Bu branch için deployment yapılmayacak: ${env.BRANCH_NAME}"
                    }
                }
            }
        }

        stage('2. SonarQube Analizi') {
            when { expression { env.SHOULD_DEPLOY == 'true' } }
            steps {
                withSonarQubeEnv('sonarqube-server') {
                    sh "${SCANNER_HOME}/bin/sonar-scanner"
                }
            }
        }

        stage('3. Kalite Kapısı (Quality Gate)') {
            when { expression { env.SHOULD_DEPLOY == 'true' } }
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('4. Docker Build') {
            when { expression { env.SHOULD_DEPLOY == 'true' } }
            steps {
                script {
                    // Vite projelerinde env'leri build anında içeri gömmek gerekir
                    sh """
                        docker build --no-cache \
                        --build-arg VITE_API_URL=${env.VITE_API_URL} \
                        -t ${BASE_APP_NAME}:${env.BRANCH_NAME} .
                    """
                }
            }
        }

        stage('5. Deploy (Traefik Labels)') {
            when { expression { env.SHOULD_DEPLOY == 'true' } }
            steps {
                script {
                    def traefikRule = "Host(\"${env.APP_DOMAIN}\")"
                    
                    sh "docker stop ${env.CONTAINER_NAME} || true"
                    sh "docker rm ${env.CONTAINER_NAME} || true"
               
                    sh """
                        docker run -d \\
                        --name ${env.CONTAINER_NAME} \\
                        --network ${NETWORK_NAME} \\
                        --restart always \\
                        -e ORIGIN=https://${env.APP_DOMAIN} \\
                        -e VITE_API_URL=${env.VITE_API_URL} \\
                        \\
                        --label "traefik.enable=true" \\
                        --label "traefik.docker.network=${NETWORK_NAME}" \\
                        --label 'traefik.http.routers.${env.CONTAINER_NAME}.rule=${traefikRule}' \\
                        --label "traefik.http.routers.${env.CONTAINER_NAME}.entrypoints=websecure" \\
                        --label "traefik.http.routers.${env.CONTAINER_NAME}.tls.certresolver=myresolver" \\
                        --label "traefik.http.services.${env.CONTAINER_NAME}.loadbalancer.server.port=3000" \\
                        \\
                        ${BASE_APP_NAME}:${env.BRANCH_NAME}
                    """
                    
                    echo ">>> Başarıyla Kuruldu! Erişim: https://${env.APP_DOMAIN}"
                }
            }
        }
    }
}