package controllers

import (
	"errors"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"server/initializers"
	"server/models"
	"time"
)

func UpdatePomodoroSettings(c *gin.Context) {
	var body struct {
		Pomodoro   int `json:"pomodoro"`
		ShortBreak int `json:"shortBreak"`
		LongBreak  int `json:"longBreak"`
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
		initializers.DB.Save(&settings)
	}

	c.JSON(http.StatusOK, gin.H{"success": "Settings updated successfully"})
}

func GetPomodoroSettings(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	var settings models.PomodoroModel
	if err := initializers.DB.First(&settings, "user_id = ?", currentUser.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pomodoro setting not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"pomodoro":   settings.PomodoroDuration,
		"shortBreak": settings.ShortBreakDuration,
		"longBreak":  settings.LongBreakDuration,
	})
}

func StartPomodoro(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	var settings models.PomodoroModel
	if err := initializers.DB.First(&settings, "user_id = ?", currentUser.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pomodoro setting not found"})
		return
	}

	if settings.IsRunning {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pomodoro already running"})
		return
	}

	startTime := time.Now()
	settings.StartTime = &startTime
	settings.IsRunning = true
	settings.CurrentPhase = "pomodoro"
	settings.RemainingTime = settings.PomodoroDuration * 60

	initializers.DB.Save(&settings)

	c.JSON(http.StatusOK, gin.H{"success": "Pomodoro started"})
}

func PausePomodoro(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	var settings models.PomodoroModel
	if err := initializers.DB.First(&settings, "user_id = ?", currentUser.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pomodoro setting not found"})
		return
	}

	if !settings.IsRunning {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pomodoro is not running"})
		return
	}

	elapsed := int(time.Since(*settings.StartTime).Seconds())
	settings.RemainingTime -= elapsed
	settings.IsRunning = false

	initializers.DB.Save(&settings)

	c.JSON(http.StatusOK, gin.H{"success": "Pomodoro paused"})
}
