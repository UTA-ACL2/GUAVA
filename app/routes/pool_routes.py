from flask import Blueprint, jsonify, request
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
    """Get the user's video/audio file list"""
    username = username.lower()
    folder = os.path.join(POOL_DIR, username)
    annotation_folder = os.path.join(folder, "annotation")  # Annotation file directory

    print(f"Username: {username}, Folder Path: {folder}")
    os.makedirs(folder, exist_ok=True)
    if not folder or not os.path.exists(folder):
        return jsonify({"error": "User not found or folder does not exist"}), 404

    allowed_extensions = {'.mp4': 'MP4', '.wav': 'WAV', '.mp3': 'MP3'}
    files_info = []
    for file_name in os.listdir(folder):
        ext = os.path.splitext(file_name)[1].lower()
        if ext in allowed_extensions:
            file_path = os.path.join(folder, file_name)
            file_stat = os.stat(file_path)

            duration = get_video_duration(file_path)
            # Check if annotation exists
            annotation_path = os.path.join(annotation_folder, file_name.rsplit('.', 1)[0], "annotations.json")
            is_annotated = os.path.exists(annotation_path)
            status = "Annotated" if is_annotated else "Not Annotated"

            files_info.append({
                "name": file_name,
                "date": time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(file_stat.st_mtime)),  # Modification time
                "type": allowed_extensions[ext],
                "size": f"{round(file_stat.st_size / 1024 / 1024, 2)} MB",  # File size (MB)
                "status": status,  # Whether annotated
                "duration": f"{duration} sec" if duration != "Unknown" else "Unknown",  # Duration
            })

    # files = [f for f in os.listdir(folder) if f.endswith('.mp4')]
    return jsonify({"username": username, "files": files_info})


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
        # Delete video/audio files
        if os.path.exists(file_path):
            os.remove(file_path)
        else:
            return jsonify(success=False, error="File not found")

        # Delete the corresponding annotation folder (if it exists)
        if os.path.isdir(annotation_folder):
            import shutil
            shutil.rmtree(annotation_folder)

        return jsonify(success=True)
    except Exception as e:
        return jsonify(success=False, error=str(e)), 500
