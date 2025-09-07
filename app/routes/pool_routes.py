from flask import Blueprint, jsonify, request, send_file, Response
import time
import os
import subprocess
import json

pool_bp = Blueprint("pool_routes", __name__)  # Create Blueprint


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))  # Get the 'app/' directory
POOL_DIR = os.path.join(BASE_DIR, "static", "videos", "pool")


def get_video_duration(file_path):
    """Use `ffprobe` to get the video duration"""
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "format=duration", "-of", "json", file_path],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )
        duration_data = json.loads(result.stdout)  # Parse the JSON output
        duration = float(duration_data["format"]["duration"])
        return round(duration, 2)  # Keep two decimal places
    except Exception as e:
        print(f"Error getting duration for {file_path}: {e}")
        return "Unknown"  # Return "Unknown" when an error occurs


@pool_bp.route('/<username>/files', methods=['GET'])
def get_user_files(username):
    """Get the user's video/audio file list with pagination"""
    username = username.lower()
    folder = os.path.join(POOL_DIR, username)
    annotation_folder = os.path.join(folder, "annotation")

    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    os.makedirs(folder, exist_ok=True)
    if not os.path.exists(folder):
        return jsonify({"error": "User not found or folder does not exist"}), 404

    allowed_extensions = {'.mp4': 'MP4', '.wav': 'WAV', '.mp3': 'MP3'}
    files_info = []
    
    all_files = os.listdir(folder)
    media_files = [f for f in all_files if os.path.splitext(f)[1].lower() in allowed_extensions]
    
    total_files = len(media_files)
    total_pages = (total_files + per_page - 1) // per_page
    
    start = (page - 1) * per_page
    end = start + per_page
    
    paginated_files = media_files[start:end]

    for file_name in paginated_files:
        ext = os.path.splitext(file_name)[1].lower()
        file_path = os.path.join(folder, file_name)
        file_stat = os.stat(file_path)

        duration = get_video_duration(file_path)
        annotation_path = os.path.join(annotation_folder, os.path.splitext(file_name)[0], "annotations.json")
        is_annotated = os.path.exists(annotation_path)
        status = "Annotated" if is_annotated else "Not Annotated"

        files_info.append({
            "name": file_name,
            "date": time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(file_stat.st_mtime)),
            "type": allowed_extensions[ext],
            "size": f"{round(file_stat.st_size / 1024 / 1024, 2)} MB",
            "status": status,
            "duration": f"{duration} sec" if duration != "Unknown" else "Unknown",
        })

    return jsonify({
        "username": username,
        "files": files_info,
        "total_files": total_files,
        "total_pages": total_pages,
        "current_page": page
    })


@pool_bp.route('/delete_file', methods=['DELETE'])
def delete_user_file():
    """Delete the specified user's audio and video files and their corresponding annotation folders"""
    username = request.args.get("username")
    filename = request.args.get("filename")

    if not username or not filename:
        return jsonify(success=False, error="Missing username or filename"), 400

    user_folder = os.path.join(POOL_DIR, username)
    file_path = os.path.join(user_folder, filename)
    annotation_folder = os.path.join(user_folder, "annotation", os.path.splitext(filename)[0])

    try:
        if os.path.exists(file_path):
            os.remove(file_path)
        else:
            return jsonify(success=False, error="File not found")

        if os.path.isdir(annotation_folder):
            import shutil
            shutil.rmtree(annotation_folder)

        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, error=str(e)), 500


@pool_bp.route('/export_all_annotations', methods=['GET'])
def export_all_annotations():
    """Export all annotations for a user into a single JSON file."""
    username = request.args.get("username")
    if not username:
        return jsonify({"error": "Missing username"}), 400

    user_annotation_dir = os.path.join(POOL_DIR, username, "annotation")
    if not os.path.exists(user_annotation_dir):
        return jsonify({"error": "No annotations found for this user"}), 404

    all_annotations = {}
    for video_name in os.listdir(user_annotation_dir):
        annotation_file_path = os.path.join(user_annotation_dir, video_name, "annotations.json")
        if os.path.exists(annotation_file_path):
            try:
                with open(annotation_file_path, 'r', encoding='utf-8') as f:
                    annotations = json.load(f)
                    all_annotations[video_name] = annotations
            except Exception as e:
                print(f"Error reading annotation file {annotation_file_path}: {e}")
                continue

    if not all_annotations:
        return jsonify({"error": "No annotations found to export"}), 404

    json_data = json.dumps(all_annotations, indent=4)
    response = Response(json_data, mimetype="application/json")
    response.headers["Content-Disposition"] = f"attachment; filename={username}_all_annotations.json"
    return response