package routes

import (
	"github.com/gin-gonic/gin"
	"server/controllers"
)

func ChatRoutes(router *gin.Engine) {
	router.GET("/ws", controllers.ChatSocket)
}
