

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
        query = {"uqid": uqid}
        resp = self.db.find("Courses", query)
        if not resp:
            return None
        return resp[0]
