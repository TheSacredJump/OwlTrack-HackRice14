# main.py
from api.MongoDB.mongodb import MongoDB
from api.Services.course_service import CourseService
from api.Services.four_year_plan_service import FourYearPlanService


def initialize_services():
    """Initialize the MongoDB connection and services."""
    # MongoDB connection string and database name
    uri = "mongodb+srv://sammy:HoustonRice@owltrack.sl1wi.mongodb.net/?retryWrites=true&w=majority&appName=OwlTrack"
    db_name = "OwlTrack"


    # Initialize MongoDB instance
    mongo_db = MongoDB(uri, db_name)

    # Initialize services
    course_service = CourseService(mongo_db)
    four_year_plan_service = FourYearPlanService(mongo_db)

    return course_service, four_year_plan_service, mongo_db

def main():
    """Main function to initialize services and perform operations."""
    # Initialize services
    course_service, four_year_plan_service, mongo_db = initialize_services()

    # Close the MongoDB connection
    mongo_db.close()

if __name__ == "__main__":
    main()