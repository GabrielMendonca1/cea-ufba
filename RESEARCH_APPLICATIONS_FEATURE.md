# Funcionalidade de Gestão de Inscrições em Pesquisas

## Visão Geral

Esta funcionalidade permite que professores visualizem e gerenciem as inscrições dos estudantes em suas pesquisas através de um popup intuitivo com duas abas: **Inscrições** e **Deferidos**.

## Como Funciona

### Para Professores

1. **Acessar o Dashboard**: Entre no dashboard como professor
2. **Visualizar Pesquisas**: Na seção "Manage Research Opportunities", veja todas as suas pesquisas criadas
3. **Ver Inscrições**: Clique no botão **"Ver Inscrições"** em qualquer pesquisa
4. **Gerenciar Candidatos**: Use o popup para revisar e aprovar/rejeitar candidatos

### Interface do Popup

O popup contém duas abas principais:

#### 1. Aba "Inscrições" 
- Mostra todos os candidatos com status **"pendente"**
- Exibe informações do candidato:
  - Nome completo
  - Email
  - Matrícula (se disponível)
  - Curso
  - Carta de apresentação
  - Bio do candidato
- Botões de ação:
  - **Aceitar**: Aprova o candidato
  - **Rejeitar**: Rejeita a candidatura

#### 2. Aba "Deferidos"
- Mostra todos os candidatos **aceitos**
- Exibe as mesmas informações dos candidatos
- Não possui botões de ação (apenas visualização)

## Funcionalidades Técnicas

### Componentes Criados

1. **`ResearchApplicationsModal`** (`components/research/research-applications-modal.tsx`)
   - Modal principal com sistema de abas
   - Busca automática de inscrições
   - Interface para aprovar/rejeitar candidatos

2. **APIs Criadas**
   - **`/api/research/applications`** - Busca inscrições de uma pesquisa específica
   - **`/api/applications/update-status`** - Atualiza status de uma inscrição

### Integração

- O componente `ResearchOpportunityManager` foi atualizado
- Adicionado botão "Ver Inscrições" em cada card de pesquisa
- Estado local gerencia abertura/fechamento do modal

## Estados das Inscrições

- **`pending`**: Candidatura enviada, aguardando avaliação
- **`accepted`**: Candidatura aprovada pelo professor
- **`rejected`**: Candidatura rejeitada pelo professor
- **`withdrawn`**: Candidatura retirada pelo estudante

## Interface de Usuário

### Recursos Visuais
- **Badges coloridos** para status das inscrições
- **Avatars** dos candidatos
- **Cards organizados** com informações claras
- **Loading states** durante carregamento de dados
- **Estados vazios** quando não há inscrições

### Responsividade
- Layout adaptável para desktop e mobile
- Scroll interno para listas longas
- Modal responsivo com altura máxima

## Fluxo de Dados

1. Professor clica em "Ver Inscrições"
2. Modal abre e faz requisição para `/api/research/applications?researchId={id}`
3. API busca todas as inscrições da pesquisa no Supabase
4. Dados são exibidos separados por status (pendente/aceito)
5. Professor pode aprovar/rejeitar através de `/api/applications/update-status`
6. Interface atualiza em tempo real após ações

## Melhorias Futuras

- Notificações por email para candidatos
- Histórico de ações do professor
- Filtros avançados para candidatos
- Exportação de dados dos candidatos
- Dashboard com métricas de inscrições
- Sistema de comentários para avaliações

## Estrutura do Banco de Dados

### Tabela `applications`
```sql
- id: uuid (PK)
- student_id: uuid (FK para user_profiles)
- research_opportunity_id: uuid (FK para research_opportunities)
- status: text ('pending', 'accepted', 'rejected', 'withdrawn')
- cover_letter: text
- created_at: timestamp
- updated_at: timestamp
```

### Relacionamentos
- `applications.student_id` → `user_profiles.id`
- `applications.research_opportunity_id` → `research_opportunities.id`

## Como Testar

1. Crie uma conta como professor
2. Crie uma pesquisa
3. Crie uma conta como estudante
4. Candidate-se à pesquisa
5. Volte para a conta do professor
6. Clique em "Ver Inscrições" na pesquisa
7. Teste as funcionalidades de aprovação/rejeição 