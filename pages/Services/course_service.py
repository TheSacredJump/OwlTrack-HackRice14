from bson import ObjectId


# course_service.py

class CourseService:
    def __init__(self, db):
        """
        Initialize the CourseService with a database connection.
        :param db: Instance of MongoDB.
        """
        self.db = db

    def get_course(self, uqid: str):
        """
        Retrieve a course by its unique identifier (uqid).
        :param uqid: The unique identifier of the course.
        :return: The course document if found, else None.
        """
        if not isinstance(uqid, ObjectId):
            try:
                uqid = ObjectId(uqid)
            except:
                print(f"Invalid uqid format: {uqid}")
                return None

        query = {"_id": uqid}
        # Access the 'Majors' collection
        collection = self.db["Courses"]
        return collection.find_one(query)
