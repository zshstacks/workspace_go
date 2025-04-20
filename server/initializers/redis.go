package initializers

import (
	"context"
	"github.com/redis/go-redis/v9"
	"log"
	"os"
)

var (
	RedisClient *redis.Client
	Ctx         = context.Background()
)

func ConnectToRedis() {
	RedisClient = redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_ADDR"),
		Password: os.Getenv("REDIS_PASS"),
		DB:       0,
	})

	_, err := RedisClient.Ping(Ctx).Result()
	if err != nil {
		log.Fatalf("Cant connect to redis: %v", err)
	}
	log.Println("Connection with redis established")
}
