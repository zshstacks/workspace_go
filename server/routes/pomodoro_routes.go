package routes

import (
	"github.com/gin-gonic/gin"
	"server/controllers"
	"server/middleware"
)

func PomodoroRoutes(router *gin.Engine) {
	router.GET("/pomodoro-settings", middleware.RequireAuth, controllers.GetPomodoroSettings)
	router.GET("/pomodoro-timer-status", middleware.RequireAuth, controllers.FetchPomodoroStatus)
	router.POST("/pomodoro-update-settings", middleware.RequireAuth, controllers.UpdatePomodoroSettings)
	router.POST("/pomodoro-start", middleware.RequireAuth, controllers.StartPomodoro)
	router.POST("/pomodoro-stop", middleware.RequireAuth, controllers.StopPomodoro)
	router.POST("/pomodoro-phase", middleware.RequireAuth, controllers.ChangePhase)
	router.POST("/pomodoro-auto-mode", middleware.RequireAuth, controllers.UpdateAutoTransition)
	router.POST("/pomodoro-reset", middleware.RequireAuth, controllers.ResetCompletedPomodoros)
}
