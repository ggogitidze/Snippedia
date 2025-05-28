package config

import (
	"os"
	"time"
)

type Config struct {
	MongoURI           string
	DatabaseName       string
	Port               string
	GitHubClientID     string
	GitHubClientSecret string
	JWTSecret          string
	JWTExpiration      time.Duration
}

func LoadConfig() *Config {
	return &Config{
		MongoURI:           getEnv("MONGO_URI", "mongodb://localhost:27017"),
		DatabaseName:       getEnv("DB_NAME", "Snippedia"),
		Port:               getEnv("PORT", "8080"),
		GitHubClientID:     getEnv("GITHUB_CLIENT_ID", ""),
		GitHubClientSecret: getEnv("GITHUB_CLIENT_SECRET", ""),
		JWTSecret:          getEnv("JWT_SECRET", "your-secret-key"),
		JWTExpiration:      time.Hour * 24 * 7, // 7 days
	}
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
