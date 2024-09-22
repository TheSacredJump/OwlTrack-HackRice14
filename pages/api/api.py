from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from TranscriptParser import extract_courses_from_pdf
from bson import ObjectId
import json
from pymongo import MongoClient
from pages.MongoDB.mongodb import MongoDB
from pages.Services.initialize_services import initialize_services


app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000", "allow_headers": ["Content-Type", "X-Clerk-User-Id"]}})
UPLOAD_FOLDER = 'tmp'
ALLOWED_EXTENSIONS = {'pdf'}
client = MongoClient('mongodb+srv://sammy:HoustonRice@owltrack.sl1wi.mongodb.net/OwlTrack?retryWrites=true&w=majority')
db = client["OwlTrack"]

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB limit

# Initialize MongoDB connection
MONGO_URI = "mongodb+srv://sammy:HoustonRice@owltrack.sl1wi.mongodb.net/OwlTrack?retryWrites=true&w=majority"
mongodb = MongoDB(MONGO_URI, "OwlTrack")

# Initialize services
course_service, four_year_plan_service, major_service = initialize_services(mongo_db=mongodb.db)


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@app.route('/parse-transcript', methods=['POST'])
def parse_transcript():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

        try:
            os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
            file.save(filepath)
            print(f"File saved at: {filepath}")

            courses_json = extract_courses_from_pdf(filepath)
            print("Transcript parsed successfully")

            return courses_json
        except Exception as e:
            print(f"Error processing file: {str(e)}")
            return jsonify({'error': str(e)}), 500
        finally:
            if os.path.exists(filepath):
                os.remove(filepath)
                print(f"File removed: {filepath}")

    return jsonify({'error': 'Invalid file type'}), 400


@app.route('/api/update_four_year_plan', methods=['POST', "GET"])
def update_four_year_plan():
    data = request.json
    plan_id = data.get("plan_id", None)
    move_to = data.get("semester", None)
    course_name = data.get("course_name", None)
    # course_data = data.get("course_data", None)

    if not plan_id or not move_to or not course_name:
        return jsonify({'error': 'Missing required data'}), 400

    try:
        plan_id = ObjectId(plan_id)
    except Exception as e:
        return jsonify({'error': 'Invalid plan_id format'}), 400

    result = four_year_plan_service.update_four_year_plan(uqid=plan_id, course=course_name, move_to=move_to)
    print("RESULT::", result)

    if result.matched_count == 0:
        return jsonify({'error': 'Plan not found'}), 404

    return jsonify({'message': 'Plan updated successfully'}), 200


