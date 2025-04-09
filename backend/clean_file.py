def clean_null_bytes(filename):
    # 读取文件内容
    with open(filename, 'rb') as file:
        content = file.read()
    
    # 移除null字节
    cleaned_content = content.replace(b'\x00', b'')
    
    # 写回文件
    with open(filename, 'wb') as file:
        file.write(cleaned_content)
    
    print(f"File cleaned: {filename}")
    # 如果原文件和清理后的文件大小不同，则表示有null字节被移除
    print(f"Removed {len(content) - len(cleaned_content)} null bytes")

# 运行函数清理文件
if __name__ == "__main__":
    # 替换为您的__init__.py的路径
    clean_null_bytes('app/__init__.py')