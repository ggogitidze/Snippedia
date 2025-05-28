package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Reaction struct {
	UserID primitive.ObjectID `bson:"user_id" json:"user_id"`
	Type   string             `bson:"type" json:"type"`
}

type Snippet struct {
	ID           primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	Title        string               `bson:"title" json:"title"`
	Description  string               `bson:"description" json:"description"`
	Code         string               `bson:"code" json:"code"`
	Language     string               `bson:"language" json:"language"`
	Tags         []string             `bson:"tags" json:"tags"`
	AuthorID     primitive.ObjectID   `bson:"author_id" json:"author_id"`
	CreatedAt    time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt    time.Time            `bson:"updated_at" json:"updated_at"`
	Useful       int                  `bson:"useful" json:"useful"`
	Smart        int                  `bson:"smart" json:"smart"`
	Refactored   int                  `bson:"refactored" json:"refactored"`
	BookmarkedBy []primitive.ObjectID `bson:"bookmarked_by" json:"bookmarked_by"`
	Comments     []Comment            `bson:"comments" json:"comments"`
	Reactions    []Reaction           `bson:"reactions" json:"reactions"`
}

type Comment struct {
	ID             primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Content        string             `bson:"content" json:"content"`
	AuthorID       primitive.ObjectID `bson:"author_id" json:"author_id"`
	AuthorUsername string             `bson:"author_username" json:"author_username"`
	AvatarURL      string             `bson:"avatar_url,omitempty" json:"avatar_url,omitempty"`
	GitHubURL      string             `bson:"github_url,omitempty" json:"github_url,omitempty"`
	CreatedAt      time.Time          `bson:"created_at" json:"created_at"`
	IsReply        bool               `bson:"is_reply" json:"is_reply"`
	ParentID       primitive.ObjectID `bson:"parent_id,omitempty" json:"parent_id,omitempty"`
}
