package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Email                 string `gorm:"unique"`
	Username              string
	Password              string
	Avatar                string
	IsEmailConfirmed      bool
	EmailConfirmationCode string
	Tasks                 []TasksModel  //one-to-many
	Pomodoro              PomodoroModel //one-to-one #mb need to rework to one-to-many
}
