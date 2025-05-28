package controllers

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"snippedia/config"
	"snippedia/models"
	"snippedia/utils"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type GitHubUser struct {
	ID        int    `json:"id"`
	Login     string `json:"login"`
	Email     string `json:"email"`
	AvatarURL string `json:"avatar_url"`
	Bio       string `json:"bio"`
	HTMLURL   string `json:"html_url"`
}

func GitHubCallback(c *fiber.Ctx) error {
	code := c.Query("code")
	if code == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Code is required",
		})
	}

	// Exchange code for access token
	tokenReqBody := fmt.Sprintf(
		"client_id=%s&client_secret=%s&code=%s",
		config.LoadConfig().GitHubClientID,
		config.LoadConfig().GitHubClientSecret,
		code,
	)
	tokenReq, err := http.NewRequest("POST", "https://github.com/login/oauth/access_token", strings.NewReader(tokenReqBody))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create token request",
		})
	}
	tokenReq.Header.Set("Accept", "application/json")
	tokenReq.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	client := &http.Client{}
	tokenResp, err := client.Do(tokenReq)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get access token",
		})
	}
	defer tokenResp.Body.Close()

	var tokenData struct {
		AccessToken string `json:"access_token"`
		Scope       string `json:"scope"`
		TokenType   string `json:"token_type"`
	}
	if err := json.NewDecoder(tokenResp.Body).Decode(&tokenData); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse access token",
		})
	}
	if tokenData.AccessToken == "" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "No access token received from GitHub",
		})
	}

	// Get user info from GitHub
	userReq, err := http.NewRequest("GET", "https://api.github.com/user", nil)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create user info request",
		})
	}
	userReq.Header.Set("Authorization", "Bearer "+tokenData.AccessToken)
	userReq.Header.Set("Accept", "application/json")

	userResp, err := client.Do(userReq)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to get user info",
		})
	}
	defer userResp.Body.Close()

	body, err := io.ReadAll(userResp.Body)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to read user info response",
		})
	}

	var githubUser GitHubUser
	if err := json.Unmarshal(body, &githubUser); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to parse user info",
		})
	}

	// Create or update user in database
	user := models.User{
		GitHubID:  githubUser.ID,
		Username:  githubUser.Login,
		Email:     githubUser.Email,
		AvatarURL: githubUser.AvatarURL,
		Bio:       githubUser.Bio,
		GitHubURL: githubUser.HTMLURL,
		UpdatedAt: time.Now(),
	}

	collection := utils.GetCollection("users")
	var existingUser models.User
	err = collection.FindOne(context.Background(), bson.M{"github_id": githubUser.ID}).Decode(&existingUser)
	if err != nil {
		// Create new user
		user.CreatedAt = time.Now()
		result, err := collection.InsertOne(context.Background(), user)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create user",
			})
		}
		user.ID = result.InsertedID.(primitive.ObjectID)
	} else {
		// Update existing user with latest GitHub info
		user.ID = existingUser.ID
		user.CreatedAt = existingUser.CreatedAt
		_, err = collection.UpdateOne(
			context.Background(),
			bson.M{"_id": existingUser.ID},
			bson.M{"$set": user},
		)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update user",
			})
		}
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID.Hex(),
		"exp":     time.Now().Add(config.LoadConfig().JWTExpiration).Unix(),
	})

	tokenString, err := token.SignedString([]byte(config.LoadConfig().JWTSecret))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate token",
		})
	}

	return c.Redirect(os.Getenv("FRONTEND_URL") + "/?token=" + tokenString)
}

// User profile stubs
func GetUserProfile(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(models.User)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	return c.JSON(fiber.Map{
		"id":             user.ID.Hex(),
		"username":       user.Username,
		"avatar_url":     user.AvatarURL,
		"bio":            user.Bio,
		"github_url":     user.GitHubURL,
		"email":          user.Email,
		"badges":         user.Badges,
		"bookmarked_ids": user.BookmarkedIDs,
	})
}

func UpdateUserProfile(c *fiber.Ctx) error {
	return c.SendStatus(fiber.StatusNotImplemented)
}

// Snippet CRUD stubs
func CreateSnippet(c *fiber.Ctx) error {
	var snippet models.Snippet
	if err := c.BodyParser(&snippet); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}
	snippet.ID = primitive.NewObjectID()
	snippet.CreatedAt = time.Now()
	snippet.UpdatedAt = time.Now()
	collection := utils.GetCollection("snippets")
	_, err := collection.InsertOne(context.Background(), snippet)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create snippet"})
	}
	return c.Status(201).JSON(snippet)
}

