pipeline {
    agent any

    environment {
        // Docker Hub credentials
        NODE_VERSION = '18' // Use Node.js 18 for both build and runtime
        DOCKER_HUB_CREDENTIALS = credentials('JENKINS-DOCKERHUB')
        
        // Image names and tags
        BACKEND_IMAGE_NAME = 'harshareddy2024/ecom-backend'
        FRONTEND_IMAGE_NAME = 'harshareddy2024/ecom-frontend'
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        
        // Environment variables for backend
        
        DB_URI_ATLAS = credentials('DB_URI_ATLAS_ECOM')
        RAZORPAY_KEY_ID = credentials('RAZORPAY_KEY_ID')
        RAZORPAY_KEY_SECRET = credentials('RAZORPAY_KEY_SECRET')
        
        // Environment variable for frontend
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
                withCredentials([usernamePassword(credentialsId: 'JENKINS-DOCKERHUB', passwordVariable: 'DOCKER_HUB_PASSWORD', usernameVariable: 'DOCKER_HUB_USERNAME')]) {
                    bat "docker login -u ${DOCKER_HUB_USERNAME} -p ${DOCKER_HUB_PASSWORD}"
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'JENKINS-DOCKERHUB') {
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
        // Alternative: Send email
        emailext (
            subject: "SUCCESS: Pipeline '${env.JOB_NAME}' (${env.BUILD_NUMBER})",
            body: "Build URL: ${env.BUILD_URL}",
            to: '2200030963@kluniversity.in'
        )
    }
    failure {
        echo 'Pipeline failed!'
        // Alternative: Send email
        emailext (
            subject: "FAILED: Pipeline '${env.JOB_NAME}' (${env.BUILD_NUMBER})",
            body: "Build URL: ${env.BUILD_URL}",
            to: '2200030963@kluniversity.in'
        )
    }
}
}