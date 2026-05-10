"""
Package the PyQt launcher into a standalone executable.
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


def package_launcher():
    """Build the PyQt launcher exe into the release directory."""
    import shutil

    release_dir = os.path.join(DIST_DIR, 'ZenReading')
    os.makedirs(release_dir, exist_ok=True)

    main_py = os.path.join(LAUNCHER_DIR, 'main.py')

    cmd = [
        sys.executable, '-m', 'PyInstaller',
        '--onefile',
        '--windowed',
        '--name', 'ZenReading',
        '--distpath', release_dir,
        '--workpath', os.path.join(ROOT, 'build_temp'),
        '--specpath', LAUNCHER_DIR,
        '--clean',
        '--noconfirm',
    ]

    icon_path = os.path.join(LAUNCHER_DIR, 'icon.ico')
    if os.path.exists(icon_path):
        cmd += ['--icon', icon_path]

    cmd.append(main_py)
    run_cmd(cmd, ROOT)
    print(f'  Launcher built -> {release_dir}')


def download_node():
    """Download portable Node.js runtime."""
    import shutil, urllib.request, io

    NODE_VERSION = '20.18.0'
    runtime_dir = os.path.join(DIST_DIR, 'node_runtime')
    if os.path.exists(runtime_dir):
        print('  Node.js runtime already downloaded.')
        return

    os.makedirs(runtime_dir, exist_ok=True)

    if sys.platform == 'win32':
        url = f'https://nodejs.org/dist/v{NODE_VERSION}/win-x64/node.exe'
        dest = os.path.join(runtime_dir, 'node.exe')
        print(f'  Downloading Node.js {NODE_VERSION} for Windows...')
        urllib.request.urlretrieve(url, dest)
        print(f'  Downloaded node.exe ({os.path.getsize(dest) / 1024 / 1024:.0f} MB)')
    else:
        import tarfile
        url = f'https://nodejs.org/dist/v{NODE_VERSION}/node-v{NODE_VERSION}-darwin-x64.tar.gz'
        print(f'  Downloading Node.js {NODE_VERSION} for macOS...')
        data = urllib.request.urlopen(url).read()
        with tarfile.open(fileobj=io.BytesIO(data)) as tf:
            for member in tf.getmembers():
                if member.name.endswith('/bin/node'):
                    member.name = 'node'
                    tf.extract(member, runtime_dir)
                    break
        print('  Extracted node binary.')


def assemble_release():
    """Copy project files + Node.js runtime into the release directory."""
    import shutil

    release_dir = os.path.join(DIST_DIR, 'ZenReading')
    print(f'[3/4] Assembling release package in {release_dir}...')

    # Project files
    for src, dst_name in [
        ('server.js', 'server.js'),
        ('package.json', 'package.json'),
        ('manifest.json', 'manifest.json'),
    ]:
        s = os.path.join(ROOT, src)
        if os.path.exists(s):
            shutil.copy2(s, os.path.join(release_dir, dst_name))

    # Loader modules (CommonJS, required by server.js and dataStore.js)
    for src, dst_name in [
        ('backend/src/pkgLoader.js', 'backend/src/pkgLoader.js'),
        ('backend/src/dataStore.js', 'backend/src/dataStore.js'),
    ]:
        s = os.path.join(ROOT, src)
        d = os.path.join(release_dir, dst_name)
        if os.path.exists(s):
            os.makedirs(os.path.dirname(d), exist_ok=True)
            shutil.copy2(s, d)

    # Node.js runtime
    node_runtime = os.path.join(DIST_DIR, 'node_runtime')
    if os.path.exists(node_runtime):
        shutil.copytree(node_runtime, os.path.join(release_dir, 'node_runtime'), dirs_exist_ok=True)

    # Directories
    for src, dst_name in [
        ('frontend/dist', 'frontend/dist'),
        ('data', 'data'),
        ('node_modules', 'node_modules'),
    ]:
        s = os.path.join(ROOT, src)
        d = os.path.join(release_dir, dst_name)
        if os.path.exists(s):
            if os.path.exists(d):
                shutil.rmtree(d)
            shutil.copytree(s, d)

    exe_name = 'ZenReading.exe' if sys.platform == 'win32' else 'ZenReading.app'
    print(f'  Release ready: {release_dir}')
    print(f'  Double-click: {os.path.join(release_dir, exe_name)}')


def build_frontend():
    """Build frontend and install dependencies."""
    print('[0/4] Building frontend...')
    frontend_dir = os.path.join(ROOT, 'frontend')
    run_cmd('npm install', frontend_dir)
    run_cmd('npm run build', frontend_dir)
    print('  Frontend built.')

    print('[1/4] Installing root dependencies...')
    run_cmd('npm install', ROOT)
    print('  Dependencies installed.')


if __name__ == '__main__':
    os.chdir(ROOT)
    build_frontend()
    download_node()
    package_launcher()
    assemble_release()
    print('\nDone!')
