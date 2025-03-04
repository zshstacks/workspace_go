package controllers

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"server/initializers"
	"server/models"
	"server/utils"
	"strconv"
	"time"
)

func GetAllTasks(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	//get filter params from req
	hideCompleted := c.Query("hideCompleted") == "true"
	showTodayOnly := c.Query("showTodayOnly") == "true"

	query := initializers.DB.Where("user_id = ?", currentUser.ID)

	if hideCompleted {
		query = query.Where("completed = ?", false)
	}

	if showTodayOnly {
		now := time.Now()
		startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		endOfDay := startOfDay.Add(24 * time.Hour)
		query = query.Where("created_at >= ? AND created_at < ?", startOfDay, endOfDay)
	}

	var tasks []models.TasksModel
	if err := query.Order("\"order\" asc").Find(&tasks).Error; err != nil {
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

	if !utils.IsValidTitle(input.Title) {
		c.JSON(http.StatusBadRequest, gin.H{"createTitleError": "Title must be between 2 and 95 characters!"})
		return
	}

	if !utils.IsValidDescription(input.Description) {
		c.JSON(http.StatusBadRequest, gin.H{"createDescriptionError": "Description must be  between 2 and 870 characters!"})
		return
	}

	//get current user last localID value(if no tasks, localid = 0)
	var lastTask models.TasksModel
	initializers.DB.Where("user_id = ?", currentUser.ID).Order("local_id desc").First(&lastTask)
	newLocalID := lastTask.LocalID + 1

	//get the highest order value
	var maxOrder int
	result := initializers.DB.Model(&models.TasksModel{}).
		Where("user_id = ?", currentUser.ID).
		Select("COALESCE(MAX(`order`), 0)").
		Scan(&maxOrder)

	// Ja rodas kļūda, uzstādām maxOrder uz 0
	if result.Error != nil {
		maxOrder = 0
	}

	newOrder := maxOrder + 1

	task := models.TasksModel{
		UserID:      currentUser.ID,
		LocalID:     newLocalID,
		Title:       input.Title,
		Description: input.Description,
		Completed:   false,
		Order:       newOrder,
	}

	if err := initializers.DB.Create(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cant create a task!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": task})
}

func UpdateTaskTitle(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	localTaskIDStr := c.Param("id")
	localTaskID, err := strconv.Atoi(localTaskIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Wrong task id!"})
		return
	}

	var task models.TasksModel

	if err := initializers.DB.Where("local_id = ? AND user_id = ?", localTaskID, currentUser.ID).First(&task).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cant find a task!"})
		return
	}

	var input struct {
		Title string `json:"title" binding:"required"`
	}

	if !utils.IsValidTitle(input.Title) {
		c.JSON(http.StatusBadRequest, gin.H{"updateTitleError": "Title must be between 2 and 95 characters!"})
		return
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	task.Title = input.Title

	if err := initializers.DB.Save(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cant update task title!"})
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

	if !utils.IsValidDescription(input.Description) {
		c.JSON(http.StatusBadRequest, gin.H{"updateDescriptionError": "Description must be  between 2 and 870 characters!"})
		return
	}

	task.Description = input.Description

	if err := initializers.DB.Save(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cant update task description!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": task})

}

func CompleteTask(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	localTaskIDStr := c.Param("id")
	localTaskID, err := strconv.Atoi(localTaskIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Wrong task id!"})
		return
	}

	var task models.TasksModel

	if err := initializers.DB.Where("local_id = ? AND user_id = ?", localTaskID, currentUser.ID).First(&task).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cant find a task!"})
		return
	}

	var input struct {
		Completed bool `json:"completed" `
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	task.Completed = input.Completed

	if err := initializers.DB.Save(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cant complete task!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": task})
}

func DeleteTask(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	localTaskIDStr := c.Param("id")
	localTaskID, err := strconv.Atoi(localTaskIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Wrong task id!"})
		return
	}

	var task models.TasksModel

	if err := initializers.DB.Where("local_id = ? AND user_id = ?", localTaskID, currentUser.ID).First(&task).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cant find a task!"})
		return
	}

	//delete finded task ( .Unscoped() to completely delete task from db)
	if err := initializers.DB.Delete(&task).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cant delete task!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Task successfully deleted!"})
}

func DeleteAllTasks(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	if err := initializers.DB.Where("user_id = ?", currentUser.ID).Delete(&models.TasksModel{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cant delete all tasks!"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All tasks successfully deleted!"})
}

func DeleteAllCompletedTasks(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	result := initializers.DB.Where("user_id = ? AND completed = ?", currentUser.ID, true).Delete(&models.TasksModel{})

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cant delete all completed tasks!"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "No completed tasks to delete"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "All completed tasks successfully deleted!", "count": result.RowsAffected})
}

func UpdateTasksOrder(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	var input []struct {
		LocalID int `json:"localId" binding:"required"`
		Order   int `json:"order" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tx := initializers.DB.Begin()

	for _, item := range input {
		if err := tx.Model(&models.TasksModel{}).
			Where("local_id = ? AND user_id = ?", item.LocalID, currentUser.ID).
			Update("order", item.Order).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot update tasks order!"})
			return
		}
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "Tasks order updated successfully!"})
}
