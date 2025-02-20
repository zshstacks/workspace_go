package controllers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"server/initializers"
	"server/models"
)

func GetAllTasks(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	var tasks []models.TasksModel
	if err := initializers.DB.Where("user_id = ?", currentUser.ID).Find(&tasks).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No tasks found!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": tasks})
}
