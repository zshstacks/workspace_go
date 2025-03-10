package controllers

import (
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"net/http"
	"server/initializers"
	"server/models"
	"time"
)

func GetUserStats(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	currentUser, ok := user.(models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get user data",
		})
		return
	}

	var stats models.StatsModel
	result := initializers.DB.Where("user_id = ?", currentUser.ID).First(&stats)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			stats = models.StatsModel{
				UserID:         currentUser.ID,
				CurrentStreak:  1,
				HighestStreak:  1,
				LastVisitDate:  time.Now(),
				TotalVisitDays: 1,
				TotalHours:     0,
			}
			if err := initializers.DB.Create(&stats).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create stats"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
			return
		}
	}

	// if user is currently in a session, add the current session time
	if !stats.LastLoginTime.IsZero() {
		currentSessionHours := time.Now().Sub(stats.LastLoginTime).Hours()
		c.JSON(http.StatusOK, gin.H{
			"currentStreak": stats.CurrentStreak,
			"highestStreak": stats.HighestStreak,
			"totalVisits":   stats.TotalVisitDays,
			"totalHours":    stats.TotalHours + currentSessionHours,
		})
	} else {
		c.JSON(http.StatusOK, gin.H{
			"currentStreak": stats.CurrentStreak,
			"highestStreak": stats.HighestStreak,
			"totalVisits":   stats.TotalVisitDays,
			"totalHours":    stats.TotalHours,
		})
	}
}

func UpdateDailyStreak(c *gin.Context) {
	//get user data from middleware
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "Unauthorized",
		})
		return
	}

	currentUser, ok := user.(models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get user data",
		})
		return
	}

	//find user stats
	var stats models.StatsModel
	result := initializers.DB.Where("user_id = ?", currentUser.ID).First(&stats)

	//if stats not found, create new
	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			stats = models.StatsModel{
				UserID:         currentUser.ID,
				CurrentStreak:  1,
				HighestStreak:  1,
				LastVisitDate:  time.Now(),
				TotalVisitDays: 1,
			}
			if err := initializers.DB.Create(&stats).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Failed to create stats",
				})
				return
			}
			c.JSON(http.StatusOK, gin.H{
				"currentStreak": stats.CurrentStreak,
				"highestStreak": stats.HighestStreak,
				"totalVisits":   stats.TotalVisitDays,
				"lastVisitDate": stats.LastVisitDate,
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
		return
	}

	//get today date and last visit date
	today := time.Now().Truncate(24 * time.Hour)
	lastVisit := stats.LastVisitDate.Truncate(24 * time.Hour)

	//if last visit date is today date, nothing change
	if today.Equal(lastVisit) {
		c.JSON(http.StatusOK, gin.H{
			"currentStreak": stats.CurrentStreak,
			"highestStreak": stats.HighestStreak,
			"totalVisits":   stats.TotalVisitDays,
		})
		return
	}

	//calculate day diff
	dayDiff := int(today.Sub(lastVisit).Hours() / 24)

	//refresh streak value based on order of visit
	if dayDiff == 1 {
		//if visit is on day after, increment streak
		stats.CurrentStreak++

		//Refresh Highest streak too if current streak is bigger
		if stats.CurrentStreak > stats.HighestStreak {
			stats.HighestStreak = stats.CurrentStreak
		}
	} else {
		//if order of visit is not consistent, reset current streak to 1
		stats.CurrentStreak = 1
	}

	//refresh last visit date and total visit number
	stats.LastVisitDate = time.Now()
	stats.TotalVisitDays++

	//save changes to db
	if err := initializers.DB.Save(&stats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stats"})
		return
	}

	//return refreshed data
	c.JSON(http.StatusOK, gin.H{
		"currentStreak": stats.CurrentStreak,
		"highestStreak": stats.HighestStreak,
		"totalVisits":   stats.TotalVisitDays,
		"dayDiff":       dayDiff,
	})
}

// called when user logs in or starts using the app
func StartSession(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	currentUser, ok := user.(models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user data"})
		return
	}

	var stats models.StatsModel
	result := initializers.DB.Where("user_id = ?", currentUser.ID).First(&stats)

	if result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			stats = models.StatsModel{
				UserID:         currentUser.ID,
				CurrentStreak:  1,
				HighestStreak:  1,
				LastVisitDate:  time.Now(),
				TotalVisitDays: 1,
				TotalHours:     0,
				LastLoginTime:  time.Now(), // Set initial login time
			}
			if err := initializers.DB.Create(&stats).Error; err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create stats"})
				return
			}
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
			return
		}
	} else {
		// Update last login time for existing stats
		stats.LastLoginTime = time.Now()
		if err := initializers.DB.Save(&stats).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stats"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Session started"})
}

// called when user logs out or closes the app
func EndSession(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	currentUser, ok := user.(models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user data"})
		return
	}

	var stats models.StatsModel
	result := initializers.DB.Where("user_id = ?", currentUser.ID).First(&stats)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Stats not found"})
		return
	}

	//calculate time spent in this session
	if !stats.LastLoginTime.IsZero() {
		timeSpent := time.Now().Sub(stats.LastLoginTime).Hours()
		stats.TotalHours += timeSpent
	}

	//reset last login time
	stats.LastLoginTime = time.Time{}

	if err := initializers.DB.Save(&stats).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stats"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Session ended",
		"totalHours": stats.TotalHours,
	})
}

//test update daily streak
//func TestLastVisitDate(c *gin.Context) {
//	user, exists := c.Get("user")
//	if !exists {
//		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
//		return
//	}
//
//	currentUser, ok := user.(models.User)
//	if !ok {
//		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user data"})
//		return
//	}
//
//	var body struct {
//		DaysAgo int `json:"daysAgo"`
//	}
//
//	if c.Bind(&body) != nil {
//		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to read body!"})
//		return
//	}
//
//	var stats models.StatsModel
//	result := initializers.DB.Where("user_id = ?", currentUser.ID).First(&stats)
//
//	if result.Error != nil {
//		if result.Error == gorm.ErrRecordNotFound {
//
//			stats = models.StatsModel{
//				UserID:         currentUser.ID,
//				CurrentStreak:  1,
//				HighestStreak:  1,
//				LastVisitDate:  time.Now().Add(-time.Duration(body.DaysAgo) * 24 * time.Hour),
//				TotalVisitDays: 1,
//			}
//			if err := initializers.DB.Create(&stats).Error; err != nil {
//				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create stats"})
//				return
//			}
//		} else {
//			c.JSON(http.StatusInternalServerError, gin.H{"error": "DB error"})
//			return
//		}
//	} else {
//
//		stats.LastVisitDate = time.Now().Add(-time.Duration(body.DaysAgo) * 24 * time.Hour)
//
//		if err := initializers.DB.Save(&stats).Error; err != nil {
//			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stats"})
//			return
//		}
//	}
//	c.JSON(http.StatusOK, gin.H{
//		"success": true,
//		"message": "Last visit date set to " + stats.LastVisitDate.String(),
//		"stats": gin.H{
//			"currentStreak": stats.CurrentStreak,
//			"highestStreak": stats.HighestStreak,
//			"totalVisits":   stats.TotalVisitDays,
//			"lastVisitDate": stats.LastVisitDate,
//		},
//	})
//}
