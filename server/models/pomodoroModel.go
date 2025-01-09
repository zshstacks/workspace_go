package models

import (
	"gorm.io/gorm"
	"time"
)

type PomodoroModel struct {
	gorm.Model
	UserID             uint   `gorm:"unique"`
	PomodoroDuration   int    `gorm:"default:25"`
	ShortBreakDuration int    `gorm:"default:5"`
	LongBreakDuration  int    `gorm:"default:15"`
	IsRunning          bool   `gorm:"default:false"`
	CurrentPhase       string `gorm:"default:'pomodoro'"`
	StartTime          *time.Time
	RemainingTime      int
}
