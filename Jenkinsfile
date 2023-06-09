pipeline {
    agent any

    stages {
        stage('Clonar projeto') {
            steps {
                git 'https://github.com/pamelaialmeida/ebac-modulo14.git'
            }
        }
        stage('Instalar dependencias') {
            steps {
                bat 'npm install'
            }
        }
//        stage('Executar ServeRest') {
//            steps {
//                bat 'npm run start'
//            }
//        }
        stage('Executar testes') {
            steps {
                bat 'npm run cy:run'
            }
        }
    }
}
