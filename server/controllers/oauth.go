package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"golang.org/x/oauth2"
	"net/http"
	"server/initializers"
	"server/models"
	"server/utils"
)

// redirect to git auth page
func GithubLogin(c *gin.Context) {
	url := initializers.GithubOAuthConfig.AuthCodeURL("state-github", oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func GithubCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No code provided"})
		return
	}

	token, err := initializers.GithubOAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange token"})
		return
	}

	client := initializers.GithubOAuthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://api.github.com/user")
	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get github user info"})
		return
	}
	defer resp.Body.Close()

	var ghUser struct {
		ID        int    `json:"id"`
		Email     string `json:"email"`
		Name      string `json:"name"`
		AvatarURL string `json:"avatar_url"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&ghUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode github user info"})
		return
	}

	//if email not available, additional request
	if ghUser.Email == "" {
		emailResp, err := client.Get("https://api.github.com/user/emails")
		if err == nil && emailResp.StatusCode == http.StatusOK {
			defer emailResp.Body.Close()
			var emails []struct {
				Email   string `json:"email"`
				Primary bool   `json:"primary"`
			}
			json.NewDecoder(emailResp.Body).Decode(&emails)
			for _, e := range emails {
				if e.Primary {
					ghUser.Email = e.Email
					break
				}
			}
		}
	}

	if ghUser.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No github email available"})
		return
	}

	//find or create a user
	user, err := utils.FindOrCreateOAuthUser(
		models.AuthProviderGithub,
		fmt.Sprint(ghUser.ID),
		ghUser.Email,
		ghUser.Name,
		ghUser.AvatarURL,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find or create user"})
		return
	}

	//generate jwt token and refreshToken
	utils.SetAuthCookies(c, user)
	c.JSON(http.StatusOK, gin.H{"message": "Github login successful"})
}

func GoogleLogin(c *gin.Context) {
	url := initializers.GoogleOAuthConfig.AuthCodeURL("state-google", oauth2.AccessTypeOffline)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func GoogleCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No code provided"})
		return
	}

	token, err := initializers.GoogleOAuthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange token"})
		return
	}

	client := initializers.GoogleOAuthConfig.Client(context.Background(), token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil || resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get google user info"})
		return
	}
	defer resp.Body.Close()

	var gUser struct {
		ID      string `json:"id"`
		Email   string `json:"email"`
		Name    string `json:"name"`
		Picture string `json:"picture"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&gUser); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode google user info"})
		return
	}

	user, err := utils.FindOrCreateOAuthUser(
		models.AuthProviderGoogle,
		gUser.ID,
		gUser.Email,
		gUser.Name,
		gUser.Picture,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to find or create user"})
		return
	}

	utils.SetAuthCookies(c, user)
	c.JSON(http.StatusOK, gin.H{"message": "Google login successful"})
}
