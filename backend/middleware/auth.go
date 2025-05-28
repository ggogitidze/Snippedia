package middleware

import (
	"context"
	"strings"

	"snippedia/config"
	"snippedia/models"
	"snippedia/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AuthMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")

		if authHeader == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Authorization header is required",
			})
		}

		tokenString := strings.Replace(authHeader, "Bearer ", "", 1)

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(config.LoadConfig().JWTSecret), nil
		})

		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token",
			})
		}

		if !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid token",
			})
		}

		claims := token.Claims.(jwt.MapClaims)
		userID := claims["user_id"].(string)

		objectID, err := primitive.ObjectIDFromHex(userID)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid user ID in token",
			})
		}

		// Get user from database
		var user models.User
		err = utils.GetCollection("users").FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&user)
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "User not found",
			})
		}

		// Set user in context
		c.Locals("user", user)
		return c.Next()
	}
}
