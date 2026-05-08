#!/bin/bash
set -e

echo ">>> Starting file watcher for Spring Boot DevTools..."
touch /tmp/.last_compile

# Background watcher: poll for .java source changes and trigger mvn compile
(
  while true; do
    sleep 2
    CHANGED=$(find /app/src -name "*.java" -newer /tmp/.last_compile 2>/dev/null | head -1)
    if [ -n "$CHANGED" ]; then
      echo ">>> Source change detected, compiling..."
      mvn compile -q -f /app/pom.xml 2>&1
      touch /tmp/.last_compile
      echo ">>> Compilation done — DevTools will restart the app"
    fi
  done
) &

echo ">>> Starting Spring Boot with DevTools..."
exec mvn spring-boot:run -Dspring-boot.run.fork=false -f /app/pom.xml
