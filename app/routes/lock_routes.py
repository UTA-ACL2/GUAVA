from flask import Blueprint, jsonify, request, session
import time
import os
import subprocess
import json

lock_bp = Blueprint("lock_routes", __name__)  # 创建 Blueprint

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))  # `app/` 目录
LOCK_FILE = os.path.join(BASE_DIR, 'locks.json')  # 锁文件路径


# 初始化 session_id（确保每个会话唯一）
def ensure_session_id():
    if 'session_id' not in session:
        import uuid
        session['session_id'] = str(uuid.uuid4())


# 读取锁
def load_locks():
    if not os.path.exists(LOCK_FILE):
        return {}
    with open(LOCK_FILE, 'r') as f:
        return json.load(f)


# 保存锁
def save_locks(locks):
    with open(LOCK_FILE, 'w') as f:
        json.dump(locks, f)


# 加锁逻辑
def lock_file(username, filename):
    ensure_session_id()
    locks = load_locks()
    user_locks = locks.get(username, {})
    if filename in user_locks:
        if user_locks[filename] == session['session_id']:
            return True  # 自己已锁
        return False     # 被别人锁了
    user_locks[filename] = session['session_id']
    locks[username] = user_locks
    save_locks(locks)
    return True


# 解锁逻辑
def unlock_file(username, filename):
    ensure_session_id()
    locks = load_locks()
    user_locks = locks.get(username, {})
    if filename in user_locks and user_locks[filename] == session['session_id']:
        del user_locks[filename]
        locks[username] = user_locks
        save_locks(locks)
        return True
    return False


@lock_bp.route('/lock_file', methods=['POST'])
def lock_file_api():
    data = request.json
    username = data.get('username')
    filename = data.get('filename')
    success = lock_file(username, filename)
    return jsonify({'success': success, 'message': "Locked successfully" if success else "File is locked by another user"})


@lock_bp.route('/unlock_file', methods=['POST'])
def unlock_file_api():
    data = request.json
    username = data.get('username')
    filename = data.get('filename')
    success = unlock_file(username, filename)
    return jsonify({'success': success, 'message': "Unlocked" if success else "Unlock failed (not owner or not locked)"})

