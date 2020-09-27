FROM maven:latest 

# # Install maven
# RUN apt-get update
# RUN apt-get install -y maven

WORKDIR /usr/src/app

# Prepare by downloading dependencies
ADD java/db-app/pom.xml /usr/src/app/pom.xml
RUN ["mvn", "dependency:resolve"]
RUN ["mvn", "verify"]

# Adding source, compile and package into a fat jar
ADD java/db-app/src /usr/src/app/src
RUN ["mvn", "clean", "compile"]

ADD /resources /usr/resources

EXPOSE 8080
CMD ["mvn", "exec:java"]