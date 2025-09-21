# server/Dockerfile
# Development stage
FROM golang:1.24-alpine AS development
WORKDIR /app

# Install git and CompileDaemon for hot reload
RUN apk add --no-cache git
RUN go install github.com/githubnemo/CompileDaemon@latest

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

EXPOSE 8000
CMD ["CompileDaemon", "--build=go build -o main .", "--command=./main"]

# Production build stage
FROM golang:1.24-alpine AS builder
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o main .

# Production stage
FROM alpine:latest AS production
WORKDIR /root/

# Install ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

# Copy the binary from builder stage
COPY --from=builder /app/main .

EXPOSE 8000
CMD ["./main"]