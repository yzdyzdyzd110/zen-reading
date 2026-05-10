"""
ZenReading Launcher — cross-platform GUI (PyQt6)
Manages the Node.js Express backend server lifecycle.
"""
import sys
import os
import json
import webbrowser
import shutil
from datetime import datetime

from PyQt6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QDialog, QListWidget, QListWidgetItem,
    QFileDialog, QMessageBox,
)
from PyQt6.QtCore import Qt, QTimer, QProcess, QUrl
from PyQt6.QtNetwork import QNetworkAccessManager, QNetworkRequest

APP_PORT = 3001

def _log_path(filename="launcher.log"):
    """Log file next to the exe (frozen) or in the project root (dev)."""
    import tempfile
    try:
        if getattr(sys, 'frozen', False):
            base = os.path.dirname(sys.executable)
        else:
            base = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        return os.path.join(base, filename)
    except Exception:
        return os.path.join(tempfile.gettempdir(), filename)

def _log(msg):
    try:
        with open(_log_path(), 'a', encoding='utf-8') as f:
            f.write(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}\n")
    except Exception:
        pass


class LauncherWindow(QWidget):
    def __init__(self):
        super().__init__()
        _log("=== Launcher started ===")
        self.server = None
        self.running = False
        self._init_ui()
        self._init_server()
        self._init_network()
        self._start_polling()

    def _init_ui(self):
        self.setWindowTitle("ZenReading Launcher")
        self.resize(380, 460)
        self.setMinimumSize(360, 420)
        self.setMaximumSize(480, 560)
        self.setStyleSheet(self._style())

        layout = QVBoxLayout()
        layout.setContentsMargins(44, 40, 44, 36)
        layout.setSpacing(0)

        title = QLabel("ZenReading")
        title.setObjectName("title")
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title)

        subtitle = QLabel("禅定阅读 · 沉浸式学习")
        subtitle.setObjectName("subtitle")
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(subtitle)

        layout.addStretch(2)

        self.btn_start = QPushButton("Start Server")
        self.btn_start.setObjectName("btnStart")
        self.btn_start.setFixedHeight(48)
        self.btn_start.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_start.clicked.connect(self._on_start)
        layout.addWidget(self.btn_start)

        layout.addSpacing(12)

        self.btn_stop = QPushButton("Stop Server")
        self.btn_stop.setObjectName("btnStop")
        self.btn_stop.setFixedHeight(44)
        self.btn_stop.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_stop.setEnabled(False)
        self.btn_stop.clicked.connect(self._on_stop)
        layout.addWidget(self.btn_stop)

        layout.addSpacing(12)

        self.btn_open = QPushButton("Open App")
        self.btn_open.setObjectName("btnOpen")
        self.btn_open.setFixedHeight(44)
        self.btn_open.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_open.setEnabled(False)
        self.btn_open.clicked.connect(lambda: webbrowser.open(f"http://localhost:{APP_PORT}"))
        layout.addWidget(self.btn_open)

        layout.addSpacing(12)

        self.btn_resources = QPushButton("Manage Resources")
        self.btn_resources.setObjectName("btnResources")
        self.btn_resources.setFixedHeight(40)
        self.btn_resources.setCursor(Qt.CursorShape.PointingHandCursor)
        self.btn_resources.clicked.connect(self._on_manage_resources)
        layout.addWidget(self.btn_resources)

        layout.addStretch(1)

        self.lbl_status = QLabel("  Server stopped")
        self.lbl_status.setObjectName("statusOff")
        self.lbl_status.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.lbl_status)

        exit_label = QLabel("Exit")
        exit_label.setObjectName("exitLink")
        exit_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        exit_label.mousePressEvent = lambda _: self.close()
        layout.addWidget(exit_label)

        self.setLayout(layout)

    def _init_server(self):
        # Work dir is where the launcher exe lives (same dir as server.js)
        if getattr(sys, 'frozen', False):
            work_dir = os.path.dirname(sys.executable)
        else:
            work_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

        self._work_dir = work_dir
        _log(f"work_dir = {work_dir}")
        _log(f"server.js exists = {os.path.exists(os.path.join(work_dir, 'server.js'))}")
        _log(f"node_modules exists = {os.path.exists(os.path.join(work_dir, 'node_modules'))}")
        _log(f"frozen = {getattr(sys, 'frozen', False)}")

        # Use bundled Node.js runtime, fallback to system
        if sys.platform == 'win32':
            bundled = os.path.join(work_dir, 'node_runtime', 'node.exe')
        else:
            bundled = os.path.join(work_dir, 'node_runtime', 'node')
        _log(f"bundled node path = {bundled}")
        _log(f"bundled node exists = {os.path.exists(bundled)}")
        if os.path.exists(bundled):
            self._node_exe = bundled
        elif shutil.which('node'):
            self._node_exe = 'node'
            _log("using system node")
        else:
            self._node_exe = None
            _log("ERROR: node not found")
            self.lbl_status.setText("  Node.js not found")
            self.btn_start.setEnabled(False)
            self.btn_start.setText("Node.js required")
            self._refresh_style()

    def _init_network(self):
        self._net = QNetworkAccessManager()
        self._net.finished.connect(self._on_poll_response)

    def _start_polling(self):
        self._timer = QTimer()
        self._timer.timeout.connect(self._poll)
        self._timer.start(3000)

    def _poll(self):
        if not self.running:
            return
        _log(f"polling http://localhost:{APP_PORT}/api/articles/sets ...")
        request = QNetworkRequest(QUrl(f"http://localhost:{APP_PORT}/api/articles/sets"))
        self._net.get(request)

    def _on_poll_response(self, reply):
        from PyQt6.QtNetwork import QNetworkReply
        err = reply.error()
        _log(f"poll response: error={err}")
        if err != QNetworkReply.NetworkError.NoError:
            return
        _log("server ready, opening browser")
        webbrowser.open(f"http://localhost:{APP_PORT}")
        self._timer.stop()

    def _on_start(self):
        if self.server and self.server.state() == QProcess.ProcessState.Running:
            return
        _log(f"starting: exe={self._node_exe} args=['server.js'] cwd={self._work_dir}")
        self.server = QProcess()
        self.server.setProcessChannelMode(QProcess.ProcessChannelMode.MergedChannels)
        self.server.readyReadStandardOutput.connect(self._on_stdout)
        self.server.finished.connect(self._on_process_done)
        self.server.errorOccurred.connect(self._on_process_error)
        self.server.setWorkingDirectory(self._work_dir)
        self.server.start(self._node_exe, ["server.js"])
        self._set_running(True)

    def _on_stdout(self):
        if self.server:
            data = bytes(self.server.readAllStandardOutput()).decode('utf-8', errors='replace').strip()
            if data:
                _log(f"stdout: {data}")
                self.lbl_status.setText(f"  {data[:80]}")
                self._refresh_style()

    def _on_stop(self):
        try:
            import urllib.request
            urllib.request.urlopen(f"http://localhost:{APP_PORT}/api/shutdown", timeout=1)
        except Exception:
            pass
        if self.server and self.server.state() == QProcess.ProcessState.Running:
            self.server.terminate()
            if not self.server.waitForFinished(3000):
                self.server.kill()
        self._set_running(False)

    def _on_process_done(self, exitCode, exitStatus):
        _log(f"process done: exitCode={exitCode} exitStatus={exitStatus}")
        self._set_running(False)
        if exitCode != 0:
            self.lbl_status.setText(f"  Node.js exited with code {exitCode}")
            self._refresh_style()

    def _on_process_error(self, error):
        _log(f"process error: {error}")
        self._set_running(False)
        self.lbl_status.setText(f"  Error: failed to start Node.js")
        self.btn_start.setText("Retry Start")

    def _set_running(self, running: bool):
        self.running = running
        if running:
            self.btn_start.setEnabled(False)
            self.btn_stop.setEnabled(True)
            self.btn_open.setEnabled(True)
            self.lbl_status.setText("  Server running")
            self.lbl_status.setObjectName("statusOn")
        else:
            self.btn_start.setEnabled(True)
            self.btn_stop.setEnabled(False)
            self.btn_open.setEnabled(False)
            self.lbl_status.setText("  Server stopped")
            self.lbl_status.setObjectName("statusOff")
        self._refresh_style()

    def _refresh_style(self):
        self.setStyleSheet(self._style())

    def _on_manage_resources(self):
        dlg = ResourcesDialog(self._work_dir, self)
        dlg.exec()

    def closeEvent(self, event):
        if self.running:
            self._on_stop()
        event.accept()

    def _style(self):
        return """
        QWidget {
            background: #f9f6f0;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
        }
        QLabel#title {
            font-size: 26px; font-weight: 700; color: #7a9a7d;
            letter-spacing: 2px; margin-bottom: 2px;
        }
        QLabel#subtitle {
            font-size: 13px; color: #9e9688; margin-bottom: 4px;
        }
        QPushButton {
            border: none; border-radius: 10px;
            font-size: 14px; font-weight: 600;
        }
        QPushButton#btnStart { background: #7a9a7d; color: #fff; }
        QPushButton#btnStart:hover { background: #5a7a5d; }
        QPushButton#btnStart:disabled { background: #e8e4dc; color: #9e9688; }
        QPushButton#btnStop {
            background: transparent; color: #e57373; border: 1.5px solid #e8e4dc;
        }
        QPushButton#btnStop:hover { background: #fbe9e7; }
        QPushButton#btnStop:disabled { border-color: #e8e4dc; color: #ccc; }
        QPushButton#btnOpen {
            background: transparent; color: #7a9a7d; border: 1.5px solid #7a9a7d;
        }
        QPushButton#btnOpen:hover { background: #ecf2ec; }
        QPushButton#btnOpen:disabled { border-color: #e8e4dc; color: #ccc; }
        QPushButton#btnResources {
            background: transparent; color: #9e9688; border: 1.5px solid #e8e4dc;
        }
        QPushButton#btnResources:hover { background: #f0ede6; color: #7a9a7d; }
        QLabel#statusOn { font-size: 11px; color: #4caf50; padding-top: 4px; }
        QLabel#statusOff { font-size: 11px; color: #9e9688; padding-top: 4px; }
        QLabel#exitLink { font-size: 11px; color: #ccc; padding-top: 4px; }
        QLabel#exitLink:hover { color: #9e9688; }
        """


