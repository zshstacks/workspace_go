package utils

import (
	"server/cache"
	"server/initializers"
	"sync"
	"time"
)

var timerMutex sync.Mutex

func StartPomodoroTimer(userID uint) {
	timerMutex.Lock()
	defer timerMutex.Unlock()

	settings, err := cache.GetPomodoroSettingsByUserID(userID)
	if err != nil {
		return
	}

	go func() {
		timer := time.NewTicker(1 * time.Second)
		defer timer.Stop()

		for {
			<-timer.C
			timerMutex.Lock()

			updatedSettings, err := cache.GetPomodoroSettingsByUserID(userID)
			if err != nil {
				timerMutex.Unlock()
				return
			}
			settings = updatedSettings

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

				cache.InvalidatePomodoroCache(userID)
				if err := initializers.DB.Save(&settings).Error; err != nil {
					timerMutex.Unlock()
					return
				}

				cache.CachePomodoroSettings(settings)

				if !settings.AutoTransition {
					timerMutex.Unlock()
					return
				}

				timerMutex.Unlock()
				continue
			}

			settings.RemainingTime--

			cache.InvalidatePomodoroCache(userID)
			initializers.DB.Save(&settings)

			cache.CachePomodoroSettings(settings)

			timerMutex.Unlock()
		}
	}()
}
