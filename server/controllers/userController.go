package controllers

import (
	"encoding/json"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"log"
	"math/rand"
	"net/http"
	"net/smtp"
	"os"
	"server/initializers"
	"server/models"
	"server/utils"
	"time"
)

const (
	UserCachePrefix  = "user:"
	UserCacheTTL     = 30 * time.Minute
	StatsCachePrefix = "stats:"
	StatsCacheTTL    = 15 * time.Minute
)

const optChars = "1234567890"

func generateConfirmationCode(length int) (string, error) {
	buffer := make([]byte, length)
	_, err := rand.Read(buffer)
	if err != nil {
		return "", err
	}

	optCharsLength := len(optChars)
	for i := 0; i < length; i++ {
		buffer[i] = optChars[int(buffer[i])%optCharsLength]
	}

	return string(buffer), nil
}

// caching helper function
func cacheUser(user models.User) error {
	userJSON, err := json.Marshal(user)
	if err != nil {
		return err
	}

	userKey := fmt.Sprintf("%s%d", UserCachePrefix, user.ID)
	emailKey := fmt.Sprintf("%s%s", UserCachePrefix, user.Email)

	//save user by id
	if err := initializers.RedisClient.Set(initializers.Ctx, userKey, userJSON, UserCacheTTL).Err(); err != nil {
		return err
	}

	//save user by email
	if err := initializers.RedisClient.Set(initializers.Ctx, emailKey, userJSON, UserCacheTTL).Err(); err != nil {
		return err
	}

	return nil
}

func getUserByID(userID uint) (models.User, error) {
	var user models.User

	//try to get from cache
	userKey := fmt.Sprintf("%s%d", UserCachePrefix, userID)
	userJSON, err := initializers.RedisClient.Get(initializers.Ctx, userKey).Result()

	if err == nil {

		if err := json.Unmarshal([]byte(userJSON), &user); err != nil {
			return user, err
		}
		return user, nil
	}

	//no cache, get from db
	if err := initializers.DB.First(&user, userID).Error; err != nil {
		return user, err
	}

	//connect to cache
	go cacheUser(user)
	return user, nil
}

func getUserByEmail(email string) (models.User, error) {
	var user models.User

	//try to get from cache
	emailKey := fmt.Sprintf("%s%s", UserCachePrefix, email)
	userJSON, err := initializers.RedisClient.Get(initializers.Ctx, emailKey).Result()

	if err == nil {
		if err := json.Unmarshal([]byte(userJSON), &user); err != nil {
			return user, err
		}
		return user, nil
	}

	//no cache, get from db
	if err := initializers.DB.First(&user, "email = ?", email).Error; err != nil {
		return user, err
	}

	//connect to cache
	go cacheUser(user)
	return user, nil
}

// func, when user is updated, delete cache
func invalidateUserCache(user models.User) {
	userKey := fmt.Sprintf("%s%d", UserCachePrefix, user.ID)
	userEmail := fmt.Sprintf("%s%s", UserCachePrefix, user.Email)

	initializers.RedisClient.Del(initializers.Ctx, userKey)
	initializers.RedisClient.Del(initializers.Ctx, userEmail)
}

func sendEmailConfirmation(toEmail, code string) error {
	from := "uns4d123@gmail.com"
	password := os.Getenv("EMAIL_PASS")
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")

	message := []byte("Subject: Email Confirmation\n\n" + "Your confirmation code is: " + code)

	auth := smtp.PlainAuth("", from, password, smtpHost)
	return smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{toEmail}, message)
}

func ConfirmEmail(c *gin.Context) {

	var body struct {
		Code string `json:"code"`
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	if body.Code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Code cannot be empty"})
		return
	}

	if initializers.DB == nil {
		log.Println("Database connection is nil in ConfirmEmail")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database connection not initialized"})
		return
	}

	var user models.User

	if err := initializers.DB.First(&user, "email_confirmation_code = ?", body.Code).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(404, gin.H{"error": "Invalid confirmation code"})
		} else {
			c.JSON(500, gin.H{"error": "Server error"})
		}
		return
	}

	user.IsEmailConfirmed = true
	user.EmailConfirmationCode = ""

	if err := initializers.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user status"})
		return
	}

	//update cache with new data
	cacheUser(user)

	c.JSON(http.StatusOK, gin.H{"successCodeEmail": "Email confirmed!"})
}

func ResendConfirmationCode(c *gin.Context) {
	var body struct {
		Email string `json:"email"`
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	//find user by email, using cache
	user, err := getUserByEmail(body.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Email not registered"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Server error"})
		}
		return
	}

	// check if email is confirmed
	if user.IsEmailConfirmed {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is already confirmed"})
		return
	}

	// generate new code
	confirmationCode, err := generateConfirmationCode(6)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate confirmation code"})
		return
	}
	user.EmailConfirmationCode = confirmationCode

	// save to db
	if err := initializers.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update confirmation code"})
		return
	}

	invalidateUserCache(user)

	// send new code
	if err := sendEmailConfirmation(user.Email, confirmationCode); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send confirmation email"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"successResent": "Confirmation code resent successfully"})
}