class ResourcesDialog(QDialog):
    def __init__(self, work_dir, parent=None):
        super().__init__(parent)
        self._work_dir = work_dir
        self._manifest_path = os.path.join(work_dir, 'manifest.json')
        self._data_dir = os.path.join(work_dir, 'data')
        self._manifest = None
        self._modified = False
        self._init_ui()
        self._load_manifest()

    def _init_ui(self):
        self.setWindowTitle("Manage Resources")
        self.resize(520, 420)
        self.setMinimumSize(420, 320)

        layout = QVBoxLayout()
        layout.setContentsMargins(24, 20, 24, 20)
        layout.setSpacing(12)

        title = QLabel("Resource Packages")
        title.setStyleSheet("font-size: 20px; font-weight: 700; color: #7a9a7d;")
        layout.addWidget(title)

        desc = QLabel("Enable or disable resource packages. Changes take effect after restarting the server.")
        desc.setStyleSheet("font-size: 13px; color: #9e9688;")
        desc.setWordWrap(True)
        layout.addWidget(desc)

        # List with multi-selection
        self._list = QListWidget()
        self._list.setSelectionMode(
            QListWidget.SelectionMode.ExtendedSelection)
        self._list.setStyleSheet("""
            QListWidget {
                border: 1px solid #e8e4dc; border-radius: 8px;
                background: #fff; padding: 8px;
            }
            QListWidget::item { padding: 6px 4px; }
            QListWidget::item:selected {
                background: #ecf2ec; color: #3a5a3d;
            }
        """)
        layout.addWidget(self._list, 1)

        # Buttons row
        btn_row = QHBoxLayout()
        btn_load = QPushButton("Load External PKG")
        btn_load.setStyleSheet("""
            QPushButton { background: transparent; color: #7a9a7d;
            border: 1.5px solid #7a9a7d; border-radius: 10px;
            font-size: 14px; font-weight: 600; }
            QPushButton:hover { background: #ecf2ec; }
        """)
        btn_load.setFixedHeight(38)
        btn_load.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_load.clicked.connect(self._on_load_external)
        btn_row.addWidget(btn_load)

        btn_remove = QPushButton("Remove Selected")
        btn_remove.setStyleSheet("""
            QPushButton { background: transparent; color: #e57373;
            border: 1.5px solid #e8e4dc; border-radius: 10px;
            font-size: 14px; font-weight: 600; padding: 0 16px; }
            QPushButton:hover { background: #fbe9e7; border-color: #e57373; }
            QPushButton:disabled { color: #ccc; border-color: #e8e4dc; }
        """)
        btn_remove.setFixedHeight(38)
        btn_remove.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_remove.setEnabled(False)
        btn_remove.clicked.connect(self._on_remove_selected)
        btn_row.addWidget(btn_remove)

        self._list.itemSelectionChanged.connect(
            lambda: btn_remove.setEnabled(bool(self._list.selectedItems()))
        )

        btn_row.addStretch()

        btn_apply = QPushButton("Apply")
        btn_apply.setStyleSheet("""
            QPushButton { background: #7a9a7d; color: #fff; border: none;
            border-radius: 10px; font-size: 14px; font-weight: 600; }
            QPushButton:hover { background: #5a7a5d; }
        """)
        btn_apply.setFixedHeight(38)
        btn_apply.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_apply.clicked.connect(self._on_apply)
        btn_row.addWidget(btn_apply)

        btn_cancel = QPushButton("Cancel")
        btn_cancel.setStyleSheet("""
            QPushButton { background: transparent; color: #e57373;
            border: 1.5px solid #e8e4dc; border-radius: 10px;
            font-size: 14px; font-weight: 600; }
            QPushButton:hover { background: #fbe9e7; }
        """)
        btn_cancel.setFixedHeight(38)
        btn_cancel.setCursor(Qt.CursorShape.PointingHandCursor)
        btn_cancel.clicked.connect(self.reject)
        btn_row.addWidget(btn_cancel)

        layout.addLayout(btn_row)
        self.setLayout(layout)

    def _load_manifest(self):
        if not os.path.exists(self._manifest_path):
            QMessageBox.warning(self, "Not Found",
                f"manifest.json not found at:\n{self._manifest_path}\n\n"
                "Please ensure the release is properly assembled.")
            self.reject()
            return
        with open(self._manifest_path, 'r', encoding='utf-8') as f:
            self._manifest = json.load(f)
        self._rebuild_list()

    def _rebuild_list(self):
        self._list.blockSignals(True)
        self._list.clear()
        for entry in self._manifest.get('pkgs', []):
            meta = entry.get('meta', {})
            name = meta.get('name', entry['id'])
            ac = meta.get('articleCount', 0)
            vc = meta.get('vocabSetCount', 0)
            parts = []
            if ac: parts.append(f"{ac} articles")
            if vc: parts.append(f"{vc} vocabulary")
            count_text = " · ".join(parts) if parts else "empty"

            item = QListWidgetItem(f"{name}  —  {count_text}")
            item.setData(Qt.ItemDataRole.UserRole, entry['id'])
            self._list.addItem(item)
        self._list.blockSignals(False)

    def _on_load_external(self):
        file_path, _ = QFileDialog.getOpenFileName(
            self, "Load PKG File", "", "PKG Files (*.pkg);;All Files (*)")
        if not file_path:
            return
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                pkg = json.load(f)
        except Exception as e:
            QMessageBox.critical(self, "Load Error", f"Failed to read PKG file:\n{e}")
            return

        if pkg.get('format') != 'zenreading-pkg':
            QMessageBox.critical(self, "Invalid PKG", "File is not a valid ZenReading PKG.")
            return

        meta = pkg.get('meta', {})
        name = meta.get('name', os.path.splitext(os.path.basename(file_path))[0])
        pkg_id = name.lower().replace(' ', '_').replace('-', '_')

        # Avoid duplicate IDs
        existing_ids = {e['id'] for e in self._manifest.get('pkgs', [])}
        base_id = pkg_id
        n = 1
        while pkg_id in existing_ids:
            pkg_id = f"{base_id}_{n}"
            n += 1

        # Copy PKG into data/
        os.makedirs(self._data_dir, exist_ok=True)
        dest_name = f"{pkg_id}.pkg"
        dest_path = os.path.join(self._data_dir, dest_name)
        if os.path.exists(dest_path):
            QMessageBox.critical(self, "File Exists", f"Destination already exists:\n{dest_path}")
            return
        shutil.copy2(file_path, dest_path)

        entry = {
            'id': pkg_id,
            'path': f"data/{dest_name}",
            'enabled': True,
            'meta': {
                'name': name,
                'articleCount': len(pkg.get('articles', [])),
                'vocabSetCount': len(pkg.get('vocabularySets', [])),
            }
        }
        self._manifest.setdefault('pkgs', []).append(entry)
        self._modified = True
        self._rebuild_list()
        _log(f"Loaded external PKG: {file_path} -> {dest_path}")

    def _on_remove_selected(self):
        ids = {
            item.data(Qt.ItemDataRole.UserRole)
            for item in self._list.selectedItems()
        }
        if not ids:
            return
        self._manifest['pkgs'] = [
            e for e in self._manifest['pkgs']
            if e['id'] not in ids
        ]
        self._modified = True
        self._rebuild_list()
        _log(f"Removed PKGs from manifest: {ids}")

    def _on_apply(self):
        if not self._modified:
            self.accept()
            return
        try:
            with open(self._manifest_path, 'w', encoding='utf-8') as f:
                json.dump(self._manifest, f, ensure_ascii=False, indent=2)
            _log("Manifest saved via ResourcesDialog")
        except Exception as e:
            QMessageBox.critical(self, "Save Error", f"Failed to save manifest.json:\n{e}")
            return
        self._modified = False
        QMessageBox.information(self, "Saved",
            "Resource configuration saved.\n"
            "Changes will take effect the next time you start the server.")
        self.accept()


if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setApplicationName("ZenReading Launcher")
    window = LauncherWindow()
    window.show()
    sys.exit(app.exec())
