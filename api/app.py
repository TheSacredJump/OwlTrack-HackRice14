# main.py
import atexit

from api.MongoDB.mongodb import MongoDB
from pages.Services.course_service import CourseService
from pages.Services.four_year_plan_service import FourYearPlanService
from pages.Services.major_service import MajorService


def initialize_services():
    """Initialize the MongoDB connection and services."""
    # MongoDB connection string and database name
    uri = "mongodb+srv://sammy:HoustonRice@owltrack.sl1wi.mongodb.net/?retryWrites=true&w=majority&appName=OwlTrack"
    db_name = "OwlTrack"


    # Initialize MongoDB instance
    mongo_db = MongoDB(uri, db_name)

    # Register the close function to be called when the program ends
    atexit.register(mongo_db.close)

    # Initialize services
    course_service = CourseService(mongo_db)
    major_service = MajorService(mongo_db)
    four_year_plan_service = FourYearPlanService(mongo_db, major_service)


    return course_service, four_year_plan_service, major_service, mongo_db

def main():
    """Main function to initialize services and perform operations."""
    # Initialize services
    course_service, four_year_plan_service, major_service, mongo_db = initialize_services()

if __name__ == "__main__":
    main()