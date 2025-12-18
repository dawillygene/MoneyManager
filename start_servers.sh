#!/bin/bash

# Script to start and stop MoneyManager servers
# Usage: ./start_servers.sh start | stop

BACKEND_DIR="./moneymanager"
FRONTEND_DIR="./MoneyManager"

start_servers() {
    echo "Starting backend server..."
    cd "$BACKEND_DIR"
    ./mvnw spring-boot:run &
    backend_pid=$!
    echo "Backend started with PID: $backend_pid"
    cd ..

    echo "Starting frontend server..."
    cd "$FRONTEND_DIR"
    pnpm dev &
    frontend_pid=$!
    echo "Frontend started with PID: $frontend_pid"
    cd ..

    echo "All servers started. Use './start_servers.sh stop' to stop them."
}

stop_servers() {
    echo "Stopping backend server..."
    pkill -f "mvnw"
    echo "Stopping frontend server..."
    pkill -f "vite"
    echo "All servers stopped."
}

case "$1" in
    start)
        start_servers
        ;;
    stop)
        stop_servers
        ;;
    *)
        echo "Usage: $0 {start|stop}"
        exit 1
        ;;
esac