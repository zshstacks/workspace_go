package main

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"log"
	"server/controllers"
	"server/initializers"
	"server/middleware"
	"time"
)

func init() {
	initializers.LoadEnvVariables()
	initializers.ConnectToDb()
	initializers.SyncDatabase()
}

func main() {

	r := gin.Default()

	r.ForwardedByClientIP = true
	err := r.SetTrustedProxies([]string{"127.0.0.1"})
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

	r.POST("/signup", controllers.SignUp)
	r.POST("/login", controllers.SignIn)
	r.POST("/confirm-email", controllers.ConfirmEmail)
	r.POST("/resend-confirmation-code", controllers.ResendConfirmationCode)

	r.GET("/validate", middleware.RequireAuth, controllers.Validate)
	r.GET("/logout", middleware.RequireAuth, controllers.Logout)

	r.DELETE("/delete-user", middleware.RequireAuth, controllers.DeleteUser)

	//pomodoro routes

	r.GET("/pomodoro-settings", middleware.RequireAuth, controllers.GetPomodoroSettings)
	r.GET("/pomodoro-timer-status", middleware.RequireAuth, controllers.FetchPomodoroStatus)

	r.POST("/pomodoro-update-settings", middleware.RequireAuth, controllers.UpdatePomodoroSettings)
	r.POST("/pomodoro-start", middleware.RequireAuth, controllers.StartPomodoro)
	r.POST("/pomodoro-stop", middleware.RequireAuth, controllers.StopPomodoro)

	log.Fatal(r.Run())

}
