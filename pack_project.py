import os

# Какие папки и файлы берем
INCLUDE_DIRS = ['bot', 'src', 'components', 'services']
INCLUDE_FILES = ['index.html', 'package.json', 'vite.config.ts', 'constants.ts', 'App.tsx', 'main.tsx']
OUTPUT_FILE = 'FULL_PROJECT_CONTEXT.txt'

def pack():
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as outfile:
        # 1. Отдельные файлы корня
        for filename in INCLUDE_FILES:
            if os.path.exists(filename):
                outfile.write(f"--- FILE: {filename} ---\n")
                with open(filename, 'r', encoding='utf-8') as infile:
                    outfile.write(infile.read() + "\n\n")

        # 2. Папки
        for folder in INCLUDE_DIRS:
            if os.path.exists(folder):
                for root, dirs, files in os.walk(folder):
                    # Игнорируем мусор
                    if '__pycache__' in root: continue
                    
                    for file in files:
                        if file.endswith(('.py', '.tsx', '.ts', '.css', '.html')):
                            path = os.path.join(root, file)
                            outfile.write(f"--- FILE: {path} ---\n")
                            try:
                                with open(path, 'r', encoding='utf-8') as f:
                                    outfile.write(f.read() + "\n\n")
                            except Exception as e:
                                outfile.write(f"# Error reading file: {e}\n\n")
    
    print(f"✅ Готово! Весь проект собран в файл: {OUTPUT_FILE}")

if __name__ == '__main__':
    pack()