def create_four_year_plan(transcript_courses: list, userID : str):
    """
    Returns the OID of the course plan
    [{'name': 'SCHOLARLY APPROACHES TO S&E', 'code': 'UNIV 105', 'hours': '2', 'grade': 'S', 'status': 'completed', 'semester': 'Y1S1'}, {'name': 'COMPUTATIONAL THINKING', 'code': 'COMP 140', 'hours': '4', 'grade': 'B', 'status': 'completed', 'semester': 'Y1S1'}, {'name': 'SINGLE VARIABLE CALCULUS I', 'code': 'MATH 101', 'hours': '3', 'grade': 'C+', 'status': 'completed', 'semester': 'Y1S1'}, {'name': 'INTRODUCTION TO PSYCHOLOGY', 'code': 'PSYC 101', 'hours': '3', 'grade': 'A', 'status': 'completed', 'semester': 'Y1S1'}, {'name': 'BIBLICAL ETHICS', 'code': 'RELI 120', 'hours': '3', 'grade': 'A-', 'status': 'completed', 'semester': 'Y1S1'}, {'name': 'SECOND YEAR SPANISH I', 'code': 'SPAN 263', 'hours': '3', 'grade': 'A', 'status': 'completed', 'semester': 'Y1S1'}, {'name': 'CTIS WORKSHOP', 'code': 'UNIV 194', 'hours': '0', 'grade': 'S', 'status': 'completed', 'semester': 'Y1S1'}, {'name': 'CDOD WORKSHOP', 'code': 'UNIV 195', 'hours': '0', 'grade': 'S', 'status': 'completed', 'semester': 'Y1S2'}, {'name': 'ALGORITHMIC THINKING', 'code': 'COMP 182', 'hours': '4', 'grade': 'P', 'status': 'completed', 'semester': 'Y1S2'}, {'name': 'NATURAL HISTORY OF TEXAS', 'code': 'FWIS 243', 'hours': '3', 'grade': 'A', 'status': 'completed', 'semester': 'Y1S2'}, {'name': 'SINGLE VARIABLE CALCULUS II', 'code': 'MATH 102', 'hours': '3', 'grade': 'C+', 'status': 'completed', 'semester': 'Y1S2'}, {'name': 'INTRO TO COGNITIVE PSYCHOLOGY', 'code': 'PSYC 203', 'hours': '3', 'grade': 'A+', 'status': 'completed', 'semester': 'Y1S2'}, {'name': 'SOCIAL PROBLEMS', 'code': 'SOCI 231', 'hours': '3', 'grade': 'B+', 'status': 'completed'}, {'name': 'INTRODUCTION TO PROGRAM DESIGN', 'code': 'COMP 215', 'hours': '4', 'grade': 'IP', 'status': 'in_progress', 'semester': 'Y2S1'}, {'name': 'INTRO TO COMPUTER ORGANIZATION', 'code': 'COMP 222', 'hours': '4', 'grade': 'IP', 'status': 'in_progress', 'semester': 'Y2S1'}, {'name': 'LINEAR ALGEBRA', 'code': 'MATH 355', 'hours': '3', 'grade': 'IP', 'status': 'in_progress', 'semester': 'Y2S1'}, {'name': 'STATISTICS FOR DATA SCIENCE', 'code': 'STAT 315', 'hours': '4', 'grade': 'IP', 'status': 'in_progress', 'semester': 'Y2S1'}]
    """
    default_comp_plan = {
    "_id " : "",
    "Name"  :"Four Year Plan 1",
    "Major" : "Computer Science BS",
    "Unassigned"  : ['Calculus 1', 'Calculus 2', 'Multivariable Calculus', 'Statistics', 'Linear Algebra', 'Advanced', 'Systems', 'Application Domains', 'Theory', 'Elective 1', 'Elective 2', 'COMP 140', 'COMP 182', 'COMP 215', 'COMP 222', 'COMP 301', 'COMP 312', 'COMP 318', 'COMP 321', 'COMP 382'],
    "year_1_sem_1" : [],
    "year_1_sem_2" : [],
    "year_2_sem_1" : [],
    "year_2_sem_2" : [],
    "year_3_sem_1" : [],
    "year_3_sem_2" : [],
    "year_4_sem_1" : [],
    "year_4_sem_2" : [],
    "elective_reqs"  : {'Calculus 1': None, 'Calculus 2': None, 'Multivariable Calculus': None, 'Statistics': None, 'Linear Algebra': None, 'Core' : None, 'Advanced': None, 'Systems': None, 'Application Domains': None, 'Theory': None, 'Elective 1': None, 'Elective 2': None},
    "other" : [],
    "user_id" : ""
    }
    majorCollection = db['Majors'].find({"Full-Name": "Computer Science BS"})[0]
    OFF_LIMITS = ["_id", "Full-Name"]
    oid = ObjectId()
    default_comp_plan["_id"] = oid
    default_comp_plan["user_id"] = userID
    for dataPoint in transcript_courses:
        name = dataPoint["code"]
        for key, value in majorCollection.items():
            if key not in OFF_LIMITS:
                # Meaning it is a course
                major_course = False
                if name in value["classes"] and name != "Elective":
                    # Meaning the course is found in the required classes, we will subtract one from requirements. 
                    value["reqs"] = value["reqs"] - 1
                    if key in default_comp_plan["Unassigned"] or name in default_comp_plan['Unassigned']:
                        if key in default_comp_plan["Unassigned"]:
                            default_comp_plan["Unassigned"].remove(key)
                        else:
                            default_comp_plan["Unassigned"].remove(name)
                        # print("Removed ", key, "from ", four_year_plan["Unassigned"])
                    default_comp_plan["elective_reqs"][key] = name
                    major_course = True
                # This will append to the arrays regardless if the course is a requirement or not. 
                if (key == "Elective" and major_course == False and name in value["classes"]):
                    # Meaning we are looking in the electives, and the name is present in the classes of electives
                    if default_comp_plan["elective_reqs"]["Elective 1"] == None:
                        default_comp_plan["elective_reqs"]["Elective 1"] = name
                    else:
                        default_comp_plan["elective_reqs"]['Elective 2'] = name                
                semester = dataPoint["semester"]
                semester_key = "year_" + semester[1] + "_sem_" + semester[3]
                if name not in default_comp_plan[semester_key]:
                    default_comp_plan[semester_key].append(name)
    FourYearPlans = db["FourYearPlans"]
    FourYearPlans.insert_one(default_comp_plan)
    return default_comp_plan

