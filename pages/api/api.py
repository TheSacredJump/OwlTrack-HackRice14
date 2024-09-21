from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from TranscriptParser import extract_courses_from_pdf
from pymongo import MongoClient
from bson import ObjectId  # Import ObjectId
import json
from pages.Services.initialize_services import initialize_services

MONGO_URI = "mongodb+srv://sammy:HoustonRice@owltrack.sl1wi.mongodb.net/OwlTrack?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client["OwlTrack"]
app = Flask(__name__)
CORS(app)  # This will allow all origins

UPLOAD_FOLDER = 'tmp'
ALLOWED_EXTENSIONS = {'pdf'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16 MB limit

# Initialize services
course_service, four_year_plan_service, major_service = initialize_services(mongo_db=db)


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

@app.route('/api/update_four_year_plan', methods=['POST'])
def update_four_year_plan():
    data = request.json
    plan_id = data.get("plan_id", None)
    move_to = data.get("semester", None)
    course_data = data.get("course_data", None)

    if not plan_id or not move_to or not course_data:
        return jsonify({'error': 'Missing required data'}), 400

    # Convert the string plan_id to an ObjectId
    try:
        plan_id = ObjectId(plan_id)
    except Exception as e:
        return jsonify({'error': 'Invalid plan_id format'}), 400

    # # Update the specific field in the FourYearPlans collection
    # result = db.FourYearPlans.update_one(
    #     {"_id": plan_id},  # Use ObjectId instead of string
    #     {"$push": {semester: course_data}}
    # )

    result = four_year_plan_service.update_four_year_plan(plan_id=plan_id, course=course_data, move_to=move_to)

    if result.matched_count == 0:
        return jsonify({'error': 'Plan not found'}), 404

    return jsonify({'message': 'Plan updated successfully'}), 200


@app.route("/api/create-user", methods=['POST'])
def create_user():
    # Get the form data from the request
    major = request.form.get('major')
    username = request.form.get('username')
    courses = request.form.get('courses')  # This is a JSON string now
    clerk_id = request.form.get('clerkId')
    standing = request.form.get('standing')

    if not major or not username or not courses or not clerk_id or not standing:
        return jsonify({'message': 'Missing required fields'}), 400

    # Parse courses back into a list of objects
    try:
        courses = json.loads(courses)
    except json.JSONDecodeError:
        return jsonify({'message': 'Invalid courses data'}), 400

    # Create a new user document
    collection = db["Users"]

    user = {
        '_id': clerk_id,  # Use clerk_id as the _id
        'username': username,
        'standing': standing,
        'courses': courses,  # Store courses as an array of objects
        'major': major
    }

    try:
        # Insert the new user into the MongoDB Users collection
        result = collection.insert_one(user)
        return jsonify({'message': 'User created successfully'}), 201
    except Exception as e:
        return jsonify({'message': 'User creation failed', 'error': str(e)}), 400

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


if __name__ == '__main__':
    app.run(debug=True)