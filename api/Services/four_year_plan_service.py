# four_year_plan_service.py
from dataclasses import asdict

from api.Objects.four_year_plan import new_four_year_plan


class FourYearPlanService:
    def __init__(self, db, major_service):
        """
        Initialize the FourYearPlanService with a database connection.
        :param db: Instance of MongoDB.
        """
        self.db = db
        self.major_service = major_service

    def get_four_year_plan(self, uqid: str):
        """
        Retrieve a four-year plan by its unique identifier (uqid).
        :param uqid: The unique identifier of the four-year plan.
        :return: The four-year plan document if found, else None.
        """
        query = {"uqid": uqid}
        resp = self.db.find("FourYearPlans", query)
        if not resp:
            return None
        return resp[0]

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

    def check_pre_reqs(self, course: str, plan: dict, semester: str):
        """
        Check if the prerequisites for a course are met in a four-year plan.
        :param course: The course to check.
        :param plan: The four-year plan to check.
        :param semester: The semester the course is being placed in.
        :return: True if prerequisites are met, else False.
        """
        pass

    def update_four_year_plan(self, uqid: str, course: str, move_to: str, move_from: str = None):
        """
        Update a four-year plan by moving a course between semesters.
        :param uqid: The unique identifier of the four-year plan.
        :param course: The course to move.
        :param move_to: The semester to move the course to.
        :param move_from: The semester to move the course from.
        :return: The number of modified documents.
        """
        plan = self.get_four_year_plan(uqid)
        assert plan is not None, "Four-year plan not found"
        major = self.major_service.get_major_by_name(plan["Major"])
        assert major is not None, "Major not found"

        # if course is not a course_id (ie. it's a category, like Elective)
        is_course_id = ''.join(filter(str.isdigit, course))
        if not is_course_id:
            # If there is no selected inner course, update database and return
            course_id = plan["elective_reqs"][course]
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
                return -1

            # If there are too many courses, return an error (implement later)

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
            return result.modified_count  # Maybe return something else? I think we should return the updated plan

    def auto_complete_plan(self, id):
        pass

    def check_requirements(self, id):
        """
        Check if the requirements for a four-year plan are met.
        :param id: 
        :return:
        """
        pass