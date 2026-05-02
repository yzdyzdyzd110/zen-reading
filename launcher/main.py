"""
ZenReading Launcher — cross-platform GUI (PyQt6)
Manages the Node.js Express backend server lifecycle.
"""
import sys
import os
import webbrowser
import urllib.request
import shutil

from PyQt6.QtWidgets import (
    QApplication, QWidget, QVBoxLayout,
    QPushButton, QLabel,
)
from PyQt6.QtCore import Qt, QTimer, QProcess

APP_PORT = 3001


class LauncherWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.server = None
        self.running = False
        self._init_ui()
        self._init_server()
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

        # Use bundled Node.js runtime, fallback to system
        if sys.platform == 'win32':
            bundled = os.path.join(work_dir, 'node_runtime', 'node.exe')
        else:
            bundled = os.path.join(work_dir, 'node_runtime', 'node')
        if os.path.exists(bundled):
            self._node_exe = bundled
        elif shutil.which('node'):
            self._node_exe = 'node'
        else:
            self._node_exe = None
            self.lbl_status.setText("  Node.js not found")
            self.btn_start.setEnabled(False)
            self.btn_start.setText("Node.js required")
            self._refresh_style()

    def _start_polling(self):
        self._timer = QTimer()
        self._timer.timeout.connect(self._poll)
        self._timer.start(3000)

    def _poll(self):
        if not self.running:
            return
        try:
            urllib.request.urlopen(f"http://localhost:{APP_PORT}/api/articles/sets", timeout=2)
        except Exception:
            pass

    def _on_start(self):
        if self.server and self.server.state() == QProcess.ProcessState.Running:
            return
        self.server = QProcess()
        self.server.finished.connect(lambda: self._on_process_done())
        self.server.setWorkingDirectory(self._work_dir)
        self.server.start(self._node_exe, ["server.js"])
        self._set_running(True)

    def _on_stop(self):
        try:
            urllib.request.urlopen(f"http://localhost:{APP_PORT}/api/shutdown", timeout=1)
        except Exception:
            pass
        if self.server and self.server.state() == QProcess.ProcessState.Running:
            self.server.terminate()
            if not self.server.waitForFinished(3000):
                self.server.kill()
        self._set_running(False)

    def _on_process_done(self):
        self._set_running(False)

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
        QLabel#statusOn { font-size: 11px; color: #4caf50; padding-top: 4px; }
        QLabel#statusOff { font-size: 11px; color: #9e9688; padding-top: 4px; }
        QLabel#exitLink { font-size: 11px; color: #ccc; padding-top: 4px; }
        QLabel#exitLink:hover { color: #9e9688; }
        """


if __name__ == "__main__":
    app = QApplication(sys.argv)
    app.setApplicationName("ZenReading Launcher")
    window = LauncherWindow()
    window.show()
    sys.exit(app.exec())
