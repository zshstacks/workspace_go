package models

import (
	"crypto/rand"
	"fmt"
	"gorm.io/gorm"
)

type AuthProvider string

const (
	AuthProviderLocal  AuthProvider = "local"
	AuthProviderGithub AuthProvider = "github"
	AuthProviderGoogle AuthProvider = "google"
)

const idChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
const minIDLen = 8
const maxIDLen = 12
const maxIDAttempts = 5

type User struct {
	gorm.Model
	UniqueID              string `gorm:"uniqueIndex;size:12"`
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

func (u *User) BeforeCreate(tx *gorm.DB) (err error) {
	for i := 0; i < maxIDAttempts; i++ {
		id := generateRandomID()
		var count int64

		//check if the generated ID already exists in the database
		if err := tx.Model(&User{}).Where("unique_id = ?", id).Count(&count).Error; err != nil {
			return err
		}
		if count == 0 {
			u.UniqueID = id
			return nil
		}
	}

	return fmt.Errorf("could not create unique ID after %d attempts", maxIDAttempts)
}

func generateRandomID() string {
	length := minIDLen + int(randomByte()%(maxIDLen-minIDLen+1))
	bytes := make([]byte, length)
	for i := range bytes {
		bytes[i] = idChars[int(randomByte())%len(idChars)]
	}
	return string(bytes)
}

func randomByte() byte {
	var b [1]byte
	_, _ = rand.Read(b[:])
	return b[0]
}
