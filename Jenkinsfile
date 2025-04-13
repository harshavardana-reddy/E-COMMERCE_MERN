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

        EMAIL_RECIPIENTS = "harshapattiputtoor@gmail.com,2200030963@gmail.com,pattiputtoor20050320@gmail.com"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Checking out source code from GitHub..."
                git branch: 'main', url: 'https://github.com/harshavardana-reddy/E-COMMERCE_MERN.git'
                echo "Code checkout completed successfully!"
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        echo "Installing frontend dependencies..."
                        dir('frontendapp') {
                            bat 'npm install'
                        }
                        echo "Frontend dependencies installed successfully!"
                    }
                }
                stage('Backend Dependencies') {
                    steps {
                        echo "Installing backend dependencies..."
                        dir('backendapp') {
                            bat 'npm install'
                        }
                        echo "Backend dependencies installed successfully!"
                    }
                }
            }
        }

        stage('Build Application') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        echo "Building frontend application..."
                        dir('frontendapp') {
                            bat 'npm run build'
                        }
                        echo "Frontend build completed successfully!"
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo "Building Docker images..."
                    docker.build("${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}", "./frontendapp")
                    docker.build("${BACKEND_IMAGE_NAME}:${IMAGE_TAG}", "./backendapp")
                    echo "Docker images built successfully!"
                }
            }
        }

        stage('Login to Docker Hub') {
            steps {
                echo "Logging in to Docker Hub..."
                withCredentials([usernamePassword(credentialsId: 'Jenkins-Docker', passwordVariable: 'DOCKER_HUB_PASSWORD', usernameVariable: 'DOCKER_HUB_USERNAME')]) {
                    bat """ echo ${DOCKER_HUB_PASSWORD} | docker login -u ${DOCKER_HUB_USERNAME} --password-stdin """
                }
                echo "Successfully logged in to Docker Hub!"
            }
        }

        stage('Push Docker Images') {
            steps {
                script {
                    echo "Pushing Docker images to registry..."
                    docker.withRegistry('https://registry.hub.docker.com', 'Jenkins-Docker') {
                        docker.image("${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}").push()
                        docker.image("${BACKEND_IMAGE_NAME}:${IMAGE_TAG}").push()
                        docker.image("${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}").push('latest')
                        docker.image("${BACKEND_IMAGE_NAME}:${IMAGE_TAG}").push('latest')
                    }
                    echo "Docker images pushed successfully!"
                }
            }
        }

        stage('Deploy') {
            steps {
                script {
                    echo "Starting deployment..."
                    bat 'docker-compose down || true'
                    bat 'docker-compose pull'
                    bat 'docker-compose up -d'
                    echo "Deployment completed successfully!"
                }
            }
        }
    }

    post {
        always {
            script {
                // Generate beautiful HTML email
                def statusColor = currentBuild.currentResult == 'SUCCESS' ? '#4CAF50' : '#F44336'
                def statusIcon = currentBuild.currentResult == 'SUCCESS' ? '✅' : '❌'
                
                def emailContent = """
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>E-Commerce Deployment Status</title>
                    <style>
                        body {
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 800px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: ${currentBuild.currentResult == 'SUCCESS' ? '#f0f9eb' : '#fef0f0'};
                        }
                        .container {
                            background-color: white;
                            border-radius: 8px;
                            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                            overflow: hidden;
                        }
                        .header {
                            background: ${currentBuild.currentResult == 'SUCCESS' ? 
                                        'linear-gradient(135deg, #4CAF50, #2E7D32)' : 
                                        'linear-gradient(135deg, #F44336, #C62828)'};
                            color: white;
                            padding: 25px;
                            text-align: center;
                        }
                        .content {
                            padding: 25px;
                        }
                        .status-card {
                            border-radius: 6px;
                            padding: 15px;
                            margin-bottom: 20px;
                            background-color: ${currentBuild.currentResult == 'SUCCESS' ? '#e8f5e9' : '#ffebee'};
                            border-left: 5px solid ${statusColor};
                            color: ${currentBuild.currentResult == 'SUCCESS' ? '#2e7d32' : '#c62828'};
                        }
                        .status-card h2 {
                            margin-top: 0;
                        }
                        .details {
                            margin-top: 20px;
                        }
                        .detail-row {
                            display: flex;
                            margin-bottom: 10px;
                            padding-bottom: 10px;
                            border-bottom: 1px solid #eee;
                        }
                        .detail-label {
                            font-weight: bold;
                            width: 150px;
                            color: #666;
                        }
                        .button {
                            display: inline-block;
                            padding: 10px 20px;
                            background: ${currentBuild.currentResult == 'SUCCESS' ? 
                                        'linear-gradient(135deg, #4CAF50, #2E7D32)' : 
                                        'linear-gradient(135deg, #F44336, #C62828)'};
                            color: white;
                            text-decoration: none;
                            border-radius: 4px;
                            margin-top: 15px;
                            transition: all 0.3s ease;
                            font-weight: bold;
                        }
                        .button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                        }
                        .footer {
                            background-color: ${currentBuild.currentResult == 'SUCCESS' ? '#e8f5e9' : '#ffebee'};
                            padding: 15px;
                            text-align: center;
                            font-size: 0.9em;
                            color: ${currentBuild.currentResult == 'SUCCESS' ? '#2e7d32' : '#c62828'};
                            border-top: 1px solid ${currentBuild.currentResult == 'SUCCESS' ? '#c8e6c9' : '#ffcdd2'};
                        }
                        a {
                            color: ${statusColor};
                            font-weight: bold;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>E-Commerce Deployment Notification</h1>
                            <p>${currentBuild.currentResult == 'SUCCESS' ? 'Your deployment was successful!' : 'Deployment failed - attention required!'}</p>
                        </div>
                        
                        <div class="content">
                            <div class="status-card">
                                <h2>${statusIcon} ${currentBuild.currentResult == 'SUCCESS' ? 'DEPLOYMENT SUCCESSFUL' : 'DEPLOYMENT FAILED'}</h2>
                                <p>Pipeline: ${env.JOB_NAME}</p>
                                <p>Build #${env.BUILD_NUMBER}</p>
                            </div>
                            
                            <div class="details">
                                <div class="detail-row">
                                    <div class="detail-label">Status:</div>
                                    <div style="color: ${statusColor}; font-weight: bold;">${currentBuild.currentResult}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Duration:</div>
                                    <div>${currentBuild.durationString.replace(' and counting', '')}</div>
                                </div>
                                <div class="detail-row">
                                    <div class="detail-label">Build URL:</div>
                                    <div><a href="${env.BUILD_URL}">${env.BUILD_URL}</a></div>
                                </div>
                            </div>
                            
                            <center>
                                <a href="${env.BUILD_URL}" class="button">View Build Details</a>
                            </center>
                        </div>
                        
                        <div class="footer">
                            ${currentBuild.currentResult == 'SUCCESS' ? 
                            'All systems operational' : 
                            'Please check the build logs for details'}
                            <br>
                            <small>Generated at ${new Date().format("yyyy-MM-dd HH:mm:ss z")}</small>
                        </div>
                    </div>
                </body>
                </html>
                """

                // Send email notification
                emailext (
                    subject: "[${currentBuild.currentResult}] ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                    body: emailContent,
                    to: "${EMAIL_RECIPIENTS}",
                    mimeType: 'text/html'
                )
            }
            
            bat 'docker logout'
            cleanWs()
        }
        
        success {
            echo "🎉 Pipeline executed successfully! All stages completed without errors."
            echo "Frontend Image: ${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}"
            echo "Backend Image: ${BACKEND_IMAGE_NAME}:${IMAGE_TAG}"
            echo "Application deployed successfully!"
        }
        
        failure {
            echo "❌ Pipeline failed! Please check the logs for errors."
            echo "Failed stage: ${env.STAGE_NAME}"
            echo "Build URL: ${env.BUILD_URL}"
        }
        
        unstable {
            echo "⚠️ Pipeline completed but with unstable status!"
        }
        
        aborted {
            echo "🛑 Pipeline was aborted by user!"
        }
    }
}