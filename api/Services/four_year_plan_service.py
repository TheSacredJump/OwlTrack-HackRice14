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

        if ''.join(filter(str.isdigit, course)):




        query = {"courses.course_id": course_id}  # Find the plan containing this course
        update = {
            "$pull": {f"courses.$[elem].{move_from}": {"course_id": course_id}},  # Remove from original semester
            "$push": {f"courses.$[elem].{move_to}": {"course_id": course_id}}  # Add to new semester
        }
        array_filters = [{"elem.course_id": course_id}]
        return self.db.update_one("FourYearPlans", query, update, array_filters=array_filters)

    def auto_complete_plan(self, id):
        pass

    def check_requirements(self, id):
        pass