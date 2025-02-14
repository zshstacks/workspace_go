package controllers

import (
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"server/initializers"
	"server/models"
	"server/utils"
)

func UpdatePomodoroSettings(c *gin.Context) {
	var body struct {
		Pomodoro       int  `json:"pomodoro"`
		ShortBreak     int  `json:"shortBreak"`
		LongBreak      int  `json:"longBreak"`
		AutoTransition bool `json:"autoTransition"`
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	user, _ := c.Get("user")
	currentUser := user.(models.User)

	var settings models.PomodoroModel
	if err := initializers.DB.First(&settings, "user_id = ?", currentUser.ID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			settings = models.PomodoroModel{
				UserID:             currentUser.ID,
				PomodoroDuration:   body.Pomodoro,
				ShortBreakDuration: body.ShortBreak,
				LongBreakDuration:  body.LongBreak,
				AutoTransition:     body.AutoTransition,
			}
			initializers.DB.Create(&settings)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch pomodoro settings"})
			return
		}
	} else {
		settings.PomodoroDuration = body.Pomodoro
		settings.ShortBreakDuration = body.ShortBreak
		settings.LongBreakDuration = body.LongBreak
		settings.AutoTransition = body.AutoTransition
		initializers.DB.Save(&settings)
	}

	c.JSON(http.StatusOK, gin.H{"success": "Settings updated successfully"})
}

func GetPomodoroSettings(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	var settings models.PomodoroModel
	if err := initializers.DB.First(&settings, "user_id = ?", currentUser.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Workspace setting not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"pomodoro":       settings.PomodoroDuration,
		"shortBreak":     settings.ShortBreakDuration,
		"longBreak":      settings.LongBreakDuration,
		"remainingTime":  settings.RemainingTime,
		"isRunning":      settings.IsRunning,
		"currentPhase":   settings.CurrentPhase,
		"autoTransition": settings.AutoTransition,
	})
}

func FetchPomodoroStatus(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	var settings models.PomodoroModel
	if err := initializers.DB.First(&settings, "user_id = ?", currentUser.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Workspace setting not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{

		"remainingTime":           settings.RemainingTime,
		"isRunning":               settings.IsRunning,
		"currentPhase":            settings.CurrentPhase,
		"completedPomodoros":      settings.CompletedPomodoros,
		"totalCompletedPomodoros": settings.TotalCompletedPomodoros,
		"autoTransition":          settings.AutoTransition,
	})
}

func StartPomodoro(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	var body struct {
		Phase string `json:"phase"`
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	var settings models.PomodoroModel
	if err := initializers.DB.First(&settings, "user_id = ?", currentUser.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Workspace setting not found"})
		return
	}

	if settings.IsRunning {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Timer already running"})
		return
	}

	if settings.CurrentPhase != body.Phase {
		settings.CurrentPhase = body.Phase
		switch settings.CurrentPhase {
		case "pomodoro":
			settings.RemainingTime = settings.PomodoroDuration * 60
		case "shortBreak":
			settings.RemainingTime = settings.ShortBreakDuration * 60
		case "longBreak":
			settings.RemainingTime = settings.LongBreakDuration * 60
		}
	}

	settings.IsRunning = true
	initializers.DB.Save(&settings)

	utils.StartPomodoroTimer(currentUser.ID)

	c.JSON(http.StatusOK, gin.H{
		"success":       "Timer started successfully",
		"currentPhase":  settings.CurrentPhase,
		"remainingTime": settings.RemainingTime,
	})
}

func StopPomodoro(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	var settings models.PomodoroModel
	if err := initializers.DB.First(&settings, "user_id = ?", currentUser.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Workspace setting not found"})
		return
	}

	if !settings.IsRunning {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Timer is not running"})
		return
	}

	settings.IsRunning = false
	initializers.DB.Save(&settings)

	c.JSON(http.StatusOK, gin.H{
		"success":       "Timer stopped successfully",
		"remainingTime": settings.RemainingTime,
		"currentPhase":  settings.CurrentPhase,
	})

}

func ChangePhase(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	var body struct {
		Phase string `json:"phase"`
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	var settings models.PomodoroModel
	if err := initializers.DB.First(&settings, "user_id = ?", currentUser.ID).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Workspace settings not found"})
		return
	}

	if settings.CurrentPhase != body.Phase {

		settings.CurrentPhase = body.Phase
		switch settings.CurrentPhase {
		case "pomodoro":
			settings.RemainingTime = settings.PomodoroDuration * 60
		case "shortBreak":
			settings.RemainingTime = settings.ShortBreakDuration * 60
		case "longBreak":
			settings.RemainingTime = settings.LongBreakDuration * 60
		}
	}

	initializers.DB.Save(&settings)

	c.JSON(http.StatusOK, gin.H{"success": "Phase changed", "currentPhase": settings.CurrentPhase})
}

func UpdateAutoTransition(c *gin.Context) {

	var body struct {
		AutoTransition bool `json:"autoTransition"`
	}

	if err := c.Bind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User is not authenticated"})
		return
	}
	currentUser := user.(models.User)

	var settings models.PomodoroModel
	if err := initializers.DB.First(&settings, "user_id = ?", currentUser.ID).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Workspace settings not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Cant fetch pomodoro settings"})
		}
		return
	}

	settings.AutoTransition = body.AutoTransition

	if err := initializers.DB.Save(&settings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cant update auto transition"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":        "Auto transition updated successfully",
		"autoTransition": settings.AutoTransition,
	})
}
