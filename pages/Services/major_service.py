from bson import ObjectId

class MajorService:
    def __init__(self, db):
        """
        Initialize the MajorService with a database connection.
        :param db: Instance of MongoDB.
        """
        self.db = db

    def get_major(self, uqid):
        """
        Retrieve a major by its unique identifier (uqid).
        :param uqid: The unique identifier of the major (str or ObjectId).
        :return: The major document if found, else None.
        """
        if not isinstance(uqid, ObjectId):
            try:
                uqid = ObjectId(uqid)
            except:
                print(f"Invalid uqid format: {uqid}")
                return None

        query = {"_id": uqid}
        # Access the 'Majors' collection
        collection = self.db["Majors"]
        return collection.find_one(query)

    def get_major_by_name(self, full_name: str):
        """
        Retrieve a major by its full name.
        :param full_name: The full name of the major.
        :return: The major document if found, else None.
        """
        query = {"Full-Name": full_name}
        collection = self.db["Majors"]

        # Use find() but get the first document
        result = collection.find(query)
        return result[0] if result else None

