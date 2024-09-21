from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from TranscriptParser import extract_courses_from_pdf
from pymongo import MongoClient
from bson import ObjectId  # Import ObjectId

from pages.Services.initialize_services import initialize_services

MONGO_URI = "mongodb+srv://sammy:HoustonRice@owltrack.sl1wi.mongodb.net/OwlTrack?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client["OwlTrack"]
app = Flask(__name__)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3001", "methods": ["POST", "OPTIONS"]}})


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

if __name__ == '__main__':
    app.run(debug=True)