import { createClient } from '@/utils/supabase/server';

interface ProfessorStatusEmailData {
  professorEmail: string;
  professorName: string;
  status: "approved" | "rejected";
  reason?: string;
}

const generateProfessorStatusEmailHTML = (data: ProfessorStatusEmailData): string => {
  const { professorName, status, reason } = data;
  
  const isApproved = status === 'approved';
  const statusColor = isApproved ? '#16a34a' : '#dc2626';
  const statusText = isApproved ? 'Aprovada' : 'Rejeitada';
  const statusIcon = isApproved ? '✅' : '❌';

  return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Status da Conta - CEA UFBA</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8fafc;
        }
        .container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #3b82f6, #1e40af);
          color: white;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 700;
        }
        .header p {
          margin: 8px 0 0;
          opacity: 0.9;
          font-size: 16px;
        }
        .content {
          padding: 40px 30px;
        }
        .status-badge {
          display: inline-block;
          padding: 12px 24px;
          border-radius: 25px;
          font-size: 18px;
          font-weight: 600;
          text-align: center;
          margin: 20px 0;
          color: white;
          background-color: ${statusColor};
        }
        .message {
          background: #f1f5f9;
          border-left: 4px solid #3b82f6;
          padding: 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .reason {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .footer {
          background: #f8fafc;
          padding: 20px 30px;
          text-align: center;
          border-top: 1px solid #e2e8f0;
          font-size: 14px;
          color: #64748b;
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background: #3b82f6;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 600;
          margin: 20px 0;
        }
        .button:hover {
          background: #2563eb;
        }
        @media (max-width: 600px) {
          .content {
            padding: 20px;
          }
          .header {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 CEA UFBA</h1>
          <p>Centro de Estudos Avançados - Universidade Federal da Bahia</p>
        </div>
        
        <div class="content">
          <h2>Olá, ${professorName}!</h2>
          
          <div class="status-badge">
            ${statusIcon} Conta ${statusText}
          </div>
          
          <div class="message">
            <p><strong>Status da sua conta de professor:</strong></p>
            <p>Sua conta no sistema CEA UFBA foi <strong>${statusText.toLowerCase()}</strong> pela nossa equipe.</p>
          </div>
          
          ${reason ? `
            <div class="reason">
              <p><strong>Informações adicionais:</strong></p>
              <p>${reason}</p>
            </div>
          ` : ''}
          
          ${isApproved ? `
            <div class="message">
              <p><strong>Próximos passos:</strong></p>
              <ul>
                <li>Você já pode fazer login no sistema</li>
                <li>Complete seu perfil acadêmico</li>
                <li>Explore as oportunidades de pesquisa disponíveis</li>
                <li>Comece a publicar conteúdo científico</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sign-in" class="button">
                Fazer Login Agora
              </a>
            </div>
          ` : `
            <div class="message">
              <p><strong>O que fazer agora:</strong></p>
              <ul>
                <li>Verifique as informações fornecidas</li>
                <li>Entre em contato conosco se houver dúvidas</li>
                <li>Você pode tentar se cadastrar novamente com informações corretas</li>
              </ul>
            </div>
          `}
        </div>
        
        <div class="footer">
          <p>Este é um email automático do sistema CEA UFBA.</p>
          <p>Se você tem dúvidas, entre em contato conosco.</p>
          <p>&copy; 2024 Centro de Estudos Avançados - UFBA</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function sendProfessorStatusEmail(data: ProfessorStatusEmailData): Promise<void> {
  const { professorEmail, professorName, status, reason } = data;
  
  // For now, just log the email that would be sent
  // Supabase Auth doesn't have a direct API for custom emails
  // You would need to use Supabase Edge Functions or integrate with a third-party email service
  
  const subject = `CEA UFBA - Sua conta de professor foi ${status === 'approved' ? 'aprovada' : 'rejeitada'}`;
  const content = `
    Olá ${professorName},
    
    Sua conta de professor no sistema CEA UFBA foi ${status === 'approved' ? 'aprovada' : 'rejeitada'}.
    
    ${status === 'approved' 
      ? 'Você já pode fazer login no sistema e começar a usar a plataforma.' 
      : 'Entre em contato conosco se houver dúvidas sobre esta decisão.'
    }
    
    ${reason ? `Informações adicionais: ${reason}` : ''}
    
    Atenciosamente,
    Equipe CEA UFBA
  `.trim();

  // Log the email details for now
  console.log('📧 Professor Status Email (would be sent):');
  console.log('To:', professorEmail);
  console.log('Subject:', subject);
  console.log('Content:', content);
  console.log('---');

  // TODO: Implement actual email sending using:
  // 1. Supabase Edge Functions with email service
  // 2. Third-party email service (SendGrid, Resend, etc.)
  // 3. Custom SMTP configuration
  
  // For now, we'll just log it
  console.log(`✅ Email notification logged for professor ${professorEmail} (status: ${status})`);
}