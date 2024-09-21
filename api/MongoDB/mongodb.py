from pymongo import MongoClient
from pymongo.errors import ConnectionError, OperationFailure

class MongoDB:
    def __init__(self, uri, db_name):
        """
        Initialize the MongoDB connection.
        :param uri: The MongoDB connection string.
        :param db_name: The database name to connect to.
        """
        self.uri = uri
        self.db_name = db_name
        self.client = None
        self.db = None
        self.connect()

    def connect(self):
        """Connect to the MongoDB client."""
        try:
            self.client = MongoClient(self.uri)
            self.db = self.client[self.db_name]
            print(f"Connected to database: {self.db_name}")
        except (ConnectionError, OperationFailure) as e:
            print(f"Error connecting to MongoDB: {e}")

    def insert_one(self, collection_name, document):
        """Insert a single document into a collection."""
        try:
            collection = self.db[collection_name]
            result = collection.insert_one(document)
            print(f"Document inserted with _id: {result.inserted_id}")
            return result.inserted_id
        except Exception as e:
            print(f"Error inserting document: {e}")
            return None

    def find(self, collection_name, query=None):
        """
        Find documents in a collection.
        :param collection_name: The collection to query.
        :param query: The query filter (optional).
        :return: List of matching documents.
        """
        try:
            collection = self.db[collection_name]
            results = collection.find(query or {})
            return list(results)
        except Exception as e:
            print(f"Error finding documents: {e}")
            return []

    def update_one(self, collection_name, query, update):
        """
        Update a single document in a collection.
        :param collection_name: The collection to update.
        :param query: The query filter to find the document.
        :param update: The update operation to apply.
        :return: The result of the update operation.
        """
        try:
            collection = self.db[collection_name]
            result = collection.update_one(query, {"$set": update})
            print(f"Matched {result.matched_count} document(s) and modified {result.modified_count} document(s).")
            return result.modified_count
        except Exception as e:
            print(f"Error updating document: {e}")
            return 0

    def delete_one(self, collection_name, query):
        """
        Delete a single document from a collection.
        :param collection_name: The collection to delete from.
        :param query: The query filter to find the document.
        :return: The result of the delete operation.
        """
        try:
            collection = self.db[collection_name]
            result = collection.delete_one(query)
            print(f"Deleted {result.deleted_count} document(s).")
            return result.deleted_count
        except Exception as e:
            print(f"Error deleting document: {e}")
            return 0

    def close(self):
        """Close the MongoDB connection."""
        if self.client:
            self.client.close()
            print("Connection closed.")


# Usage Example
if __name__ == "__main__":
    # MongoDB connection string and database name
    uri = "mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority"
    db_name = "test"

    # Initialize MongoDB instance
    mongo_db = MongoDB(uri, db_name)

    # Example document to insert
    new_recipe = {
        "title": "Spaghetti Carbonara",
        "ingredients": ["spaghetti", "eggs", "bacon", "parmesan"],
        "time": "30m"
    }

    # Insert the document
    mongo_db.insert_one("recipes", new_recipe)

    # Query documents from the 'recipes' collection
    recipes = mongo_db.find("recipes")
    print("Recipes in database:", recipes)

    # Update a document
    mongo_db.update_one("recipes", {"title": "Spaghetti Carbonara"}, {"time": "25m"})

    # Delete a document
    mongo_db.delete_one("recipes", {"title": "Spaghetti Carbonara"})

    # Close the connection
    mongo_db.close()