# Funcionalidade de Posts Científicos

## Visão Geral

Foi implementada uma funcionalidade completa de posts científicos onde apenas professores podem criar posts e todos os usuários podem visualizá-los. A funcionalidade segue o esquema do banco de dados fornecido, utilizando as tabelas `posts` e `scientific_outreach`.

## Estrutura do Banco de Dados

### Tabela `posts`
- `id`: UUID (Primary Key)
- `content_markdown`: Conteúdo do post em formato Markdown
- `created_at`: Data de criação
- `updated_at`: Data de atualização

### Tabela `scientific_outreach`
- `id`: UUID (Primary Key)
- `professor_id`: UUID (Foreign Key para `user_profiles`)
- `post_id`: UUID (Foreign Key única para `posts`)
- `title`: Título do post
- `description`: Descrição breve do post
- `created_at`: Data de criação
- `updated_at`: Data de atualização

## Funcionalidades Implementadas

### 1. APIs
- **POST `/api/posts/create`**: Permite que apenas professores criem posts
- **GET `/api/posts`**: Lista todos os posts públicos com informações do autor

### 2. Componentes

#### `PostManager` (`components/posts/PostManager.tsx`)
- Gerencia a exibição e criação de posts para professores
- Lista todos os posts existentes
- Botão para criar novos posts
- Integrado ao dashboard do professor

#### `CreatePostModal` (`components/posts/CreatePostModal.tsx`)
- Modal para criação de posts
- Campos: título, descrição e conteúdo em Markdown
- Validação de campos obrigatórios
- Interface intuitiva e responsiva

### 3. Páginas

#### Página de Posts (`app/posts/page.tsx`)
- Lista pública de todos os posts científicos
- Renderização de conteúdo Markdown
- Informações do autor (nome, departamento, data)
- Design responsivo e profissional
- Acessível a todos os usuários (estudantes e professores)

### 4. Navegação
- Link "Posts" adicionado à navegação principal
- Acessível através do menu superior

## Controle de Acesso

### Criação de Posts
- **Restrição**: Apenas professores (`user_type = 'professor'`)
- **Verificação**: API verifica o tipo de usuário antes de permitir criação
- **Interface**: Botão de criar post só aparece para professores no dashboard

### Visualização de Posts
- **Acesso**: Público para todos os usuários
- **Página**: `/posts` acessível a estudantes e professores
- **Conteúdo**: Posts exibidos com informações do autor

## Fluxo de Criação de Posts

1. Professor acessa o dashboard
2. Visualiza a seção "Posts Científicos"
3. Clica em "Criar Post"
4. Preenche o modal com:
   - Título
   - Descrição
   - Conteúdo em Markdown
5. Submete o formulário
6. API cria entrada na tabela `posts`
7. API cria entrada na tabela `scientific_outreach`
8. Post aparece na lista pública

## Tipos TypeScript Atualizados

### `lib/database.types.ts`
- Adicionadas interfaces para `posts` e `scientific_outreach`
- Definições completas de Row, Insert e Update
- Relacionamentos entre tabelas configurados

## Tecnologias Utilizadas

- **Markdown**: Renderização com `react-markdown`
- **UI**: Componentes shadcn/ui
- **Styling**: Tailwind CSS com classes prose para markdown
- **Validação**: Verificação server-side e client-side
- **Supabase**: Para operações de banco de dados

## Próximos Passos Sugeridos

1. **Funcionalidades Avançadas**:
   - Edição e exclusão de posts
   - Sistema de comentários
   - Categorização por área de pesquisa
   - Sistema de likes/favoritos

2. **Melhorias de UX**:
   - Preview de markdown em tempo real
   - Upload de imagens para posts
   - Tags/keywords para posts
   - Busca e filtros

3. **Moderação**:
   - Sistema de moderação de posts
   - Relatórios de conteúdo inadequado
   - Aprovação de posts antes da publicação

## Como Testar

1. **Como Professor**:
   - Faça login como professor
   - Acesse o dashboard
   - Veja a seção "Posts Científicos"
   - Clique em "Criar Post"
   - Preencha e submeta um post

2. **Como Estudante**:
   - Acesse `/posts` 
   - Visualize os posts publicados pelos professores
   - Leia o conteúdo renderizado em markdown

3. **API Testing**:
   - Use ferramentas como Postman para testar as APIs
   - Verifique as permissões de acesso
   - Teste com diferentes tipos de usuário 