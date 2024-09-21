from pages.Services.course_service import CourseService
from pages.Services.four_year_plan_service import FourYearPlanService
from pages.Services.major_service import MajorService


def initialize_services(mongo_db):
    # Initialize services
    course_service = CourseService(mongo_db)
    major_service = MajorService(mongo_db)
    four_year_plan_service = FourYearPlanService(mongo_db, major_service)

    return course_service, four_year_plan_service, major_service
