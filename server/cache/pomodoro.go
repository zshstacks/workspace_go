package cache

import (
	"encoding/json"
	"fmt"
	"server/initializers"
	"server/models"
	"time"
)

const (
	PomodoroCachePrefix = "pomodoro:"
	PomodoroCacheTTL    = 30 * time.Minute
)

// caching helper function for pomo settings
func CachePomodoroSettings(settings models.PomodoroModel) error {
	settingsJSON, err := json.Marshal(settings)
	if err != nil {
		return err
	}

	settingsKey := fmt.Sprintf("%s%d", PomodoroCachePrefix, settings.UserID)

	//save settings to redis
	if err := initializers.RedisClient.Set(initializers.Ctx, settingsKey, settingsJSON, PomodoroCacheTTL).Err(); err != nil {
		return err
	}

	return nil
}

// get pomodoro settings from cache or db
func GetPomodoroSettingsByUserID(userID uint) (models.PomodoroModel, error) {
	var settings models.PomodoroModel

	//try to get from cache
	settingsKey := fmt.Sprintf("%s%d", PomodoroCachePrefix, userID)
	settingsJSON, err := initializers.RedisClient.Get(initializers.Ctx, settingsKey).Result()

	if err == nil {
		if err := json.Unmarshal([]byte(settingsJSON), &settings); err != nil {
			return settings, err
		}
		return settings, nil
	}

	//not in cache, get from db
	if err := initializers.DB.First(&settings, "user_id = ?", userID).Error; err != nil {
		return settings, err
	}

	//add to cache
	go CachePomodoroSettings(settings)
	return settings, nil
}

// invalidate pomodoro settings cache when updated
func InvalidatePomodoroCache(userID uint) {
	settingsKey := fmt.Sprintf("%s%d", PomodoroCachePrefix, userID)
	initializers.RedisClient.Del(initializers.Ctx, settingsKey)
}
