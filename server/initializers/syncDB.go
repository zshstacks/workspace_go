package initializers

import (
	"log"
	"server/models"
)

func SyncDatabase() {
	err := DB.AutoMigrate(&models.User{})

	if err != nil {
		log.Fatalf("Could not migrate database: %v", err)
	} else {
		log.Println("Database migrated successfully")
	}
}
