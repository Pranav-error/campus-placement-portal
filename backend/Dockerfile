# --- Build stage ---
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

COPY pom.xml .
# Cache dependencies separately from source for faster rebuilds.
RUN mvn -q -B dependency:go-offline || true

COPY src src
RUN mvn -q -B clean package -DskipTests

# --- Run stage ---
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
