# 📊 Análise e Correção do Onboarding - CEA UFBA

## 🔍 **Problemas Identificados**

### 1. **Onboarding Informativo vs. Funcional**
**❌ ANTES:** O onboarding original era apenas informativo
- Mostrava tutorials e dicas gerais
- **NÃO coletava nenhum dado** para preencher a tabela `user_profiles`
- Apenas marcava `has_completed_onboarding = true`

**✅ AGORA:** Onboarding funcional que coleta dados reais
- Coleta informações específicas baseadas no tipo de usuário
- Preenche todas as colunas necessárias da tabela
- Valida dados antes de salvar

### 2. **Discrepâncias na Interface TypeScript**
**❌ ANTES:** Interface com campos extras que não existem no esquema
```typescript
export interface UserProfile {
  // ... campos corretos
  course?: string;           // ❌ NÃO existe no esquema
  phone?: string;           // ❌ NÃO existe no esquema
  // ... outros campos
}
```

**✅ AGORA:** Interface alinhada com o esquema real
```typescript
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  user_type: UserType;
  department?: string;        // ✅ Coletado no onboarding
  research_area?: string;     // ✅ Coletado para professores
  bio?: string;              // ✅ Coletado para todos
  lattes_url?: string;       // ✅ Coletado para professores
  student_id?: string;       // ✅ Referência FK
  avatar_url?: string;       // ✅ Coletado opcionalmente
  is_profile_complete: boolean;
  has_completed_onboarding: boolean;
  created_at: string;
  updated_at: string;
}
```

### 3. **Cadastro Incompleto**
**❌ ANTES:** Cadastro criava perfil básico
```typescript
await supabase.from('user_profiles').insert({
  id: data.user.id,
  email: data.user.email!,
  user_type: userType,
  full_name: fullName,
  has_completed_onboarding: false,    // ❌ Nunca completava
  is_profile_complete: false          // ❌ Nunca completava
});
```

**✅ AGORA:** Onboarding completa o perfil
- Cadastro cria perfil básico
- Onboarding coleta dados restantes
- Marca `is_profile_complete = true` ao final

## 🎯 **Solução Implementada**

### **Novo Componente: `ProfileOnboarding`**

#### **Fluxo para ESTUDANTES (3 steps):**
1. **Departamento** ⭐ *obrigatório*
   - Lista completa dos departamentos da UFBA
   - Validação obrigatória

2. **Biografia** ⭐ *obrigatório*
   - Descrição de interesses acadêmicos
   - Mínimo 20 caracteres

3. **Avatar** 🔹 *opcional*
   - URL da foto de perfil
   - Fallback para iniciais do nome

#### **Fluxo para PROFESSORES (4 steps):**
1. **Departamento** ⭐ *obrigatório*
   - Lista completa dos departamentos da UFBA

2. **Área de Pesquisa** ⭐ *obrigatório*
   - Lista de 24 áreas de pesquisa comuns

3. **Biografia Acadêmica** ⭐ *obrigatório*
   - Experiência e linha de pesquisa
   - Mínimo 20 caracteres

4. **Perfil Acadêmico** 🔹 *opcional*
   - URL do Currículo Lattes
   - Avatar/foto de perfil

### **Campos Coletados por Tipo de Usuário**

| Campo | Estudante | Professor | Obrigatório | Validação |
|-------|-----------|-----------|-------------|-----------|
| `department` | ✅ | ✅ | ⭐ | Lista pré-definida |
| `research_area` | ❌ | ✅ | ⭐ | Lista pré-definida |
| `bio` | ✅ | ✅ | ⭐ | Min. 20 caracteres |
| `lattes_url` | ❌ | ✅ | 🔹 | Validação de URL |
| `avatar_url` | ✅ | ✅ | 🔹 | Validação de URL |

### **Componentes UI Criados**
- `components/ui/textarea.tsx` - Campo de texto multi-linha
- `components/ui/select.tsx` - Select HTML nativo com estilo

