document.addEventListener('DOMContentLoaded', () => {

    // --- SELETORES DO DOM (com adições) ---
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    const navLogin = document.getElementById('nav-login');
    const navLogout = document.getElementById('nav-logout');
    const navLivros = document.getElementById('nav-livros');
    const loginForm = document.getElementById('login-form');
    const loginError = document.getElementById('login-error');

    // Seção CRUD (com adições)
    const bookForm = document.getElementById('book-form');
    const bookIdInput = document.getElementById('book-id');
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const yearInput = document.getElementById('year');
    const coverInput = document.getElementById('cover'); // NOVO
    const coverPreview = document.getElementById('cover-preview'); // NOVO
    const synopsisInput = document.getElementById('synopsis'); // NOVO
    const bookListGrid = document.getElementById('book-list-grid'); // NOVO (substitui book-list)
    const formTitle = document.getElementById('form-title');
    const submitButton = document.getElementById('submit-button');
    const cancelButton = document.getElementById('cancel-button');

    // --- DADOS EM MEMÓRIA (estrutura atualizada) ---
    // Usamos um placeholder para as imagens iniciais.
    const placeholderCover = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNTAiIGhlaWdodD0iMjIwIiB2aWV3Qm94PSIwIDAgMTUwIDIyMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNnB4IiBmaWxsPSIjYWFhIj5TZW0gQ2FwYTwvdGV4dD48L3N2Zz4=';

    let books = [
        { id: 1, title: 'O Senhor dos Anéis', author: 'J.R.R. Tolkien', year: 1954, cover: placeholderCover, synopsis: 'Uma jornada épica para destruir um anel mágico e poderoso, enfrentando as forças das trevas que ameaçam a Terra-média.' },
        { id: 2, title: 'Dom Quixote', author: 'Miguel de Cervantes', year: 1605, cover: placeholderCover, synopsis: 'As aventuras de um fidalgo que, após ler muitos romances de cavalaria, enlouquece e decide se tornar um cavaleiro andante.' },
        { id: 3, title: '1984', author: 'George Orwell', year: 1949, cover: placeholderCover, synopsis: 'Um romance distópico que explora os perigos do totalitarismo, da vigilância em massa e da repressão governamental.' }
    ];

    // --- LÓGICA DE NAVEGAÇÃO E LOGIN (sem alterações) ---
    const showPage = (pageId) => { pages.forEach(p => p.classList.remove('active')); document.getElementById(`${pageId}-page`).classList.add('active'); };
    navLinks.forEach(link => link.addEventListener('click', (e) => { e.preventDefault(); showPage(e.target.closest('.nav-link').dataset.page); }));
    loginForm.addEventListener('submit', (e) => { e.preventDefault(); if (document.getElementById('username').value === 'teste' && document.getElementById('password').value === '123') { navLogin.classList.add('hidden'); navLivros.classList.remove('hidden'); navLogout.classList.remove('hidden'); showPage('livros'); loginForm.reset(); loginError.textContent = ''; } else { loginError.textContent = 'Usuário ou senha inválidos.'; } });
    navLogout.addEventListener('click', (e) => { e.preventDefault(); navLogin.classList.remove('hidden'); navLivros.classList.add('hidden'); navLogout.classList.add('hidden'); showPage('home'); });

    // --- LÓGICA DO CRUD (ATUALIZADA) ---

    // NOVO: Lógica para preview da imagem
    coverInput.addEventListener('change', () => {
        const file = coverInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                coverPreview.src = e.target.result;
                coverPreview.classList.remove('hidden');
            };
            reader.readAsDataURL(file);
        }
    });

    // READ: Renderizar a lista de livros (função refeita para usar cards)
    const renderBookList = () => {
        bookListGrid.innerHTML = '';
        if (books.length === 0) {
            bookListGrid.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">Nenhum livro cadastrado.</p>';
            return;
        }

        books.forEach(book => {
            const card = document.createElement('div');
            card.className = 'book-display-card';
            card.innerHTML = `
                <div class="book-display-cover">
                    <img src="${book.cover}" alt="Capa de ${book.title}">
                </div>
                <div class="book-display-info">
                    <h4>${book.title}</h4>
                    <p class="author-year">${book.author} (${book.year})</p>
                    <p class="book-display-synopsis">${book.synopsis || 'Sinopse não disponível.'}</p>
                    <div class="book-display-actions">
                        <button class="action-btn edit-btn" data-id="${book.id}">Editar</button>
                        &nbsp;
                        <button class="action-btn delete-btn" data-id="${book.id}">Excluir</button>
                    </div>
                </div>
            `;
            bookListGrid.appendChild(card);
        });
    };

    // CREATE / UPDATE (lógica atualizada)
    bookForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const id = bookIdInput.value;
        const bookData = {
            title: titleInput.value.trim(),
            author: authorInput.value.trim(),
            year: yearInput.value,
            cover: coverPreview.src.startsWith('data:image') ? coverPreview.src : (books.find(b => b.id == id)?.cover || placeholderCover),
            synopsis: synopsisInput.value.trim()
        };

        if (id) {
            // UPDATE
            books = books.map(book => book.id === parseInt(id) ? { ...bookData, id: parseInt(id) } : book);
        } else {
            // CREATE
            const newBook = { ...bookData, id: Date.now() };
            books.push(newBook);
        }
        resetFormState();
        renderBookList();
    });

    // Lógica para botões de EDITAR e DELETAR (atualizada)
    bookListGrid.addEventListener('click', (e) => {
        const target = e.target;
        const id = parseInt(target.dataset.id);

        // DELETE
        if (target.classList.contains('delete-btn')) {
            if (confirm('Tem certeza que deseja excluir este livro?')) {
                books = books.filter(book => book.id !== id);
                renderBookList();
            }
        }

        // EDIT: Preencher o formulário
        if (target.classList.contains('edit-btn')) {
            const bookToEdit = books.find(book => book.id === id);
            if (bookToEdit) {
                bookIdInput.value = bookToEdit.id;
                titleInput.value = bookToEdit.title;
                authorInput.value = bookToEdit.author;
                yearInput.value = bookToEdit.year;
                synopsisInput.value = bookToEdit.synopsis;
                coverPreview.src = bookToEdit.cover;
                coverPreview.classList.remove('hidden');

                formTitle.textContent = 'Editando Livro';
                submitButton.textContent = 'Salvar Alterações';
                cancelButton.classList.remove('hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' }); // Rola para o topo para ver o formulário
            }
        }
    });

    // Função de reset atualizada
    const resetFormState = () => {
        bookForm.reset();
        bookIdInput.value = '';
        formTitle.textContent = 'Adicionar Novo Livro';
        submitButton.textContent = 'Adicionar Livro';
        cancelButton.classList.add('hidden');
        coverPreview.classList.add('hidden');
        coverPreview.src = '#';
    };
    
    cancelButton.addEventListener('click', resetFormState);

    // --- INICIALIZAÇÃO ---
    showPage('home');
    renderBookList();
});