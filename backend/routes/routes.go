package routes

import (
	"snippedia/controllers"
	"snippedia/middleware"

	"github.com/gofiber/fiber/v2"
)

func SetupRoutes(app *fiber.App) {
	// Auth routes
	app.Get("/auth/github/callback", controllers.GitHubCallback)

	// Public snippet route
	app.Get("/api/snippets", controllers.GetSnippets)

	// Protected routes
	api := app.Group("/api", middleware.AuthMiddleware())

	// User routes
	api.Get("/user/profile", controllers.GetUserProfile)
	api.Put("/user/profile", controllers.UpdateUserProfile)

	// Snippet routes
	api.Get("/snippets/:id", controllers.GetSnippet)
	api.Put("/snippets/:id", controllers.UpdateSnippet)
	api.Delete("/snippets/:id", controllers.DeleteSnippet)

	// New: Reaction, bookmark, comment endpoints
	api.Post("/snippets/:id/reaction", controllers.AddSnippetReaction)
	api.Post("/snippets/:id/bookmark", controllers.ToggleBookmarkSnippet)
	api.Post("/snippets/:id/comment", controllers.AddSnippetComment)

	// New: User's own snippets and bookmarks
	api.Get("/user/snippets", controllers.GetUserSnippets)
	api.Get("/user/bookmarks", controllers.GetUserBookmarkedSnippets)

	// Comment routes
	api.Post("/snippets/:id/comments", controllers.CreateComment)
	api.Put("/snippets/:id/comments/:commentId", controllers.UpdateComment)
	api.Delete("/snippets/:id/comments/:commentId", controllers.DeleteComment)

	// Bookmark routes
	api.Post("/snippets/:id/bookmark", controllers.BookmarkSnippet)
	api.Delete("/snippets/:id/bookmark", controllers.UnbookmarkSnippet)
	api.Get("/bookmarks", controllers.GetBookmarks)

	// Protected POST for creating snippets
	api.Post("/snippets", controllers.CreateSnippet)
}