## ✅ **Validações Implementadas**

### **Departamentos da UFBA (27 opções)**
```typescript
"Instituto de Física", "Instituto de Química", "Instituto de Matemática",
"Instituto de Biologia", "Instituto de Geociências", "Faculdade de Medicina",
"Faculdade de Odontologia", "Escola de Enfermagem", "Faculdade de Farmácia",
"Escola Politécnica", "Instituto de Computação", "Faculdade de Arquitetura",
// ... e mais 15 departamentos
```

### **Áreas de Pesquisa (24 opções)**
```typescript
"Inteligência Artificial", "Biotecnologia", "Medicina Tropical",
"Engenharia de Software", "Nanotecnologia", "Neurociências",
"Genética", "Física Teórica", "Química Orgânica",
// ... e mais 15 áreas
```

### **Validações de Campo**
- **Departamento:** Obrigatório, deve estar na lista
- **Área de Pesquisa:** Obrigatório para professores
- **Bio:** Mínimo 20 caracteres
- **URLs:** Formato válido quando preenchidas

## 📱 **Experiência do Usuário**

### **Design Responsivo**
- Layout centrado e responsivo
- Progresso visual com barra de porcentagem  
- Navegação entre steps com botões Anterior/Próximo

### **Feedback Visual**
- Indicadores de progresso (Step X de Y)
- Validação em tempo real com mensagens de erro
- Estados de loading durante salvamento

### **Acessibilidade**
- Labels associados aos campos
- IDs únicos para cada input
- Indicação visual de campos obrigatórios (*)

## 🔄 **Fluxo Completo Atualizado**

1. **Cadastro** (`/sign-up`)
   - Coleta: email, senha, nome, tipo de usuário
   - Cria perfil básico com `has_completed_onboarding = false`

2. **Login** (`/sign-in`)
   - Verifica `has_completed_onboarding`
   - Redireciona para `/onboarding` se necessário

3. **Onboarding** (`/onboarding`)
   - Novo fluxo com `ProfileOnboarding`
   - Coleta dados específicos por tipo de usuário
   - Marca `is_profile_complete = true` e `has_completed_onboarding = true`

4. **Dashboard** (`/dashboard`)
   - Acesso liberado após onboarding completo

## 🎯 **Resultado Final**

### **Cobertura da Tabela `user_profiles`**
| Coluna | Status | Preenchimento |
|--------|--------|---------------|
| `id` | ✅ | Auto (UUID do usuário) |
| `email` | ✅ | Cadastro |
| `full_name` | ✅ | Cadastro |
| `user_type` | ✅ | Cadastro |
| `department` | ✅ | **Onboarding** |
| `research_area` | ✅ | **Onboarding** (professores) |
| `bio` | ✅ | **Onboarding** |
| `lattes_url` | ✅ | **Onboarding** (professores, opcional) |
| `student_id` | ✅ | Auto (referência FK) |
| `avatar_url` | ✅ | **Onboarding** (opcional) |
| `is_profile_complete` | ✅ | **Onboarding** (marca true ao final) |
| `has_completed_onboarding` | ✅ | **Onboarding** (marca true ao final) |
| `created_at` | ✅ | Auto (timestamp) |
| `updated_at` | ✅ | Auto (timestamp) |

### **Benefícios Alcançados**
- 🎯 **100% de cobertura** das colunas da tabela
- 📝 **Dados estruturados** coletados de forma organizada
- 🎨 **UX moderna** com validação em tempo real
- 🔧 **Código maintível** com TypeScript tipado
- ♿ **Acessível** com boas práticas de HTML

### **Próximos Passos Sugeridos**
1. Testar o fluxo completo de cadastro + onboarding
2. Adicionar upload de imagem para avatar (opcional)
3. Implementar edição de perfil no dashboard
4. Considerar adicionar @radix-ui/react-select para UX melhorada 