from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from TranscriptParser import extract_courses_from_pdf
from bson import ObjectId
import json

from pages.MongoDB.mongodb import MongoDB
from pages.Services.initialize_services import initialize_services


app = Flask(__name__)
CORS(app, supports_credentials=True,
     resources={r"/*": {"origins": "http://localhost:3000", "methods": ["POST", "OPTIONS"]}})
UPLOAD_FOLDER = 'tmp'
ALLOWED_EXTENSIONS = {'pdf'}

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


@app.route('/api/update_four_year_plan', methods=['POST'])
def update_four_year_plan():
    data = request.json
    plan_id = data.get("plan_id", None)
    move_to = data.get("semester", None)
    course_data = data.get("course_data", None)

    if not plan_id or not move_to or not course_data:
        return jsonify({'error': 'Missing required data'}), 400

    try:
        plan_id = ObjectId(plan_id)
    except Exception as e:
        return jsonify({'error': 'Invalid plan_id format'}), 400

    result = four_year_plan_service.update_four_year_plan(uqid=plan_id, course=course_data, move_to=move_to)

    if result.matched_count == 0:
        return jsonify({'error': 'Plan not found'}), 404

    return jsonify({'message': 'Plan updated successfully'}), 200


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

    user = {
        '_id': clerk_id,
        'username': username,
        'standing': standing,
        'courses': courses,
        'major': major
    }

    try:
        result = mongodb.insert_one("Users", user)
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