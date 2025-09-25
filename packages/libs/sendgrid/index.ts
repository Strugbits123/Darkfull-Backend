import sgMail from '@sendgrid/mail';

const enabled = process.env.ENABLE_SENDGRID === 'true';
const emailSender = process.env.SENDGRID_FROM_EMAIL || 'noreply@darkhorse3pl.com';

if (enabled && process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateData?: Record<string, string | number | boolean>;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!enabled) {
    console.log('SendGrid disabled, email would be sent to:', options.to);
    console.log('Subject:', options.subject);
    console.log('Content:', options.html || options.text);
    return;
  }

  const msg = {
    to: options.to,
    from: emailSender,
    subject: options.subject,
    text: options.text || options.subject,
    html: options.html || `<p>${options.text || options.subject}</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully to:', options.to);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Email Templates
export const generateInvitationEmailTemplate = (data: {
  fullName?: string;
  storeName?: string;
  role: string;
  invitationLink: string;
  inviterName?: string;
}): string => {
  const { fullName, storeName, role, invitationLink, inviterName } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2c3e50; }
        .content { color: #333; line-height: 1.6; }
        .button { display: inline-block; background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .button:hover { background-color: #2980b9; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🐎 Dark Horse 3PL Platform</div>
        </div>
        <div class="content">
          <h2>You're Invited to Join ${storeName ? `${storeName} on ` : ''}Dark Horse 3PL Platform!</h2>
          <p>Hello${fullName ? ` ${fullName}` : ''},</p>
          <p>You have been invited${inviterName ? ` by ${inviterName}` : ''} to join as a <strong>${role.replace('_', ' ')}</strong>${storeName ? ` for ${storeName}` : ''} on the Dark Horse 3PL Platform.</p>
          <p>Dark Horse 3PL Platform is a comprehensive logistics solution that seamlessly integrates with Salla stores to provide end-to-end fulfillment services.</p>
          <p>To accept this invitation and set up your account, please click the button below:</p>
          <div style="text-align: center;">
            <a href="${invitationLink}" class="button">Accept Invitation</a>
          </div>
          <p><strong>Important:</strong> This invitation will expire in 72 hours.</p>
          <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #3498db;">${invitationLink}</p>
          <p>If you have any questions, please don't hesitate to contact our support team.</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>The Dark Horse 3PL Team</p>
          <p style="font-size: 12px;">This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export const generateSallaConnectionSuccessTemplate = (data: {
  fullName?: string;
  storeName: string;
}): string => {
  const { fullName, storeName } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #2c3e50; }
        .content { color: #333; line-height: 1.6; }
        .success-icon { font-size: 48px; color: #27ae60; text-align: center; margin: 20px 0; }
        .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🐎 Dark Horse 3PL Platform</div>
        </div>
        <div class="content">
          <div class="success-icon">✅</div>
          <h2>Salla Store Connected Successfully!</h2>
          <p>Hello${fullName ? ` ${fullName}` : ''},</p>
          <p>Congratulations! Your Salla store <strong>${storeName}</strong> has been successfully connected to the Dark Horse 3PL Platform.</p>
          <p>You can now:</p>
          <ul>
            <li>Automatically sync your products and inventory</li>
            <li>Receive and process orders seamlessly</li>
            <li>Track fulfillment in real-time</li>
            <li>Manage your warehouses and staff</li>
          </ul>
          <p>Your store integration is now live and ready to streamline your logistics operations.</p>
        </div>
        <div class="footer">
          <p>Best regards,<br>The Dark Horse 3PL Team</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
