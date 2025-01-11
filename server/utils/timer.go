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

	settings.IsRunning = true
	settings.RemainingTime = duration
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
				if settings.RemainingTime <= 0 {
					switch settings.CurrentPhase {
					case "pomodoro":
						settings.CurrentPhase = "shortBreak"
					case "shortBreak":
						settings.CurrentPhase = "longBreak"
					case "longBreak":
						settings.CurrentPhase = "pomodoro"
					}
				}
				initializers.DB.Save(&settings)
				timerMutex.Unlock()
				return
			}

			if settings.RemainingTime > 0 {
				settings.RemainingTime--
				initializers.DB.Save(&settings)
			}
			timerMutex.Unlock()
		}
	}()
}
