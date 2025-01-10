package controllers

import (
	"errors"
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
	"strconv"
	"time"
)

func generateConfirmationCode() string {
	return strconv.Itoa(rand.Intn(1000000))
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

	// find by email
	var user models.User
	if err := initializers.DB.First(&user, "email = ?", body.Email).Error; err != nil {
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
	confirmationCode := generateConfirmationCode()
	user.EmailConfirmationCode = confirmationCode

	// save to db
	if err := initializers.DB.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update confirmation code"})
		return
	}

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

	confirmationCode := generateConfirmationCode()

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

	if result.Error == nil {
		defaultSettings := models.PomodoroModel{
			UserID:             user.ID,
			PomodoroDuration:   25,
			ShortBreakDuration: 5,
			LongBreakDuration:  15,
		}
		initializers.DB.Create(&defaultSettings)
	}

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

	//look up req user
	var user models.User
	initializers.DB.First(&user, "email = ?", body.Email)

	if user.ID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"errorLogin": "Invalid email or password"})
		return
	}

	//compare sent in pass with saved user pass hash
	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"errorLogin": "Invalid email or password"})
		return
	}

	//check if email is confirmed
	if !user.IsEmailConfirmed {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email not confirmed"})
		return
	}

	var settings models.PomodoroModel
	if err := initializers.DB.First(&settings, "user_id = ?", user.ID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			defaultSettings := models.PomodoroModel{
				UserID:             user.ID,
				PomodoroDuration:   25,
				ShortBreakDuration: 5,
				LongBreakDuration:  15,
			}
			initializers.DB.Create(&defaultSettings)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to check pomodoro settings"})
			return
		}
	}

	//generate jwt token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"sub": user.ID,
		"exp": time.Now().Add(time.Hour * 24 * 30).Unix(),
	})

	tokenString, err := token.SignedString([]byte(os.Getenv("SECRET")))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create token"})
		return
	}

	//send it back
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "token",
		Value:    tokenString,
		HttpOnly: true,
		MaxAge:   int((time.Hour * 24 * 30).Seconds()),
	})

	c.JSON(http.StatusOK, gin.H{"successLogin": "Login successful!"})

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
	})
}

func Logout(c *gin.Context) {
	//delete the jwt cookie
	c.SetCookie("token", "", -1, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"successLogout": "Logged out successfully",
	})
}

func DeleteUser(c *gin.Context) {
	user, _ := c.Get("user")
	currentUser := user.(models.User)

	result := initializers.DB.Delete(&currentUser)

	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete user"})
		return
	}

	c.SetCookie("token", "", -1, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"successDelete": "User deleted successfully",
	})
}
