import os
import json
from flask import Blueprint, request, jsonify

annotation_bp = Blueprint("annotation", __name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))  # 获取 app 目录


@annotation_bp.route("/save_annotation", methods=["POST"])
def save_annotation():
    """接收前端自动保存的 JSON 并存储到服务器"""
    try:
        data = request.get_json(force=True)  # ✅ 更稳健，兼容 navigator.sendBeacon
    except Exception as e:
        print("Failed to parse JSON:", e)
        return jsonify({"success": False, "message": "Invalid JSON"}), 400

    if not data or "username" not in data or "videoName" not in data or "annotations" not in data:
        return jsonify({"success": False, "message": "Missing required fields"}), 400

    username = data["username"]
    video_name = data["videoName"]
    annotation = data["annotations"]

    annotation_folder = os.path.join(BASE_DIR, "static", "videos", "pool", username, "annotation", video_name)

    # annotation_folder = f"app/static/videos/pool/{username}/annotation/{video_name}"
    # print("Received data:", data)
    # print("Creating directory:", annotation_folder)
    os.makedirs(annotation_folder, exist_ok=True)  # 创建目录

    json_path = os.path.join(annotation_folder, "annotations.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(annotation, f, indent=4)

    return jsonify({"success": True, "message": "Annotation saved successfully."})


@annotation_bp.route("/load_annotation", methods=["GET"])
def load_annotation():
    """加载已保存的 JSON 标注信息"""
    username = request.args.get("username")
    video_name = request.args.get("videoName")

    if not username or not video_name:
        return jsonify({"success": False, "message": "Missing parameters"}), 400

    json_path = os.path.join(BASE_DIR, "static", "videos", "pool", username, "annotation", video_name, "annotations.json")

    if not os.path.exists(json_path):
        return jsonify({"success": False, "message": "No annotation found."})

    with open(json_path, "r", encoding="utf-8") as f:
        annotation_data = json.load(f)

    return jsonify({"success": True, "annotations": annotation_data})
