# ReadMe: An Instant Text-To-Video Creator
"ReadMe" is an AI-powered system designed to transform boring, static text inputs (such as brochures or PDFs) into engaging and interactive video content. In addition to video generation, it creates quizzes to test users' understanding of the content and provides detailed analytics on user engagement. By reading out text in an entertaining way, ReadMe makes information more digestible and enjoyable to interact with.

## Table of Contents
- [Preferred OS](#preferred-os)
- [Installation](#Installing-dependencies)
- [Usage](#how-to-use-this-software)
- [Screenshots](#Screenshots)
- [Contact](#contact)
- [Acknowledgements](#acknowledgements)

### Preferred OS
Linux or Windows with WSL

# Installing dependencies
wget http://archive.ubuntu.com/ubuntu/pool/main/o/openssl/libssl1.1_1.1.1f-1ubuntu2_amd64.deb   
sudo dpkg -i libssl1.1_1.1.1f-1ubuntu2_amd64.deb

install backend and frontend dependencies from the `requirements.txt` and `package.json`

### How to use this software
To start the frontend:
- Navigate to `/frontend`
- Install dependencies: `npm install`
- Run the development server: `npm run dev`

To start the backend
- Navigate to `/backend`
- Start redis via docker `docker run -d -p 6379:6379 redis`
- Start Celery worker for background tasks: `watchmedo auto-restart -d .. -p '*.py' --recursive -- celery -A readme.celery worker`
- Start the Django server: `python manage.py runserver`



### Contact
For any information required, do not hesitate to contact miranfirdausi027@gmail.com or saumay123sj@gmail.com

### Acknowledgements
- Thanks to [Celery](https://docs.celeryproject.org/) for handling asynchronous tasks.
