from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_pymongo import PyMongo
from datetime import datetime
from bson.objectid import ObjectId
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 
app.config["MONGO_URI"] = "mongodb://localhost:27017/diary_app"
app.config["JWT_SECRET_KEY"] = "lmao"

mongo = PyMongo(app)
bcrypt = Bcrypt(app)
jwt = JWTManager(app)

# User registration
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = bcrypt.generate_password_hash(data.get("password")).decode("utf-8")
    
    if mongo.db.users.find_one({"username": username}):
        return jsonify({"message": "User already exists"}), 400
    
    mongo.db.users.insert_one({"username": username, "password": password})
    return jsonify({"message": "User registered successfully"}), 201

# User login
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = mongo.db.users.find_one({"username": data.get("username")})
    
    if user and bcrypt.check_password_hash(user["password"], data.get("password")):
        access_token = create_access_token(identity=user["username"])
        return jsonify({"token": access_token})
    return jsonify({"message": "Invalid credentials"}), 401

# Create a diary entry
@app.route("/diary", methods=["POST"])
@jwt_required()
def create_diary():
    data = request.json
    user = get_jwt_identity()
    user_data = mongo.db.users.find_one({"username": user})
    
    diary_entry = {
        "title": data.get("title"),
        "body": data.get("body"),
        "user_id": user_data["_id"],
        "created_at": datetime.utcnow()
    }
    
    mongo.db.diary.insert_one(diary_entry)
    return jsonify({"message": "Diary entry created"}), 201

# Get all diary entries of logged-in user
@app.route("/diary", methods=["GET"])
@jwt_required()
def get_diaries():
    user = get_jwt_identity()
    user_data = mongo.db.users.find_one({"username": user})

    if not user_data:
        return jsonify({"error": "User not found"}), 404

    diaries = list(mongo.db.diary.find({"user_id": user_data["_id"]}))

    if not diaries:
        return jsonify([])  # ✅ Return empty list instead of `{}`

    for diary in diaries:
        diary["_id"] = str(diary["_id"])  # Convert ObjectId to string

    return jsonify(diaries)



# Edit a diary entry
@app.route("/diary/<id>", methods=["PUT"])
@jwt_required()
def edit_diary(id):
    data = request.json
    user = get_jwt_identity()
    user_data = mongo.db.users.find_one({"username": user})

    diary = mongo.db.diary.find_one({"_id": ObjectId(id), "user_id": user_data["_id"]})
    if not diary:
        return jsonify({"message": "Entry not found or unauthorized"}), 404

    updated_entry = {
        "$set": {
            "title": data.get("title"),
            "body": data.get("body"),
            "updated_at": datetime.utcnow(),
        }
    }

    mongo.db.diary.update_one({"_id": ObjectId(id)}, updated_entry)
    return jsonify({"message": "Diary entry updated"})


# Delete a diary entry
@app.route("/diary/<id>", methods=["DELETE"])
@jwt_required()
def delete_diary(id):
    user = get_jwt_identity()
    user_data = mongo.db.users.find_one({"username": user})
    
    result = mongo.db.diary.delete_one({"_id": ObjectId(id), "user_id": user_data["_id"]})
    
    if result.deleted_count:
        return jsonify({"message": "Diary entry deleted"})
    return jsonify({"message": "Entry not found or unauthorized"}), 404

# Run the app
if __name__ == "__main__":
    app.run(debug=True)
