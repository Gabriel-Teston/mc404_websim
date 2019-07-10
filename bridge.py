from http.server import HTTPServer, BaseHTTPRequestHandler

from io import BytesIO
from sys import stdin, stdout, stderr


def putDebugChar(c):
  stdout.write(c)

def getDebugChar(n=1):
  return stdin.read(n)

def readFromGDB():
  data = ""
  ch = ' '

  while 1:
    while ch != '$':
      ch = getDebugChar()

    sum = 0 # checksum
    while 1:
      ch = getDebugChar()
      if (ch == '$' or ch == '#'):
        break
      sum += ord(ch)
      data += ch

    if (ch == '$'):
      continue

    if (ch == '#'):
      pacSum = int(getDebugChar(n=2), base=16)

      if (sum != pacSum):
        putDebugChar('-') # Signal failed reception.
      else:
        putDebugChar('+') # Signal successul reception.
        stdout.flush()
        # If sequence char present, reply with sequence id.
        if (len(data) >= 3 and data[2] == ':'):
          putDebugChar(data[0])
          putDebugChar(data[1])
          data = data[3:]
        return data
  return data

def writeToGDB(data):
  while 1:
    putDebugChar('$')
    checksum = 0
    for c in data:
      putDebugChar(c)
      checksum += ord(c)

    putDebugChar('#')
    putDebugChar(hex(checksum))
    stdout.flush()
  
    c = getDebugChar()
    if (c == '+'):
      return


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):

  def do_GET(self):
    self.send_response(200)
    self.send_header("Access-Control-Allow-Origin", "*")
    self.send_header('Content-type','text/html')
    self.end_headers()
    stderr.write("[BRIDGE DEBUG] Reading from GDB ")
    stderr.flush()
    res = readFromGDB()
    self.wfile.write(bytes(res, "utf-8"))
    stderr.write("[BRIDGE DEBUG] Sent: ", res)
    stderr.flush()

  def do_POST(self):
    content_length = int(self.headers['Content-Length'])
    body = self.rfile.read(content_length)
    self.send_response(200)
    self.send_header("Access-Control-Allow-Origin", "*")
    self.send_header('Content-type','text/html')
    self.end_headers()
    stderr.write("[BRIDGE DEBUG] Writing to GDB ")
    stderr.flush()
    writeToGDB(body)
    stderr.write("[BRIDGE DEBUG] Received: ", body)
    stderr.flush()
    response = BytesIO()
    response.write(b'Written to GDB: ')
    response.write(body)
    self.wfile.write(response.getvalue())


httpd = HTTPServer(('localhost', 5689), SimpleHTTPRequestHandler)
httpd.serve_forever()