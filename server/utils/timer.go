package utils

import (
	"server/initializers"
	"server/models"
	"sync"
	"time"
)

var timerMutex sync.Mutex

func StartPomodoroTimer(userID uint) {
	timerMutex.Lock()
	defer timerMutex.Unlock()

	var settings models.PomodoroModel
	if err := initializers.DB.First(&settings, "user_id = ?", userID).Error; err != nil {
		return
	}

	var duration int
	// Set the duration based on the current phase
	switch settings.CurrentPhase {
	case "pomodoro":
		duration = settings.PomodoroDuration * 60
	case "shortBreak":
		duration = settings.ShortBreakDuration * 60
	case "longBreak":
		duration = settings.LongBreakDuration * 60
	default:
		return
	}

	// Situation 1: Reset RemainingTime to full duration when switching phases
	if settings.RemainingTime == 0 || settings.IsRunning == false {
		settings.RemainingTime = duration
	}

	// Set the timer to "running"
	settings.IsRunning = true
	if err := initializers.DB.Save(&settings).Error; err != nil {
		return
	}

	go func() {
		timer := time.NewTicker(1 * time.Second)
		defer timer.Stop()

		for {
			<-timer.C
			timerMutex.Lock()
			initializers.DB.First(&settings, "user_id = ?", userID)

			if !settings.IsRunning || settings.RemainingTime <= 0 {
				settings.IsRunning = false
				initializers.DB.Save(&settings)
				timerMutex.Unlock()
				return
			}

			settings.RemainingTime -= 1
			initializers.DB.Save(&settings)
			timerMutex.Unlock()
		}
	}()
}
