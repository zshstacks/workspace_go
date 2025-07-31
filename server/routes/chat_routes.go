package routes

import (
	"github.com/gin-gonic/gin"
	"server/controllers"
	"server/middleware"
)

func ChatRoutes(router *gin.Engine) {
	router.GET("/chat", middleware.RequireAuth, controllers.ChatSocket)
}
