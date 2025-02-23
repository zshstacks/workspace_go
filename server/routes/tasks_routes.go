package routes

import (
	"github.com/gin-gonic/gin"
	"server/controllers"
	"server/middleware"
)

func TasksRoutes(router *gin.Engine) {
	router.GET("/tasks", middleware.RequireAuth, controllers.GetAllTasks)
	router.POST("/tasks-create", middleware.RequireAuth, controllers.CreateTask)
	router.PUT("/task/update-description/:id", middleware.RequireAuth, controllers.UpdateTaskDescription)
}