@app.route("/api/create-user", methods=['POST'])
def create_user():
    major = request.form.get('major')
    username = request.form.get('username')
    courses = request.form.get('courses')
    clerk_id = request.form.get('clerkId')
    standing = request.form.get('standing')

    if not major or not username or not courses or not clerk_id or not standing:
        return jsonify({'message': 'Missing required fields'}), 400

    try:
        courses = json.loads(courses)
    except json.JSONDecodeError:
        return jsonify({'message': 'Invalid courses data'}), 400
    
    default_plan = create_four_year_plan(courses, clerk_id)
    user = {
        '_id': clerk_id,
        'username': username,
        'standing': standing,
        'courses': courses,
        'major': major,
        'default_plan' : default_plan
    }
    print(courses)
    # Now we have to make the users 4 year plan. 
    try:
        result = mongodb.insert_one("Users", user)
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'User creation failed', 'error': str(e)}), 400

@app.route("/api/grab-schedule", methods=["GET"])
def get_schedule():
    # Connect to the "FourYearPlans" collection
    collection = db['FourYearPlans']
    clerkID = request.args.get("clerkID", None)  # Use request.args to access query parameters
    print(clerkID)
    try:
        first_schedule = collection.find_one({"user_id": clerkID})
        if first_schedule:
            first_schedule['_id'] = str(first_schedule['_id'])
            return jsonify(first_schedule), 200  # Return the document as a JSON response
        else:
            return jsonify({"error": "No schedule found for the specified user"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/api/get-user-courses', methods=['GET'])
def get_user_courses():
    clerk_id = request.headers.get('X-Clerk-User-Id')
    if not clerk_id:
        return jsonify({'error': 'Unauthorized'}), 401
    try:
        collection = db["Users"]
        user = collection.find_one({"_id": clerk_id})

        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({
            'courses': user.get('courses', []),
            'major': user.get('major', ''),
            'standing': user.get('standing', '')
        }), 200
    except Exception as e:
        return jsonify({'error': f'Error fetching user courses: {str(e)}'}), 500


@app.route('/api/get-all-courses', methods=['GET', 'POST'])
def get_all_courses():
    data = request.json
    plan_id = data.get("plan_id", None)
    try:
        courses = course_service.get_all_courses(plan_id=plan_id)
        return jsonify(courses), 200
    except Exception as e:
        return jsonify({'error': f'Error fetching courses: {str(e)}'}), 500

@app.route('/api/get-course', methods=['GET', 'POST'])
def get_all_courses():
    data = request.json
    course_id = data.get("course_id", None)
    try:
        courses = course_service.get_course(uqid=course_id)
        return jsonify(courses), 200
    except Exception as e:
        return jsonify({'error': f'Error fetching courses: {str(e)}'}), 500


if __name__ == '__main__':
    app.run(debug=True)