func GetSnippets(c *fiber.Ctx) error {
	collection := utils.GetCollection("snippets")
	cursor, err := collection.Find(context.Background(), bson.M{})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch snippets"})
	}
	var snippets []models.Snippet
	if err := cursor.All(context.Background(), &snippets); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to decode snippets"})
	}

	// Populate author info for each snippet
	userCollection := utils.GetCollection("users")
	var result []map[string]interface{}
	for _, snip := range snippets {
		snippetMap := make(map[string]interface{})
		data, _ := bson.Marshal(snip)
		_ = bson.Unmarshal(data, &snippetMap)
		var author models.User
		if err := userCollection.FindOne(context.Background(), bson.M{"_id": snip.AuthorID}).Decode(&author); err == nil {
			snippetMap["author_username"] = author.Username
			snippetMap["author_avatar"] = author.AvatarURL
			snippetMap["author_github"] = author.GitHubURL
			snippetMap["author_bio"] = author.Bio
		}
		result = append(result, snippetMap)
	}
	return c.JSON(result)
}

func GetSnippet(c *fiber.Ctx) error {
	id := c.Params("id")
	objectID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid snippet ID"})
	}
	var snippet models.Snippet
	collection := utils.GetCollection("snippets")
	err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&snippet)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Snippet not found"})
	}
	// Populate author info
	userCollection := utils.GetCollection("users")
	var author models.User
	snippetMap := make(map[string]interface{})
	data, _ := bson.Marshal(snippet)
	_ = bson.Unmarshal(data, &snippetMap)
	if err := userCollection.FindOne(context.Background(), bson.M{"_id": snippet.AuthorID}).Decode(&author); err == nil {
		snippetMap["author_username"] = author.Username
		snippetMap["author_avatar"] = author.AvatarURL
		snippetMap["author_github"] = author.GitHubURL
		snippetMap["author_bio"] = author.Bio
	}
	return c.JSON(snippetMap)
}

func UpdateSnippet(c *fiber.Ctx) error {
	return c.SendStatus(fiber.StatusNotImplemented)
}

func DeleteSnippet(c *fiber.Ctx) error {
	snippetID := c.Params("id")
	user, ok := c.Locals("user").(models.User)
	if !ok {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Unauthorized"})
	}
	objectID, err := primitive.ObjectIDFromHex(snippetID)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "Invalid snippet ID"})
	}
	collection := utils.GetCollection("snippets")
	var snippet models.Snippet
	err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&snippet)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "Snippet not found"})
	}
	if snippet.AuthorID != user.ID {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "You are not the author of this snippet"})
	}
	_, err = collection.DeleteOne(context.Background(), bson.M{"_id": objectID})
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "Failed to delete snippet"})
	}
	return c.JSON(fiber.Map{"success": true})
}

// Comment CRUD stubs
func CreateComment(c *fiber.Ctx) error {
	return c.SendStatus(fiber.StatusNotImplemented)
}

func UpdateComment(c *fiber.Ctx) error {
	return c.SendStatus(fiber.StatusNotImplemented)
}

func DeleteComment(c *fiber.Ctx) error {
	return c.SendStatus(fiber.StatusNotImplemented)
}

// Bookmark stubs
func BookmarkSnippet(c *fiber.Ctx) error {
	return c.SendStatus(fiber.StatusNotImplemented)
}

func UnbookmarkSnippet(c *fiber.Ctx) error {
	return c.SendStatus(fiber.StatusNotImplemented)
}

func GetBookmarks(c *fiber.Ctx) error {
	return c.SendStatus(fiber.StatusNotImplemented)
}

// Add a reaction to a snippet
func AddSnippetReaction(c *fiber.Ctx) error {
	snippetID := c.Params("id")
	typeReq := c.Query("type") // useful, smart, refactored
	user, ok := c.Locals("user").(models.User)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	objectID, err := primitive.ObjectIDFromHex(snippetID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid snippet ID"})
	}
	collection := utils.GetCollection("snippets")
	var snippet models.Snippet
	err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&snippet)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Snippet not found"})
	}
	// Remove previous reaction by this user if exists
	oldType := ""
	for _, r := range snippet.Reactions {
		if r.UserID == user.ID {
			oldType = r.Type
			break
		}
	}
	if oldType != "" && oldType != typeReq {
		// Decrement old type
		_, _ = collection.UpdateByID(context.Background(), objectID, bson.M{"$inc": bson.M{oldType: -1}})
	}
	if oldType != typeReq {
		// Remove old reaction and add new
		_, _ = collection.UpdateByID(context.Background(), objectID, bson.M{"$pull": bson.M{"reactions": bson.M{"user_id": user.ID}}})
		_, _ = collection.UpdateByID(context.Background(), objectID, bson.M{"$push": bson.M{"reactions": models.Reaction{UserID: user.ID, Type: typeReq}}})
		_, _ = collection.UpdateByID(context.Background(), objectID, bson.M{"$inc": bson.M{typeReq: 1}, "$set": bson.M{"updated_at": time.Now()}})
	}
	return c.JSON(fiber.Map{"success": true})
}

