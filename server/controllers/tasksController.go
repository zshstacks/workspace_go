package controllers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"server/initializers"
	"server/models"
	"strconv"
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

func CreateTask(c *gin.Context) {
	//get authenticated user from ctx
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	var input struct {
		Title       string `json:"title" binding:"required"`
		Description string `json:"description"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	//get current user last localID value(if no tasks, localid = 0)
	var lastTask models.TasksModel
	initializers.DB.Where("user_id = ?", currentUser.ID).Order("local_id desc").First(&lastTask)
	newLocalID := lastTask.LocalID + 1

	task := models.TasksModel{
		UserID:      currentUser.ID,
		LocalID:     newLocalID,
		Title:       input.Title,
		Description: input.Description,
		Completed:   false,
	}

	if err := initializers.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cant create a task!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": task})

}

func UpdateTaskDescription(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	//get local task id from url param and convert to num
	localTaskIDStr := c.Param("id")
	localTaskID, err := strconv.Atoi(localTaskIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Wrong task id!"})
		return
	}

	var task models.TasksModel
	//find task with local id and user id
	if err := initializers.DB.Where("local_id = ? AND user_id = ?", localTaskID, currentUser.ID).First(&task).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cant find a task!"})
		return
	}

	var input struct {
		Description string `json:"description" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	task.Description = input.Description

	if err := initializers.DB.Save(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cant update task description!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": task})

}
