package routes

import (
	"github.com/gin-gonic/gin"
	"server/controllers"
)

func OAuthRoutes(router *gin.Engine) {
	router.GET("/auth/github/login", controllers.GithubLogin)
	router.GET("/auth/github/callback", controllers.GithubCallback)

	router.GET("/auth/google/login", controllers.GoogleLogin)
	router.GET("/auth/google/callback", controllers.GoogleCallback)
}
