#!/usr/bin/env python3 
from http.server import HTTPServer, BaseHTTPRequestHandler
from threading import Timer
from io import BytesIO
from sys import stdin, stdout, stderr
import os, sys

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
    self.send_header('Content-type','text/html')
    self.end_headers()
    err_print("[CLI SIM DEBUG] Reading from GDB\n")
    if("code" in self.path):
      res = elf_data
    elif ("stdin" in self.path):
      res = stdin_data
    self.wfile.write(bytes(res, "utf-8"))
    err_print("[CLI SIM DEBUG] Sent: " + str(res) + '\n')

  def do_POST(self):
    content_length = int(self.headers['Content-Length'])
    body = self.rfile.read(content_length)
    self.send_response(200)
    self.send_header("Access-Control-Allow-Origin", "*")
    self.send_header('Content-type','text/html')
    self.end_headers()
    err_print("[BRIDGE DEBUG] Writing to GDB\n")
    print(body.decode("utf-8"))
    err_print("[BRIDGE DEBUG] Received: " + body.decode("utf-8") + '\n')

  def log_message(self, format, *args):
    return

if __name__ == "__main__":
  httpd = HTTPServer(('localhost', 8695), SimpleHTTPRequestHandler)
  httpd.serve_forever()