from flask import Flask, jsonify, request
from flask_cors import CORS
from bson import ObjectId  # Import ObjectId

app = Flask(__name__)

# Update CORS configuration to allow credentials and your frontend origin
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "http://localhost:3001", "methods": ["POST", "OPTIONS"]}})

from pymongo import MongoClient

MONGO_URI = "mongodb+srv://sammy:HoustonRice@owltrack.sl1wi.mongodb.net/OwlTrack?retryWrites=true&w=majority"
client = MongoClient(MONGO_URI)
db = client["OwlTrack"]

# @app.route('/', methods=['GET', 'POST'])
# def get_hello():
#     collections = db.list_collection_names()
#     return jsonify({'message': collections})

@app.route('/api/update_four_year_plan', methods=['POST'])
def update_four_year_plan():
    data = request.json
    plan_id = data.get("plan_id")
    semester = data.get("semester")
    course_data = data.get("course_data")

    if not plan_id or not semester or not course_data:
        return jsonify({'error': 'Missing required data'}), 400

    # Convert the string plan_id to an ObjectId
    try:
        plan_id = ObjectId(plan_id)
    except Exception as e:
        return jsonify({'error': 'Invalid plan_id format'}), 400

    # Update the specific field in the FourYearPlans collection
    result = db.FourYearPlans.update_one(
        {"_id": plan_id},  # Use ObjectId instead of string
        {"$push": {semester: course_data}}
    )

    if result.matched_count == 0:
        return jsonify({'error': 'Plan not found'}), 404

    return jsonify({'message': 'Plan updated successfully'}), 200


if __name__ == "__main__":
    app.run(debug=True)
