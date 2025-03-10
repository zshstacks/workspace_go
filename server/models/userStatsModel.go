package models

import (
	"gorm.io/gorm"
	"time"
)

type StatsModel struct {
	gorm.Model
	UserID         uint `gorm:"uniqueIndex"`
	CurrentStreak  int
	HighestStreak  int
	LastVisitDate  time.Time
	TotalVisitDays int
	TotalHours     float64
	LastLoginTime  time.Time
}
