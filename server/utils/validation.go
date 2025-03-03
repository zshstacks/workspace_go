package utils

import "regexp"

// validates an email address format
func IsValidEmail(email string) bool {
	regex := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`
	re := regexp.MustCompile(regex)
	return re.MatchString(email)
}

// validates a username (at least 4 characters)
func IsValidUsername(username string) bool {
	return len(username) >= 4
}

// validates a pass (at least 10 char, 1 upper case and 1 special char)
func IsValidPassword(password string) bool {
	// Check if pass has atleast 1 chapter symbol
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	// Check if pass has atleast 1 special symbol
	hasSpecial := regexp.MustCompile(`[!@#$%^&*]`).MatchString(password)
	// Check if pass has atleas 10 characters length
	isLongEnough := len(password) >= 10

	return hasUpper && hasSpecial && isLongEnough
}

func IsValidTitle(title string) bool {
	if title == "" {
		return false
	}
	isLongEnough := len(title) >= 2 && len(title) <= 95

	return isLongEnough
}

func IsValidDescription(description string) bool {
	if description == "" {
		return false
	}
	isLongEnough := len(description) >= 1 && len(description) <= 870

	return isLongEnough
}
