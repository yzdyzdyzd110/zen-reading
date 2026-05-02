"""
Build script — packages the PyQt launcher into a standalone executable.
Output: release/ZenReading.exe (Win) or release/ZenReading.app (Mac)
"""
import os
import sys
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LAUNCHER_DIR = os.path.join(ROOT, 'launcher')
DIST_DIR = os.path.join(ROOT, 'release')

def run_cmd(cmd, cwd):
    if isinstance(cmd, list):
        cmd = ' '.join(cmd)
    subprocess.run(cmd, cwd=cwd, shell=True, check=True)

def package():
    print('Packaging launcher...')
    os.makedirs(DIST_DIR, exist_ok=True)

    main_py = os.path.join(LAUNCHER_DIR, 'main.py')

    cmd = [
        sys.executable, '-m', 'PyInstaller',
        '--onefile',
        '--windowed',
        '--name', 'ZenReading',
        '--distpath', DIST_DIR,
        '--workpath', os.path.join(ROOT, 'build_temp'),
        '--specpath', LAUNCHER_DIR,
        '--clean',
        '--noconfirm',
    ]

    # Icon
    icon_path = os.path.join(LAUNCHER_DIR, 'icon.ico')
    if os.path.exists(icon_path):
        cmd += ['--icon', icon_path]

    cmd.append(main_py)
    run_cmd(cmd, ROOT)

    print(f'  Done! Output: {DIST_DIR}')
    print()

    if sys.platform == 'win32':
        print(f'  {os.path.join(DIST_DIR, "ZenReading.exe")}')
    else:
        print(f'  {os.path.join(DIST_DIR, "ZenReading.app")}')

if __name__ == '__main__':
    os.chdir(ROOT)
    package()