func SignUp(c *gin.Context) {
	//get the email/password off req body
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Username string `json:"username"`
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Failed to read body",
		})
		return
	}

	//validate email
	if body.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"emailError": "Email is required"})
		return
	}
	//validate email format
	if !utils.IsValidEmail(body.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"emailError": "Invalid email format"})
		return
	}

	//validate username
	if body.Username == "" {
		c.JSON(http.StatusBadRequest, gin.H{"usernameError": "Username is required"})
		return
	}

	//validate username length
	if !utils.IsValidUsername(body.Username) {
		c.JSON(http.StatusBadRequest, gin.H{"usernameError": "Username must be at least 4 characters"})
		return
	}

	//validates password
	if body.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"passwordError": "Password is required"})
		return
	}

	//validates pass length, char, spec char
	if !utils.IsValidPassword(body.Password) {
		c.JSON(http.StatusBadRequest, gin.H{"passwordError": "Password must be at least 10 characters long, with uppercase letter, and a special character"})
		return
	}

	//hash the password
	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), 10)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to hash password"})
		return
	}

	confirmationCode, err := generateConfirmationCode(6)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate confirmation code"})
		return
	}

	//create a user
	user := models.User{
		Email:                 body.Email,
		Username:              body.Username,
		Password:              string(hash),
		IsEmailConfirmed:      false,
		EmailConfirmationCode: confirmationCode,
	}
	result := initializers.DB.Create(&user)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create user"})
		return
	}

	//create pomodoro table
	if result.Error == nil {
		defaultSettings := models.PomodoroModel{
			UserID:             user.ID,
			PomodoroDuration:   25,
			ShortBreakDuration: 5,
			LongBreakDuration:  15,
		}
		initializers.DB.Create(&defaultSettings)
	}

	//connect new user to cache
	cacheUser(user)

	if err := sendEmailConfirmation(body.Email, confirmationCode); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errorConfirmation": "Failed to send confirmation email "})
		return
	}

	//respond
	c.JSON(http.StatusCreated, gin.H{"success": "Account created! Please confirm your email."})
}

func SignIn(c *gin.Context) {
	var body struct {
		Email    string
		Password string
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	user, err := getUserByEmail(body.Email)
	if err != nil || user.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"errorLogin": "Invalid email or password"})
		return
	}

	//compare sent in pass with saved user pass hash
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorLogin": "Invalid email or password"})
		return
	}

	//check if email is confirmed
	if !user.IsEmailConfirmed {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email not confirmed"})
		return
	}

	//Ensure Workspace settings exist for the user
	var settings models.PomodoroModel
	pomodoroKey := fmt.Sprintf("pomodoro:%d", user.ID)
	pomodoroJSON, redisErr := initializers.RedisClient.Get(initializers.Ctx, pomodoroKey).Result()

	if redisErr == nil {
		// find cache
		if err := json.Unmarshal([]byte(pomodoroJSON), &settings); err != nil {
			// continue with db, if cache is corrupted
			if err := initializers.DB.First(&settings, "user_id = ?", user.ID).Error; err != nil {
				if errors.Is(err, gorm.ErrRecordNotFound) {
					defaultSettings := models.PomodoroModel{
						UserID:             user.ID,
						PomodoroDuration:   25,
						ShortBreakDuration: 5,
						LongBreakDuration:  15,
					}
					initializers.DB.Create(&defaultSettings)

					// save new data to cache
					settingsJSON, _ := json.Marshal(defaultSettings)
					initializers.RedisClient.Set(initializers.Ctx, pomodoroKey, settingsJSON, UserCacheTTL)
				} else {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check pomodoro settings"})
					return
				}
			}
		}
	} else {
		// no cache, get from db
		if err := initializers.DB.First(&settings, "user_id = ?", user.ID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				defaultSettings := models.PomodoroModel{
					UserID:             user.ID,
					PomodoroDuration:   25,
					ShortBreakDuration: 5,
					LongBreakDuration:  15,
				}
				initializers.DB.Create(&defaultSettings)

				// save new data to cache
				settingsJSON, _ := json.Marshal(defaultSettings)
				initializers.RedisClient.Set(initializers.Ctx, pomodoroKey, settingsJSON, UserCacheTTL)
			} else {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check pomodoro settings"})
				return
			}
		} else {
			// save existing data to cache
			settingsJSON, _ := json.Marshal(settings)
			initializers.RedisClient.Set(initializers.Ctx, pomodoroKey, settingsJSON, UserCacheTTL)
		}
	}

	//generate jwt token
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(45 * time.Minute).Unix(),
	})

	accessTokenString, err := accessToken.SignedString([]byte(os.Getenv("SECRET")))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create token"})
		return
	}

	//generate refreshToken(refreshToken exp > jwt)
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub":        user.ID,
		"exp":        time.Now().Add(7 * 24 * time.Hour).Unix(),
		"token_type": "refresh",
	})
	refreshTokenString, err := refreshToken.SignedString([]byte(os.Getenv("REFRESH_SECRET")))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create refresh token"})
		return
	}

	//send it back
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "token",
		Value:    accessTokenString,
		HttpOnly: true,
		MaxAge:   int((45 * time.Minute).Seconds()),
		Path:     "/",
	})

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "refresh_token",
		Value:    refreshTokenString,
		HttpOnly: true,
		MaxAge:   int((7 * 24 * time.Hour).Seconds()),
		Path:     "/",
	})

	c.JSON(http.StatusOK, gin.H{"successLogin": "Login successful!"})

}

