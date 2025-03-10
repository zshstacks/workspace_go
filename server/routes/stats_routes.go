package routes

import (
	"github.com/gin-gonic/gin"
	"server/controllers"
	"server/middleware"
)

func StatsRoutes(router *gin.Engine) {
	router.GET("/stats", middleware.RequireAuth, controllers.GetUserStats)
	router.POST("/stats/update-streak", middleware.RequireAuth, controllers.UpdateDailyStreak)
	router.POST("/start-session", middleware.RequireAuth, controllers.StartSession)
	router.POST("/end-session", middleware.RequireAuth, controllers.EndSession)

	//router.POST("/test/set-last-visit", middleware.RequireAuth, controllers.TestLastVisitDate)
}
