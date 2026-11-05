from http.server import HTTPServer, SimpleHTTPRequestHandler

PORTA = 5000

servidor = HTTPServer(("0.0.0.0", PORTA), SimpleHTTPRequestHandler)

print(f"HotelPet rodando na porta {PORTA}")

servidor.serve_forever()
