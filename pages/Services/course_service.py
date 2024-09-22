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

    def get_all_courses(self, plan_id = None):
        """
        Retrieve all courses from the database.
        :return: List of course documents.
        """
        collection = self.db["Courses"]
        all_courses = list(collection.find())
        if not plan_id:
            return all_courses

        plan = self.db["FourYearPlans"].find_one({"_id": ObjectId(plan_id)})
        if not plan:
            return all_courses

        plan_courses = []
        for semester in ["Unassigned", "year_1_sem_1", "year_1_sem_2", "year_2_sem_1", "year_2_sem_2",
                         "year_3_sem_1", "year_3_sem_2", "year_4_sem_1", "year_4_sem_2"]:
            plan_courses.extend(plan[semester])
        elective_courses = [req for req in plan["elective_reqs"].values() if req]
        plan_courses.extend(elective_courses)
        return plan_courses
