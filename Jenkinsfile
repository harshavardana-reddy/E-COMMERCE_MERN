pipeline {
    agent any

    environment {
        
        NODE_VERSION = '18' 
        DOCKER_HUB_CREDENTIALS = credentials('Jenkins-Docker')
        
        BACKEND_IMAGE_NAME = 'harshareddy2024/ecom-backend'
        FRONTEND_IMAGE_NAME = 'harshareddy2024/ecom-frontend'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        
        
        JWT_SECRET_KEY = credentials('JWT_SECRET_KEY_ECOM')
        DB_URI_ATLAS = credentials('DB_URI_ATLAS_ECOM')
        RAZORPAY_KEY_ID = credentials('RAZORPAY_KEY_ID')
        RAZORPAY_KEY_SECRET = credentials('RAZORPAY_KEY_SECRET')
        
        
        VITE_APP_RAZORPAY_KEY = credentials('VITE_APP_RAZORPAY_KEY')
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/harshavardana-reddy/E-COMMERCE_MERN.git'
            }
        }
        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontendapp') {
                            bat 'npm install'
                        }
                    }
                }
                stage('Backend Dependencies') {
                    steps {
                        dir('backendapp') {
                            bat 'npm install'
                        }
                    }
                }
            }
        }

        stage('Build Application') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        dir('frontendapp') {
                            bat 'npm run build'
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    // Build frontend image
                    docker.build("${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}", "./frontendapp")
                    
                    // Build backend image
                    docker.build("${BACKEND_IMAGE_NAME}:${IMAGE_TAG}", "./backendapp")
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'Jenkins-Docker', passwordVariable: 'DOCKER_HUB_PASSWORD', usernameVariable: 'DOCKER_HUB_USERNAME')]) {
                    bat """ echo ${DOCKER_HUB_PASSWORD} | docker login -u ${DOCKER_HUB_USERNAME} --password-stdin """
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'Jenkins-Docker') {
                        // Push frontend image
                        docker.image("${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}").push()
                        
                        // Push backend image
                        docker.image("${BACKEND_IMAGE_NAME}:${IMAGE_TAG}").push()
                        
                        // Also push as latest
                        docker.image("${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}").push('latest')
                        docker.image("${BACKEND_IMAGE_NAME}:${IMAGE_TAG}").push('latest')
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    // Stop and remove existing containers
                    bat 'docker-compose down || true'
                    
                    // Pull latest images and start containers
                    bat 'docker-compose pull'
                    bat 'docker-compose up -d'
                }
            }
        }
    }

    post {
    always {
        bat 'docker logout'
        cleanWs()
    }
    success {
        echo 'Pipeline completed successfully!'
    }
    failure {
        echo 'Pipeline failed!'
    }
}
}