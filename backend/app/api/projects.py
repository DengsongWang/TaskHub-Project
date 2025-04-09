from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.project import Project
from app.api import bp
from app import db
from app.utils import parse_date, format_date, date_error_response

@bp.route('/projects', methods=['GET'])
@jwt_required()
def get_projects():
    """获取当前用户的所有项目"""
    current_user_id = get_jwt_identity()
    projects = Project.query.filter_by(user_id=int(current_user_id)).all()
    
    result = []
    for project in projects:
        # 计算每个项目的完成任务数量
        total_tasks = len(project.tasks)
        completed_tasks = len([t for t in project.tasks if t.status == 'completed'])
        
        result.append({
            'id': project.id,
            'title': project.title,
            'description': project.description,
            'due_date': format_date(project.due_date),
            'created_at': format_date(project.created_at),
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks
        })
    
    return jsonify(result)

@bp.route('/projects', methods=['POST'])
@jwt_required()
def create_project():
    """创建新项目"""
    data = request.get_json()
    current_user_id = get_jwt_identity()
    
    # 处理日期
    due_date = parse_date(data.get('due_date'))
    if data.get('due_date') and due_date is None:
        return date_error_response()
    
    new_project = Project(
        title=data['title'],
        description=data.get('description', ''),
        due_date=due_date,
        user_id=int(current_user_id)
    )
    
    db.session.add(new_project)
    db.session.commit()
    
    return jsonify({
        'id': new_project.id,
        'title': new_project.title,
        'description': new_project.description,
        'due_date': format_date(new_project.due_date),
        'created_at': format_date(new_project.created_at)
    }), 201

@bp.route('/projects/<int:id>', methods=['GET'])
@jwt_required()
def get_project(id):
    """获取单个项目详情"""
    current_user_id = get_jwt_identity()
    project = Project.query.filter_by(id=id, user_id=int(current_user_id)).first_or_404()
    
    return jsonify({
        'id': project.id,
        'title': project.title,
        'description': project.description,
        'due_date': format_date(project.due_date),
        'created_at': format_date(project.created_at)
    })

@bp.route('/projects/<int:id>', methods=['PUT'])
@jwt_required()
def update_project(id):
    """更新项目信息"""
    current_user_id = get_jwt_identity()
    project = Project.query.filter_by(id=id, user_id=int(current_user_id)).first_or_404()
    data = request.get_json()
    
    if 'title' in data:
        project.title = data['title']
    
    if 'description' in data:
        project.description = data['description']
    
    if 'due_date' in data:
        due_date = parse_date(data['due_date'])
        if data['due_date'] and due_date is None:
            return date_error_response()
        project.due_date = due_date
    
    db.session.commit()
    
    return jsonify({
        'id': project.id,
        'title': project.title,
        'description': project.description,
        'due_date': format_date(project.due_date),
        'created_at': format_date(project.created_at)
    })

@bp.route('/projects/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_project(id):
    """删除项目"""
    current_user_id = get_jwt_identity()
    project = Project.query.filter_by(id=id, user_id=int(current_user_id)).first_or_404()
    
    db.session.delete(project)
    db.session.commit()
    
    return jsonify({'msg': 'Project successfully deleted'})