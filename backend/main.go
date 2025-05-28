package main

import (
	"log"
	"os"

	"snippedia/config"
	"snippedia/routes"
	"snippedia/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found or failed to load .env")
	}

	// Load configuration
	cfg := config.LoadConfig()

	// Connect to MongoDB
	if err := utils.ConnectDB(cfg.MongoURI, cfg.DatabaseName); err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}

	// Create Fiber app
	app := fiber.New(fiber.Config{
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error": err.Error(),
			})
		},
	})

	// Get allowed origins from environment variable or use default
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		allowedOrigins = "http://localhost:3000"
	}

	// Middleware
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE",
		AllowCredentials: true,
	}))

	// Setup routes
	routes.SetupRoutes(app)

	// Start server
	log.Fatal(app.Listen(":" + cfg.Port))
}
