from flask import Blueprint, jsonify, request, session
import os
import json

category_bp = Blueprint("custom_categories", __name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))  # 获取 app 目录


@category_bp.route("/save_custom_category", methods=["POST"])
def save_custom_category():
    """保存新的类别"""
    data = request.json
    username = data["username"]
    category = data["category"]
    options = data["options"]

    custom_path = os.path.join(BASE_DIR, "static", "videos", "pool", username, "custom_categories.json")

    # 读取已有的类别信息
    if os.path.exists(custom_path):
        with open(custom_path, "r", encoding="utf-8") as f:
            categories = json.load(f)
    else:
        categories = []

    # 添加新的 Category
    if not any(cat["category"] == category for cat in categories):
        new_category = {"category": category, "options": options}
        categories.append(new_category)

    # 保存到 JSON
    with open(custom_path, "w", encoding="utf-8") as f:
        json.dump(categories, f, indent=4)

    return jsonify({"success": True, "message": "Category saved!"})


@category_bp.route("/load_custom_categories", methods=["GET"])
def load_custom_categories():
    """加载用户已保存的 Categories"""
    username = request.args.get("username")
    custom_path = os.path.join(BASE_DIR, "static", "videos", "pool", username, "custom_categories.json")

    if os.path.exists(custom_path):
        with open(custom_path, "r", encoding="utf-8") as f:
            categories = json.load(f)
    else:
        categories = []

    return jsonify({"success": True, "categories": categories})


@category_bp.route("/delete_custom_category", methods=["POST"])
def delete_custom_category():
    """删除指定的 category"""
    data = request.json
    username = session['username']
    # username = data.get("username")
    category_to_delete = data.get("category")

    if not username or not category_to_delete:
        return jsonify({"status": "error", "message": "Missing username or category"}), 400

    custom_path = os.path.join(BASE_DIR, "static", "videos", "pool", username, "custom_categories.json")

    # 检查 json 是否存在
    if not os.path.exists(custom_path):
        return jsonify({"status": "error", "message": "custom_categories.json not found"}), 404

    # 读取 json
    with open(custom_path, "r", encoding="utf-8") as f:
        categories = json.load(f)

    # 删除对应 category
    new_categories = [c for c in categories if c.get("category") != category_to_delete]

    # 覆盖写入
    with open(custom_path, "w", encoding="utf-8") as f:
        json.dump(new_categories, f, indent=4, ensure_ascii=False)

    return jsonify({"status": "success"})

