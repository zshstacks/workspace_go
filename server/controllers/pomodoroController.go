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
		"pomodoro":      settings.PomodoroDuration,
		"shortBreak":    settings.ShortBreakDuration,
		"longBreak":     settings.LongBreakDuration,
		"remainingTime": settings.RemainingTime,
		"isRunning":     settings.IsRunning,
		"currentPhase":  settings.CurrentPhase,
	})
}

func FetchPomodoroStatus(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	var settings models.PomodoroModel
	if err := initializers.DB.First(&settings, "user_id = ?", currentUser.ID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Pomodoro setting not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{

		"remainingTime": settings.RemainingTime,
		"isRunning":     settings.IsRunning,
		"currentPhase":  settings.CurrentPhase,
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
		c.JSON(http.StatusNotFound, gin.H{"error": "Pomodoro setting not found"})
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
		c.JSON(http.StatusNotFound, gin.H{"error": "Pomodoro setting not found"})
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
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Pomodoro settings not found"})
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
