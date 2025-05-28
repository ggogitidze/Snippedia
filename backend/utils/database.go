package utils

import (
	"context"
	"log"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)

var DB *mongo.Database

func ConnectDB(uri, dbName string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return err
	}

	// Ping the database
	err = client.Ping(ctx, readpref.Primary())
	if err != nil {
		return err
	}

	DB = client.Database(dbName)
	log.Println("Connected to MongoDB!")
	return nil
}

func GetCollection(collectionName string) *mongo.Collection {
	return DB.Collection(collectionName)
}
