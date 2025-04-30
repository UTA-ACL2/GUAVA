import re
import shutil
from flask import Blueprint, request, session, redirect, url_for, render_template, flash, jsonify
import os
from app.config import URL_PREFIX

upload_bp = Blueprint('upload', __name__)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))  # 获取 app 目录
UPLOAD_FOLDER = os.path.join(BASE_DIR, "static", "videos", "pool")  # 存储上传的视频
ALLOWED_EXTENSIONS = {'mp4', 'wav', 'mp3'}  # 允许的文件格式


def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def safe_filename(filename):
    name, ext = os.path.splitext(filename)
    # 替换非法字符为 `_`
    safe_name = re.sub(r'[^\w]', '_', name)
    # 合并连续的 `_` 为一个 `_`
    safe_name = re.sub(r'_+', '_', safe_name)
    # 去掉开头结尾的 `_`
    safe_name = safe_name.strip('_')
    return safe_name + ext


@upload_bp.route('/upload', methods=['POST'])
def upload_files():
    if 'username' not in session:
        flash("You must be logged in to upload files.", "error")
        return redirect(URL_PREFIX + url_for('login.login'))

    username = session['username']  # 获取当前登录用户
    user_folder = os.path.join(UPLOAD_FOLDER, username)  # 用户的 pool 目录
    annotation_folder = os.path.join(user_folder, "annotation")
    os.makedirs(annotation_folder, exist_ok=True)  # 确保目录存在

    files = request.files.getlist("audioFile")  # 获取多个文件
    uploaded_files = []

    for file in files:
        if file and allowed_file(file.filename):
            filename = safe_filename(file.filename)
            basename = os.path.splitext(filename)[0]

            # 若前端传了 override 标记为 true，清空 annotation 中对应文件夹
            override_key = f"override_{basename}"
            override = request.form.get(override_key, "false") == "true"

            video_annotation_dir = os.path.join(annotation_folder, basename)

            if override and os.path.exists(video_annotation_dir):
                shutil.rmtree(video_annotation_dir, ignore_errors=True)
                # 删除同名前缀的 .mp4 和 .wav 文件
                for ext in ['.mp4', '.wav', 'mp3']:
                    file_path = os.path.join(user_folder, f"{basename}{ext}")
                    if os.path.exists(file_path):
                        os.remove(file_path)

            os.makedirs(video_annotation_dir, exist_ok=True)
            save_path = os.path.join(user_folder, filename)
            file.save(save_path)
            uploaded_files.append(filename)

    if uploaded_files:
        flash(f"Uploaded: {', '.join(uploaded_files)}", "success")
    else:
        flash("No valid files uploaded.", "error")

    return redirect(URL_PREFIX + url_for('login.general_form'))


@upload_bp.route('/check_file_exists', methods=['GET'])
def check_file_exists():
    username = request.args.get("username")
    video_name = request.args.get("videoName")  # 不带扩展名
    # 判断该用户名目录下是否已存在同名文件(判断前缀)
    user_folder = os.path.join(UPLOAD_FOLDER, username)
    video_file_path = os.path.join(user_folder, f"{video_name}.mp4")
    audio_file_path = os.path.join(user_folder, f"{video_name}.wav")
    audio_file_path2 = os.path.join(user_folder, f"{video_name}.mp3")
    # exists = os.path.exists(video_file_path)
    exists = os.path.exists(video_file_path) or os.path.exists(audio_file_path) or os.path.exists(audio_file_path2)

    return jsonify({"exists": exists})
