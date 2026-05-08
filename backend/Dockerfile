FROM maven:3.9-eclipse-temurin-17
WORKDIR /app

# Copy the entrypoint watcher script
COPY dev-entrypoint.sh /usr/local/bin/dev-entrypoint.sh
RUN chmod +x /usr/local/bin/dev-entrypoint.sh

# Pre-download dependencies using the host pom.xml
# (pom.xml is also mounted at runtime, this is just for layer caching)
COPY pom.xml ./
RUN mvn dependency:go-offline -B

EXPOSE 8081
ENTRYPOINT ["/usr/local/bin/dev-entrypoint.sh"]
