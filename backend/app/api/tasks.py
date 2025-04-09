from flask import request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.task import Task
from app.models.project import Project
from app.api import bp
from app import db
from app.utils import parse_date, format_date, date_error_response

@bp.route('/projects/<int:project_id>/tasks', methods=['GET'])
@jwt_required()
def get_tasks(project_id):
    """获取项目中的所有任务"""
    current_user_id = get_jwt_identity()
    # 确认项目归属于当前用户
    project = Project.query.filter_by(id=project_id, user_id=int(current_user_id)).first_or_404()
    
    tasks = Task.query.filter_by(project_id=project_id).all()
    result = []
    
    for task in tasks:
        result.append({
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'status': task.status,
            'priority': task.priority,
            'due_date': format_date(task.due_date),
            'created_at': format_date(task.created_at)
        })
    
    return jsonify(result)

@bp.route('/projects/<int:project_id>/tasks', methods=['POST'])
@jwt_required()
def create_task(project_id):
    """在项目中创建新任务"""
    current_user_id = get_jwt_identity()
    # 确认项目归属于当前用户
    project = Project.query.filter_by(id=project_id, user_id=int(current_user_id)).first_or_404()
    
    data = request.get_json()
    
    # 处理日期
    due_date = parse_date(data.get('due_date'))
    if data.get('due_date') and due_date is None:
        return date_error_response()
    
    new_task = Task(
        title=data['title'],
        description=data.get('description', ''),
        status=data.get('status', 'pending'),
        priority=data.get('priority', 'medium'),
        due_date=due_date,
        project_id=project_id
    )
    
    db.session.add(new_task)
    db.session.commit()
    
    return jsonify({
        'id': new_task.id,
        'title': new_task.title,
        'description': new_task.description,
        'status': new_task.status,
        'priority': new_task.priority,
        'due_date': format_date(new_task.due_date),
        'created_at': format_date(new_task.created_at)
    }), 201

@bp.route('/tasks/<int:task_id>', methods=['GET'])
@jwt_required()
def get_task(task_id):
    """获取单个任务详情"""
    current_user_id = get_jwt_identity()
    # 查找任务并验证所有权
    task = Task.query.join(Project).filter(
        Task.id == task_id,
        Project.user_id == int(current_user_id)
    ).first_or_404()
    
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'priority': task.priority,
        'due_date': format_date(task.due_date),
        'created_at': format_date(task.created_at),
        'project_id': task.project_id
    })

@bp.route('/tasks/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """更新任务信息"""
    current_user_id = get_jwt_identity()
    # 查找任务并验证所有权
    task = Task.query.join(Project).filter(
        Task.id == task_id,
        Project.user_id == int(current_user_id)
    ).first_or_404()
    
    data = request.get_json()
    
    if 'title' in data:
        task.title = data['title']
    
    if 'description' in data:
        task.description = data['description']
    
    if 'status' in data:
        task.status = data['status']
    
    if 'priority' in data:
        task.priority = data['priority']

    
    if 'due_date' in data:
        due_date = parse_date(data['due_date'])
        if data['due_date'] and due_date is None:
            return date_error_response()
        task.due_date = due_date
    
    db.session.commit()
    
    return jsonify({
        'id': task.id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'priority': task.priority,
        'due_date': format_date(task.due_date),
        'created_at': format_date(task.created_at),
        'project_id': task.project_id
    })

@bp.route('/tasks/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    """删除任务"""
    current_user_id = get_jwt_identity()
    # 查找任务并验证所有权
    task = Task.query.join(Project).filter(
        Task.id == task_id,
        Project.user_id == int(current_user_id)
    ).first_or_404()
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({'msg': 'Task successfully deleted'})