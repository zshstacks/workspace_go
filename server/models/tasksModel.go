package models

import "gorm.io/gorm"

type TasksModel struct {
	gorm.Model
	UserID      uint
	LocalID     uint
	Title       string
	Description string
	Completed   bool `gorm:"default:false"`
}
