# syntax=docker/dockerfile:1.6

# ---------- Stage 1: build the .omod with Maven (JDK 8) ----------
FROM maven:3.8.8-eclipse-temurin-8 AS builder

WORKDIR /build

# Pre-fetch dependencies so they cache when only sources change.
COPY pom.xml ./
COPY api/pom.xml api/pom.xml
COPY atom-feed/pom.xml atom-feed/pom.xml
COPY omod/pom.xml omod/pom.xml
COPY owa/pom.xml owa/pom.xml
RUN mvn -B -ntp -DskipTests dependency:go-offline || true

# Now copy the rest and build.
COPY . .
RUN mvn -B -ntp -DskipTests clean package

# ---------- Stage 2: OpenMRS server with this module installed ----------
FROM openmrs/openmrs-core:2.7.0

# Drop the built .omod into the modules directory the entrypoint scans on boot.
COPY --from=builder /build/omod/target/bedmanagement-*.omod \
     /openmrs/distribution/openmrs_modules/bedmanagement.omod

EXPOSE 8080