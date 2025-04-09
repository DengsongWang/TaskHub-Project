from app import create_app, db
from app.models.user import User
from app.models.project import Project
from app.models.task import Task

def init_db():
    app = create_app()
    with app.app_context():
        db.create_all()
        print("Database_tables_created_successfully")

if __name__ == '__main__':
    init_db()