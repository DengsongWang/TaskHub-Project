import os

def clean_null_bytes_in_directory(directory):
    """Clean null bytes from all Python files in directory and subdirectories"""
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.py'):
                filepath = os.path.join(root, file)
                count += clean_file(filepath)
    return count

def clean_file(filepath):
    """Clean null bytes from a single file"""
    try:
        # Read the file content
        with open(filepath, 'rb') as file:
            content = file.read()
        
        # Check if it contains null bytes
        if b'\x00' in content:
            # Remove null bytes
            cleaned_content = content.replace(b'\x00', b'')
            
            # Write back to file with UTF-8 encoding
            with open(filepath, 'wb') as file:
                file.write(cleaned_content)
            
            bytes_removed = len(content) - len(cleaned_content)
            print(f"Cleaned {filepath} - removed {bytes_removed} null bytes")
            return 1
        return 0
    except Exception as e:
        print(f"Error processing {filepath}: {str(e)}")
        return 0

if __name__ == "__main__":
    app_directory = "app"
    total_files = clean_null_bytes_in_directory(app_directory)
    print(f"Total files cleaned: {total_files}")