func RefreshToken(c *gin.Context) {
	//get refresh token from cookie
	refreshTokenString, err := c.Cookie("refresh_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "No refresh token found"})
		return
	}

	//parse and check refresh token
	token, err := jwt.Parse(refreshTokenString, func(token *jwt.Token) (interface{}, error) {

		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signature method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("REFRESH_SECRET")), nil
	})

	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid refresh token"})
		return
	}

	//get token claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token data"})
		return
	}

	//check token_type, to ensure this is a refresh token
	if tokenType, ok := claims["token_type"].(string); !ok || tokenType != "refresh" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token type"})
		return
	}

	//check token exp date
	exp, ok := claims["exp"].(float64)
	if !ok || float64(time.Now().Unix()) > exp {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Refresh token is expired"})
		return
	}

	//get the user id from sub field
	sub, ok := claims["sub"].(float64)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token data"})
		return
	}

	//find user using cache
	user, err := getUserByID(uint(sub))
	if err != nil || user.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found!"})
		return
	}

	//create a new accessToken
	newAccessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(45 * time.Minute).Unix(),
	})
	newAccessTokenString, err := newAccessToken.SignedString([]byte(os.Getenv("SECRET")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot create a new access token"})
		return
	}

	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "token",
		Value:    newAccessTokenString,
		HttpOnly: true,
		MaxAge:   int((45 * time.Minute).Seconds()),
		Path:     "/",
	})

	c.JSON(http.StatusOK, gin.H{"success": "New access token created!"})
}

func Validate(c *gin.Context) {
	user, exists := c.Get("user")

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"errorValidate": "Unauthorized"})
		return
	}

	userModel, ok := user.(models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"errorValidate": "Failed to retrieve user"})
		return
	}

	//respond with user data
	c.JSON(http.StatusOK, gin.H{
		"id":       userModel.ID,
		"email":    userModel.Email,
		"username": userModel.Username,
		"uniqueID": userModel.UniqueID,
	})
}

func Logout(c *gin.Context) {

	//delete the jwt cookie
	c.SetCookie("token", "", -1, "/", "", false, true)
	//delete refresh token
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"successLogout": "Logged out successfully",
	})
}

func DeleteUser(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	userID := currentUser.ID

	//delete user data from cache
	invalidateUserCache(currentUser)

	//delete pomodoro from cache
	pomodoroKey := fmt.Sprintf("pomodoro:%d", userID)
	initializers.RedisClient.Del(initializers.Ctx, pomodoroKey)

	//delete stats from cache
	statsKey := fmt.Sprintf("%s%d", StatsCachePrefix, userID)
	initializers.RedisClient.Del(initializers.Ctx, statsKey)

	//use transaction to ensure data integrity
	tx := initializers.DB.Begin()

	//pomodoro delete
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.PomodoroModel{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user's pomodoro data"})
		return
	}

	//tasks delete
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.TasksModel{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user's tasks data"})
		return
	}

	//stats delete
	if err := tx.Unscoped().Where("user_id = ?", userID).Delete(&models.StatsModel{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user's stats data"})
		return
	}

	//user delete(not soft)
	if err := tx.Unscoped().Delete(&currentUser).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	//commit transaction
	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	c.SetCookie("token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"successDelete": "User deleted successfully",
	})
}

func ChangeUsername(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	currentUser, ok := user.(models.User)
	if !ok {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve user"})
		return
	}

	var body struct {
		NewUsername string `json:"newUsername"`
	}

	if c.Bind(&body) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to read body"})
		return
	}

	if body.NewUsername == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "username is required"})
		return
	}

	if !utils.IsValidUsername(body.NewUsername) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid username format"})
		return
	}

	var existingUser models.User
	result := initializers.DB.First(&existingUser, "username = ?", body.NewUsername)
	if result.Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Username already taken"})
		return
	} else if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
	}

	invalidateUserCache(currentUser)

	currentUser.Username = body.NewUsername
	if err := initializers.DB.Save(&currentUser).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update username"})
		return
	}

	cacheUser(currentUser)

	c.JSON(http.StatusOK, gin.H{"success": "Username updated successfully!"})
}
