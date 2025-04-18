from app import create_app, db
from app.models.user import User
from app.models.project import Project
from app.models.task import Task

app = create_app()

@app.shell_context_processor
def make_shell_context():
    
    return {
        'db': db,
        'User': User,
        'Project': Project,
        'Task': Task
    }

if __name__ == '__main__':
    app.run(debug=True)