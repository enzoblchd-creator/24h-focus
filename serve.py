import os, http.server, socketserver

os.chdir(os.path.dirname(os.path.abspath(__file__)))

PORT = 3000
Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map.update({'.html': 'text/html'})

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
