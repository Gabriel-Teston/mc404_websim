#!/usr/bin/env python3 
from http.server import HTTPServer, BaseHTTPRequestHandler
from threading import Timer
from io import BytesIO
from sys import stdin, stdout, stderr
import os, sys, json

elf_data = ""
stdin_data = ""

def exit_bridge():
  os._exit(0)

DEBUG_ENABLED = False

def err_print(m):
  if(not DEBUG_ENABLED):
    return
  stderr.write(m)
  stderr.flush()

class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
  def do_GET(self):
    self.send_response(200)
    self.send_header("Access-Control-Allow-Origin", "*")
    if("code" in self.path):
      self.send_header('Content-type','application/octet-stream')
      self.end_headers()
      res = elf_data
      self.wfile.write(res)
    elif ("stdin" in self.path):
      self.send_header('Content-type','text/html')
      self.end_headers()
      res = sys.stdin.read()
      self.wfile.write(bytes(res, "utf-8"))
      err_print("[CLI SIM DEBUG] Sent: " + str(res) + '\n')

  def do_POST(self):
    content_length = int(self.headers['Content-Length'])
    body = self.rfile.read(content_length)
    self.send_response(200)
    self.send_header("Access-Control-Allow-Origin", "*")
    self.send_header('Content-type','text/html')
    self.end_headers()
    data = body.decode("utf-8")
    stdout_data, stderr_data = json.loads(data)
    stdout.write(stdout_data)
    stderr.write(stderr_data)
    err_print("[CLI SIM DEBUG] Received: " + body.decode("utf-8") + '\n')

  def log_message(self, format, *args):
    return

if __name__ == "__main__":
  elfFile = open(sys.argv[1], "rb")
  elf_data = elfFile.read()
  elfFile.close()
  httpd = HTTPServer(('localhost', 8695), SimpleHTTPRequestHandler)
  httpd.serve_forever()