package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type User struct {
	ID            primitive.ObjectID   `bson:"_id,omitempty" json:"id"`
	GitHubID      int                  `bson:"github_id" json:"github_id"`
	Username      string               `bson:"username" json:"username"`
	Email         string               `bson:"email" json:"email"`
	AvatarURL     string               `bson:"avatar_url" json:"avatar_url"`
	Bio           string               `bson:"bio" json:"bio"`
	GitHubURL     string               `bson:"github_url" json:"github_url"`
	CreatedAt     time.Time            `bson:"created_at" json:"created_at"`
	UpdatedAt     time.Time            `bson:"updated_at" json:"updated_at"`
	Badges        []string             `bson:"badges" json:"badges"`
	BookmarkedIDs []primitive.ObjectID `bson:"bookmarked_ids" json:"bookmarked_ids"`
}
