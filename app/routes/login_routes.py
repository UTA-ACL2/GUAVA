from flask import Blueprint, request, session, redirect, url_for, render_template
from werkzeug.security import generate_password_hash, check_password_hash
import json
import os
from app.config import URL_PREFIX

login_bp = Blueprint('login', __name__)

VALID_ACCOUNTS = ["peter", "kenny", "theron", "essam", "tuan", "hridayesh", "birds", "cats", "corvids", "guest", "pranjal"]
# USER_FILE = 'users.json'

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))  # `app/` 目录
USER_FILE = os.path.join(BASE_DIR, 'users.json')  # 用户密码文件路径


def load_users():
    if not os.path.exists(USER_FILE):
        return {}
    with open(USER_FILE, 'r') as f:
        return json.load(f)


def save_users(users):
    with open(USER_FILE, 'w') as f:
        json.dump(users, f)


@login_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get("username").strip().lower()
        password = request.form.get("password").strip()

        if username not in VALID_ACCOUNTS:
            return render_template('login.html', error="Invalid username")

        users = load_users()

        if username not in users:
            #  第一次登录 → 保存密码
            users[username] = generate_password_hash(password)
            save_users(users)
            session['username'] = username
            return render_template('general_form.html', username=session['username'], message=f"First login. Password set successfully. Please remember it!")

            #  以后登录 → 验证密码
        if check_password_hash(users[username], password):
            session['username'] = username
            return render_template('general_form.html', username=session['username'])
        else:
            return render_template('login.html', error="Incorrect password")

    return render_template('login.html')


# 退出登录
@login_bp.route('/logout')
def logout():
    session.pop('username', None)  # 清除 session
    return redirect(URL_PREFIX + url_for('login.login'))  # 退出后回到登录页


@login_bp.route('/general_form')
def general_form():
    # 确保只有已登录的用户能访问
    if 'username' not in session:
        return redirect(URL_PREFIX + url_for('login.login'))  # 未登录用户跳转到 /login

    return render_template('general_form.html', username=session['username'])  # 传递用户名到模板
