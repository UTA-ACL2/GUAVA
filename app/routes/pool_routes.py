from flask import Blueprint, jsonify, request
import time
import os
import subprocess
import json

pool_bp = Blueprint("pool_routes", __name__)  # 创建 Blueprint


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))  # `app/` 目录
POOL_DIR = os.path.join(BASE_DIR, "static", "videos", "pool")


def get_video_duration(file_path):
    """使用 ffprobe 获取视频时长"""
    try:
        result = subprocess.run(
            ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "format=duration", "-of", "json", file_path],
            stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True
        )
        duration_data = json.loads(result.stdout)  # 解析 JSON 输出
        duration = float(duration_data["format"]["duration"])
        return round(duration, 2)  # 保留两位小数
    except Exception as e:
        print(f"Error getting duration for {file_path}: {e}")
        return "Unknown"  # 发生错误时返回 "Unknown"


@pool_bp.route('/<username>/files', methods=['GET'])
def get_user_files(username):
    """获取用户的video/audio文件列表"""
    username = username.lower()
    folder = os.path.join(POOL_DIR, username)
    annotation_folder = os.path.join(folder, "annotation")  # 标注文件目录

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
            # 判断是否有标注
            annotation_path = os.path.join(annotation_folder, file_name.rsplit('.', 1)[0], "annotations.json")
            is_annotated = os.path.exists(annotation_path)
            status = "Annotated" if is_annotated else "Not Annotated"

            files_info.append({
                "name": file_name,
                "date": time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(file_stat.st_mtime)),  # 修改时间
                "type": allowed_extensions[ext],
                "size": f"{round(file_stat.st_size / 1024 / 1024, 2)} MB",  # 文件大小（MB）
                "status": status,  # 是否已标注
                "duration": f"{duration} sec" if duration != "Unknown" else "Unknown",  # 时长
            })

    # files = [f for f in os.listdir(folder) if f.endswith('.mp4')]
    return jsonify({"username": username, "files": files_info})
