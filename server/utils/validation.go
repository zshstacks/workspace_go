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
	// Pārbauda, vai parole satur vismaz vienu lielo burtu
	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	// Pārbauda, vai parole satur vismaz vienu speciālu simbolu
	hasSpecial := regexp.MustCompile(`[!@#$%^&*]`).MatchString(password)
	// Pārbauda, vai parole ir vismaz 10 rakstzīmes gara
	isLongEnough := len(password) >= 10

	return hasUpper && hasSpecial && isLongEnough
}
