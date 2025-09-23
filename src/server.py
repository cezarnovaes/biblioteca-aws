import os

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

# Inicializa a aplicação Flask
app = Flask(__name__)

# Habilita o CORS para permitir que o front-end (rodando em outra origem)
# faça requisições para esta API.
CORS(app)

# --- Simulação de um Banco de Dados ---
# Usamos uma lista de dicionários para armazenar os livros em memória.
# Em uma aplicação real, você usaria um banco de dados como PostgreSQL, MySQL ou SQLite.
books = [
    { "id": 1, "title": "A Arte da Guerra", "author": "Sun Tzu", "genre": "Estratégia" },
    { "id": 2, "title": "O Senhor dos Anéis", "author": "J.R.R. Tolkien", "genre": "Fantasia" },
    { "id": 3, "title": "1984", "author": "George Orwell", "genre": "Ficção Distópica" }
]
# Usamos uma variável para gerar o próximo ID, simulando um auto-incremento
next_id = 4

# --- Definição das Rotas da API (Endpoints) ---

# Rota para LER todos os livros (GET /books)
@app.route('/books', methods=['GET'])
def get_books():
    """Retorna a lista completa de livros."""
    # A função jsonify do Flask converte nossa lista Python em uma resposta JSON
    return jsonify(books)

# Rota para CRIAR um novo livro (POST /books)
@app.route('/books', methods=['POST'])
def create_book():
    """Cria um novo livro com base nos dados JSON recebidos."""
    global next_id
    # Pega os dados JSON enviados no corpo da requisição
    data = request.get_json()

    # Validação simples para garantir que os campos necessários foram enviados
    if not data or not 'title' in data or not 'author' in data:
        return jsonify({"error": "Dados inválidos. Título e autor são obrigatórios."}), 400

    new_book = {
        "id": next_id,
        "title": data['title'],
        "author": data['author'],
        "genre": data.get('genre', 'Não especificado') # Usa um valor padrão se o gênero não for enviado
    }
    
    books.append(new_book)
    next_id += 1
    
    # Retorna o livro recém-criado com o status HTTP 201 (Created)
    return jsonify(new_book), 201

# Rota para ATUALIZAR um livro existente (PUT /books/<id>)
@app.route('/books/<int:book_id>', methods=['PUT'])
def update_book(book_id):
    """Atualiza um livro existente identificado pelo seu ID."""
    # Procura o livro na lista pelo ID
    book = next((b for b in books if b['id'] == book_id), None)
    
    if not book:
        # Se não encontrar, retorna um erro 404 (Not Found)
        return jsonify({"error": "Livro não encontrado."}), 404
        
    data = request.get_json()
    
    # Atualiza os dados do livro com os dados recebidos na requisição
    # O método .get() evita erros se uma chave não for enviada
    book['title'] = data.get('title', book['title'])
    book['author'] = data.get('author', book['author'])
    book['genre'] = data.get('genre', book['genre'])
    
    return jsonify(book)

# Rota para DELETAR um livro (DELETE /books/<id>)
@app.route('/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    """Deleta um livro identificado pelo seu ID."""
    global books
    # Encontra o livro na lista
    book = next((b for b in books if b['id'] == book_id), None)
    
    if not book:
        # Retorna erro 404 se o livro não existir
        return jsonify({"error": "Livro não encontrado."}), 404
    
    # Recria a lista de livros, excluindo o livro com o ID correspondente
    books = [b for b in books if b['id'] != book_id]
    
    return jsonify({"message": "Livro deletado com sucesso."}), 200
@app.route("/")
def home():
    return send_from_directory('static', 'index.html')

# --- Ponto de Entrada para Rodar o Servidor ---
if __name__ == '__main__':
    # Roda a aplicação no host 0.0.0.0 para ser acessível na rede local
    # A porta é 3000 para corresponder ao que definimos no front-end (app.js)
    # debug=True faz o servidor reiniciar automaticamente após alterações no código
    app.run(host='0.0.0.0', port=3000, debug=True)
