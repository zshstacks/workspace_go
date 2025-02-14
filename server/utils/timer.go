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

	// Reset RemainingTime to full duration when switching phases
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

			if !settings.IsRunning {
				timerMutex.Unlock()
				return
			}

			if settings.RemainingTime <= 0 {
				// Switch to the next phase
				switch settings.CurrentPhase {
				case "pomodoro":
					settings.TotalCompletedPomodoros++
					settings.CompletedPomodoros++
					if settings.CompletedPomodoros%4 == 0 {
						settings.CurrentPhase = "longBreak"
						settings.RemainingTime = settings.LongBreakDuration * 60
					} else {
						settings.CurrentPhase = "shortBreak"
						settings.RemainingTime = settings.ShortBreakDuration * 60
					}
				case "shortBreak":
					settings.CurrentPhase = "pomodoro"
					settings.RemainingTime = settings.PomodoroDuration * 60

				case "longBreak":
					settings.CurrentPhase = "pomodoro"
					settings.RemainingTime = settings.PomodoroDuration * 60

				}

				if settings.AutoTransition {
					settings.IsRunning = true // Continue to next phase
				} else {
					settings.IsRunning = false // Stop timer
				}

				if err := initializers.DB.Save(&settings).Error; err != nil {
					timerMutex.Unlock()
					return
				}

				if !settings.AutoTransition {
					timerMutex.Unlock()
					return
				}

				timerMutex.Unlock()
				continue
			}

			settings.RemainingTime--
			initializers.DB.Save(&settings)
			timerMutex.Unlock()
		}
	}()
}