// Bookmark or unbookmark a snippet
func ToggleBookmarkSnippet(c *fiber.Ctx) error {
	snippetID := c.Params("id")
	user, ok := c.Locals("user").(models.User)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	objectID, err := primitive.ObjectIDFromHex(snippetID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid snippet ID"})
	}
	collection := utils.GetCollection("snippets")
	var snippet models.Snippet
	err = collection.FindOne(context.Background(), bson.M{"_id": objectID}).Decode(&snippet)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Snippet not found"})
	}
	isBookmarked := false
	for _, uid := range snippet.BookmarkedBy {
		if uid == user.ID {
			isBookmarked = true
			break
		}
	}
	var update bson.M
	if isBookmarked {
		update = bson.M{"$pull": bson.M{"bookmarked_by": user.ID}}
	} else {
		update = bson.M{"$addToSet": bson.M{"bookmarked_by": user.ID}}
	}
	_, err = collection.UpdateByID(context.Background(), objectID, update)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update bookmark"})
	}
	return c.JSON(fiber.Map{"bookmarked": !isBookmarked})
}

// Add a comment to a snippet
func AddSnippetComment(c *fiber.Ctx) error {
	snippetID := c.Params("id")
	user, ok := c.Locals("user").(models.User)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	objectID, err := primitive.ObjectIDFromHex(snippetID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid snippet ID"})
	}
	var req struct {
		Content  string `json:"content"`
		ParentID string `json:"parentId"`
	}
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}
	var parentObjID primitive.ObjectID
	isReply := false
	if req.ParentID != "" {
		parentObjID, err = primitive.ObjectIDFromHex(req.ParentID)
		if err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid parent comment ID"})
		}
		isReply = true
	}
	comment := models.Comment{
		ID:             primitive.NewObjectID(),
		Content:        req.Content,
		AuthorID:       user.ID,
		AuthorUsername: user.Username,
		CreatedAt:      time.Now(),
		IsReply:        isReply,
		ParentID:       parentObjID,
	}
	if user.AvatarURL != "" {
		comment.AvatarURL = user.AvatarURL
	}
	if user.GitHubURL != "" {
		comment.GitHubURL = user.GitHubURL
	}
	collection := utils.GetCollection("snippets")
	_, err = collection.UpdateByID(context.Background(), objectID, bson.M{"$push": bson.M{"comments": comment}})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to add comment"})
	}
	return c.JSON(comment)
}

// Get a user's own snippets
func GetUserSnippets(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(models.User)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	collection := utils.GetCollection("snippets")
	cursor, err := collection.Find(context.Background(), bson.M{"author_id": user.ID})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch snippets"})
	}
	var snippets []models.Snippet
	if err := cursor.All(context.Background(), &snippets); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to decode snippets"})
	}
	// Populate author info for each snippet (same as GetSnippets)
	userCollection := utils.GetCollection("users")
	var result []map[string]interface{}
	for _, snip := range snippets {
		snippetMap := make(map[string]interface{})
		data, _ := bson.Marshal(snip)
		_ = bson.Unmarshal(data, &snippetMap)
		var author models.User
		if err := userCollection.FindOne(context.Background(), bson.M{"_id": snip.AuthorID}).Decode(&author); err == nil {
			snippetMap["author_username"] = author.Username
			snippetMap["author_avatar"] = author.AvatarURL
			snippetMap["author_github"] = author.GitHubURL
			snippetMap["author_bio"] = author.Bio
		}
		result = append(result, snippetMap)
	}
	return c.JSON(result)
}

// Get a user's bookmarked snippets
func GetUserBookmarkedSnippets(c *fiber.Ctx) error {
	user, ok := c.Locals("user").(models.User)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}
	collection := utils.GetCollection("snippets")
	cursor, err := collection.Find(context.Background(), bson.M{"bookmarked_by": user.ID})
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to fetch snippets"})
	}
	var snippets []models.Snippet
	if err := cursor.All(context.Background(), &snippets); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to decode snippets"})
	}
	return c.JSON(snippets)
}
