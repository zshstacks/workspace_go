package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"server/initializers"
	"server/routes"
	"time"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDb()
	initializers.SyncDatabase()
	initializers.ConnectToRedis()
	initializers.InitOAuthConfigs()
}

func main() {

	r := gin.Default()

	r.ForwardedByClientIP = true
	err := r.SetTrustedProxies(nil)
	if err != nil {
		return
	}

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8000", "http://localhost:3000", "http://83.99.161.62:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           24 * time.Hour,
	}))

	//routes
	routes.UserRoutes(r)
	routes.PomodoroRoutes(r)
	routes.TasksRoutes(r)
	routes.StatsRoutes(r)
	routes.OAuthRoutes(r)

	log.Fatal(r.Run())

}
