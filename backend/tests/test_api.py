import unittest
import json
from app import create_app, db
from app.models.user import User

class APITestCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        self.client = self.app.test_client()
        
        # create test user
        user = User(username='test_user', email='test@example.com')
        user.password = 'password123'  # should use generate_password_hash of werkzeug
        db.session.add(user)
        db.session.commit()
    
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
    
    def test_registration(self):
        """test user register function"""
        response = self.client.post('/api/register', 
            json={
                'username': 'new_user',
                'email': 'new@example.com',
                'password': 'password123'
            })
        self.assertEqual(response.status_code, 201)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertEqual(json_response['msg'], 'Registration successful')
    
    def test_login(self):
        """test login function"""
        # login
        response = self.client.post('/api/login',
            json={
                'username': 'test_user',
                'password': 'password123'
            })
        self.assertEqual(response.status_code, 200)
        json_response = json.loads(response.get_data(as_text=True))
        self.assertTrue('access_token' in json_response)

if __name__ == '__main__':
    unittest.main()