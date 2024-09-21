# four_year_plan_service.py
from dataclasses import asdict

from pages.MongoDB.mongodb import MongoDB
from pages.Objects.four_year_plan import new_four_year_plan
from bson import ObjectId


class FourYearPlanService:
    def __init__(self, db: MongoDB, major_service, course_service):
        """
        Initialize the FourYearPlanService with a database connection.
        :param db: Instance of MongoDB.
        """
        self.course_service = course_service
        self.db = db
        self.major_service = major_service

    def get_four_year_plan(self, uqid):
        """
        Retrieve a four-year plan by its unique identifier (uqid).
        :param uqid: The unique identifier of the four-year plan (str or ObjectId).
        :return: The four-year plan document if found, else None.
        """
        # Ensure uqid is an ObjectId
        if not isinstance(uqid, ObjectId):
            try:
                uqid = ObjectId(uqid)
            except:
                print(f"Invalid uqid format: {uqid}")
                return None

        query = {"_id": uqid}
        collection = self.db["FourYearPlans"]
        resp = collection.find_one(query)
        return resp

    def create_four_year_plan(self, name: str, major: str):
        """
        Create a new four-year plan.
        :param name: The name of the plan.
        :param major: The major associated with the plan.
        :return: The ID of the created document.
        """
        major = self.major_service.get_major_by_name(major)
        assert major is not None, "Major not found"
        unassigned = []
        elective_reqs = {}
        for course_type, courses in major:
            # Skips the first two fields (Name and Major)
            if course_type == "Name" or course_type == "Major":
                continue
            if course_type == "Core":
                unassigned.extend(courses)
                continue
            if courses["reqs"] > 1:
                for i in range(1, courses["reqs"] + 1):
                    elective_reqs[f"{course_type} {i}"] = None
                    unassigned.append(f"{course_type} {i}")
                continue
            elective_reqs[course_type] = None
            unassigned.append(course_type)

        new_plan = new_four_year_plan(name=name, major=major, unassigned=unassigned,
                                      elective_reqs=elective_reqs)
        return self.db.insert_one("FourYearPlans", asdict(new_plan))

    def check_pre_reqs(self, course_id: str, plan: dict, place_in: str):
        """
        Check if the prerequisites for a course are met in a four-year plan.
        :param course_id: The course_id to check.
        :param plan: The four-year plan to check.
        :param place_in: The semester the course is being placed in.
        :return: True if prerequisites are met, else False.
        """
        if place_in == "Unassigned":
            return True
        # course = self.course_service.get_course(uqid=course_id)
        # assert course
        #
        # prereqs = course["prereqs"]
        # assert prereqs
        course = {"prereqs": []}
        prereqs = course["prereqs"]

        for semester in ["year_1_sem_1", "year_1_sem_2", "year_2_sem_1", "year_2_sem_2",
                         "year_3_sem_1", "year_3_sem_2", "year_4_sem_1", "year_4_sem_2"]:
            if semester == place_in or len(prereqs) == 0:
                break
            sem_courses = plan[semester]
            # If sem_course is an elective, replace it with actual course
            for sem_course in sem_courses:
                if sem_course in plan["elective_reqs"]:
                    sem_courses[sem_courses.index(sem_course)] = plan["elective_reqs"][sem_course]
            # If course covers a prereq, remove prereq from list
            for sem_course in sem_courses:
                for prereq in prereqs:
                    if sem_course in prereq:
                        prereqs.remove(prereq)

        return len(prereqs) == 0

    def find_position(self, plan: dict, course: str):
        """
        Find the current position of a course in a four-year plan.
        :param plan: The four-year plan to search.
        :param course: The course to find.
        :return: The semester the course is in, else None.
        """
        for semester in ["year_1_sem_1", "year_1_sem_2", "year_2_sem_1", "year_2_sem_2",
                         "year_3_sem_1", "year_3_sem_2", "year_4_sem_1", "year_4_sem_2"]:
            if course in plan[semester]:
                return semester
        return None

    def update_four_year_plan(self, uqid: str, course: str, move_to: str):
        """
        Update a four-year plan by moving a course between semesters.
        :param uqid: The unique identifier of the four-year plan.
        :param course: The course to move.
        :param move_to: The semester to move the course to.
        :return: The number of modified documents.
        """
        plan = self.get_four_year_plan(uqid)
        move_from = self.find_position(plan, course)

        assert plan is not None, "Four-year plan not found"
        major = self.major_service.get_major_by_name(plan["Major"])
        assert major is not None, "Major not found"

        # if course is not a course_id (ie. it's a category, like Elective)
        if course in list(plan["elective_reqs"].keys()):
            # If there is no selected inner course, update database and return
            course_id = plan["elective_reqs"][course]
        else:
            course_id = course
        if not course_id:
            # Prepare the query to remove from move_from and add to move_to
            query = {
                "uqid": uqid,
                f"{move_from}": {"$in": [course]}
            }

            update = {
                "$pull": {f"{move_from}": course},
                "$push": {f"{move_to}=": course}
            }

            # Execute the update
            result = self.db.update_one("FourYearPlans", query, update)
            return result.modified_count # Maybe return something else? I think we should return the updated plan

        # If course_id cannot be placed there due to pre-reqs, return an error
        if not self.check_pre_reqs(course_id, plan, move_to):
            return Exception("pre-reqs not met")

        # If there are too many courses, return an error (implement later)
        if plan[move_to] and len(plan[move_to]) >= 5:
            return Exception("too many courses")

        # Prepare the query to remove from move_from and add to move_to
        query = {
            "uqid": uqid,
            f"{move_from}": {"$in": [course]}
        }

        # Corrected update dictionary (removed the "=" from f"{move_to}=")
        update = {
            "$pull": {f"{move_from}": course},
            "$push": {f"{move_to}": course}  # Removed the unnecessary '='
        }

        # Execute the update
        collection = self.db["FourYearPlans"]  # Access the collection
        result = collection.update_one(query, update)  # Call update_one on the collection
        return result.modified_count  # Maybe return something else? I think we should return the updated plan

    def auto_complete_plan(self, id):
        pass

    def check_requirements(self, id):
        """
        Check if the requirements for a four-year plan are met.
        :param id:
        :return:
        """
        hours = 120
        d1 = 3
        d2 = 3
        d3 = 3
        plan = self.get_four_year_plan(uqid=id)

        for semester in ["year_1_sem_1", "year_1_sem_2", "year_2_sem_1", "year_2_sem_2",
                         "year_3_sem_1", "year_3_sem_2", "year_4_sem_1", "year_4_sem_2"]:
            for course_id in semester:
                if course_id in plan["elective_reqs"]:
                    course_id = plan["elective_reqs"][course_id]
                if not course_id:
                    continue

