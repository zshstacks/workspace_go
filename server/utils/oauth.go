package utils

import (
	"errors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"gorm.io/gorm"
	"net/http"
	"os"
	"server/initializers"
	"server/models"
	"time"
)

func FindOrCreateOAuthUser(provider models.AuthProvider, providerID, email, name, avatarURL string) (*models.User, error) {
	var user models.User
	//try to find user by OAuth provider and ID
	err := initializers.DB.Where(&models.User{
		OAuthProvider:   provider,
		OAuthProviderID: providerID,
	}).First(&user).Error

	if err == nil {
		return &user, nil
	}

	//if error "user not found" return the error
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return &user, err
	}

	//if not found, try to find by email
	err = initializers.DB.Where(&models.User{Email: email}).First(&user).Error
	if err == nil {
		user.OAuthProvider = provider
		user.OAuthProviderID = providerID
		if err := initializers.DB.Save(&user).Error; err != nil {
			return &user, err
		}
		return &user, nil
	}

	//if error "user not found" return the error
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return &user, err
	}

	//if not found, create a new user
	user = models.User{
		Email:            email,
		Username:         name,
		Avatar:           avatarURL,
		IsEmailConfirmed: true,
		OAuthProvider:    provider,
		OAuthProviderID:  providerID,
	}
	if err := initializers.DB.Create(&user).Error; err != nil {
		return &user, err
	}

	defaultSettings := models.PomodoroModel{
		UserID:             user.ID,
		PomodoroDuration:   25,
		ShortBreakDuration: 5,
		LongBreakDuration:  15,
	}
	if err := initializers.DB.Create(&defaultSettings).Error; err != nil {
		return &user, err
	}
	return &user, nil
}

func SetAuthCookies(c *gin.Context, user *models.User) {
	//access token with 45min
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(45 * time.Minute).Unix(),
	})
	accessString, err := accessToken.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create access token"})
		return
	}

	//refreshToken with 7d
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":        user.ID,
		"exp":        time.Now().Add(7 * 24 * time.Hour).Unix(),
		"token_type": "refresh",
	})
	refreshString, err := refreshToken.SignedString([]byte(os.Getenv("REFRESH_SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create refresh token"})
		return
	}

	c.SetCookie("token", accessString,
		int((45 * time.Minute).Seconds()),
		"/",
		"",
		false,
		true,
	)

	c.SetCookie("refreshToken", refreshString,
		int((7 * 24 * time.Hour).Seconds()),
		"/",
		"",
		false,
		true,
	)

}
