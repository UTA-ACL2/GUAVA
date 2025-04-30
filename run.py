# -*- coding: utf-8 -*-
from flask import Flask, render_template, session
from app.config import URL_PREFIX
from app.routes.general_routes import general_bp
from app.routes.login_routes import login_bp
from app.routes.pool_routes import pool_bp
from app.routes.annotation_routes import annotation_bp  # 导入蓝图
from app.routes.category_routes import category_bp
from app.routes.upload_routes import upload_bp

# app = Flask(__name__, template_folder="app/templates", static_folder='app/static', static_url_path='/praat/static')
app = Flask(__name__, template_folder="app/templates", static_folder='app/static')

app.jinja_env.globals['URL_PREFIX'] = URL_PREFIX

# 注册蓝图
app.register_blueprint(general_bp, url_prefix='/general')
app.register_blueprint(pool_bp)
app.register_blueprint(annotation_bp)
app.register_blueprint(category_bp)
app.register_blueprint(login_bp)
app.register_blueprint(upload_bp)

app.secret_key = "your_secret_key"  # 保护 Flask session


# 让 Jinja 模板可以访问 session 变量
@app.context_processor
def inject_user():
    return dict(username=session.get('username'))


# 打印所有注册的路由
with app.app_context():
    print(app.url_map)


@app.route('/')
def index():
    return render_template('login.html')


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=1515)
