# Medium APIs

An application to fetch medium feeds, stats using user and post URL. Contains 3 APIs

# Docker deployment
1. Build a docker image : ``docker build -t medium-apis:latest .``
2. Docker Hub Login : ``docker login -u animeshkuzur``
3. Docker push : ``docker push medium-apis``
4. Docker Run : ``docker run -it -p 3000:3000 animeshkuzur/medium-apis npm start``
