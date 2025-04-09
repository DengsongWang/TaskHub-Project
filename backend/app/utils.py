from datetime import datetime
from flask import jsonify

def parse_date(date_string):
    """
    Convert ISO format date string to Python datetime object.
    Handles different ISO formats including those with 'Z' timezone marker.
    
    Args:
        date_string (str): ISO format date string
        
    Returns:
        datetime object or None if invalid/empty
    """
    if not date_string:
        return None
    try:
        # Handle 'Z' timezone marker by replacing with +00:00
        if date_string.endswith('Z'):
            date_string = date_string.replace('Z', '+00:00')
        return datetime.fromisoformat(date_string)
    except ValueError:
        return None

def format_date(date_obj):
    """
    Convert Python datetime object to ISO format string.
    
    Args:
        date_obj (datetime): Python datetime object
        
    Returns:
        ISO format string or None if date_obj is None
    """
    if date_obj is None:
        return None
    return date_obj.isoformat()

def date_error_response():
    """
    Standard error response for date parsing errors.
    
    Returns:
        JSON response with 400 status code
    """
    return jsonify({"error": "Invalid date format. Use ISO format (YYYY-MM-DDTHH:MM:SS)"}), 400