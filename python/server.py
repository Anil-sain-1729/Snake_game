from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parent.parent
os.chdir(ROOT)

print("Grid Snake is running at: http://localhost:8000")
print("Press Ctrl+C to stop the server.")

server = ThreadingHTTPServer(("localhost", 8000), SimpleHTTPRequestHandler)
server.serve_forever()
