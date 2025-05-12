package models

import "gorm.io/gorm"

type AuthProvider string

const (
	AuthProviderLocal  AuthProvider = "local"
	AuthProviderGithub AuthProvider = "github"
	AuthProviderGoogle AuthProvider = "google"
)

type User struct {
	gorm.Model
	Email                 string `gorm:"unique"`
	Username              string
	Password              string
	Avatar                string
	IsEmailConfirmed      bool
	EmailConfirmationCode string
	OAuthProvider         AuthProvider  `gorm:"default:'local'"`
	OAuthProviderID       string        `gorm:"index"`
	Tasks                 []TasksModel  //one-to-many
	Pomodoro              PomodoroModel //one-to-one #mb need to rework to one-to-many
}
