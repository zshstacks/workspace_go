package middleware

import (
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
	"os"
	"server/initializers"
	"server/models"
	"time"
)

const (
	UserCachePrefix = "user:"
	UserCacheTTL    = 30 * time.Minute
)

// helper func user save to cache
func cacheUser(user models.User) error {
	userJSON, err := json.Marshal(user)
	if err != nil {
		return err
	}

	userKey := fmt.Sprintf("%s%d", UserCachePrefix, user.ID)
	emailKey := fmt.Sprintf("%s%s", UserCachePrefix, user.Email)

	//save by id
	if err := initializers.RedisClient.Set(initializers.Ctx, userKey, userJSON, UserCacheTTL).Err(); err != nil {
		return err
	}
	//save by email
	if err := initializers.RedisClient.Set(initializers.Ctx, emailKey, userJSON, UserCacheTTL).Err(); err != nil {
		return err
	}

	return nil
}

// get user by id from cache or db
func getUserByID(userID uint) (models.User, error) {
	var user models.User

	//try to get from cache
	userKey := fmt.Sprintf("%s%d", UserCachePrefix, userID)
	userJSON, err := initializers.RedisClient.Get(initializers.Ctx, userKey).Result()

	if err == nil {
		//cache is finded
		if err := json.Unmarshal([]byte(userJSON), &user); err != nil {
			return user, err
		}
		return user, nil
	}

	//cache not found, get from db
	if err := initializers.DB.First(&user, userID).Error; err != nil {
		return user, err
	}

	//save cache parallelly
	go cacheUser(user)
	return user, nil
}

func RequireAuth(c *gin.Context) {
	//get the cookie off req
	tokenString, err := c.Cookie("token")

	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing or invalid accessToken"})
		return
	}

	//validate it/decode
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("Unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("SECRET")), nil
	})

	if err != nil {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return
	}

	//extract claims
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token claims"})
		return
	}

	//check the expiration time
	exp, ok := claims["exp"].(float64)
	if !ok || float64(time.Now().Unix()) > exp {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token expired"})
		return
	}

	//find the user using the `sub` claim
	sub, ok := claims["sub"].(float64)
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token payload"})
		return
	}

	user, err := getUserByID(uint(sub))
	if err != nil || user.ID == 0 {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	//attach the user to the context
	c.Set("user", user)

	c.Next()
}
