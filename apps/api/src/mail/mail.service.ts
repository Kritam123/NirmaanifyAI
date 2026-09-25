import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { UserRole } from '@nirmaanify/types';

export interface WorkspaceInvitationEmailOptions {
  to: string;
  inviterName: string;
  inviterEmail: string;
  workspaceName: string;
  role: UserRole;
  token: string;
  expiresAt: Date;
}

export interface EmailVerificationOptions {
  to: string;
  name: string;
  token: string;
  otp: string;
  expiresAt: Date;
}

export interface PasswordResetEmailOptions {
  to: string;
  name?: string;
  token: string;
  expiresAt: Date;
}

export interface EmailSendResult {
  success: boolean;
  delivered: boolean;
  message: string;
  messageId?: string;
  inviteLink?: string;
  verifyLink?: string;
  resetLink?: string;
  otp?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly appUrl: string;
  private readonly fromAddress: string;
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    const rawAppUrl = (this.configService.get<string>('APP_URL') || process.env.APP_URL || 'http://localhost:3000').trim();
    this.appUrl = (rawAppUrl.startsWith('http://') || rawAppUrl.startsWith('https://'))
      ? rawAppUrl
      : `https://${rawAppUrl}`;
    this.fromAddress =
      this.configService.get<string>('SMTP_FROM') ||
      '"Nirmaanify AI" <noreply@nirmaanify.ai>';

    const user = (this.configService.get<string>('SMTP_USER') || process.env.SMTP_USER || '').replace(/^["']|["']$/g, '').trim();
    const pass = (this.configService.get<string>('SMTP_PASS') || process.env.SMTP_PASS || '').replace(/^["']|["']$/g, '').trim();

    if (user && pass) {
      this.logger.log(`✓ Real Gmail / SMTP mailer ready for user: ${user}`);
    } else {
      this.logger.warn(
        '⚠️ SMTP_USER / SMTP_PASS not configured in .env. Real emails require Gmail App Password.'
      );
    }
  }

  /**
   * Formats the sender From header cleanly with brand name
   */
  public getFromHeader(): string {
    const user = (this.configService.get<string>('SMTP_USER') || process.env.SMTP_USER || '').replace(/^["']|["']$/g, '').trim();
    const rawFrom = (this.configService.get<string>('SMTP_FROM') || process.env.SMTP_FROM || '').replace(/^["']|["']$/g, '').trim();

    if (rawFrom.includes('<') && rawFrom.includes('>')) {
      return rawFrom;
    }
    if (rawFrom.includes('@')) {
      return `"Nirmaanify AI" <${rawFrom}>`;
    }
    if (user) {
      return `"Nirmaanify AI" <${user}>`;
    }
    return '"Nirmaanify AI" <noreply@nirmaanify.ai>';
  }

  /**
   * Returns active cached or freshly built transporter
   */
  public getTransporter(): nodemailer.Transporter | null {
    if (!this.transporter) {
      this.transporter = this.createTransporter();
    }
    return this.transporter;
  }

  /**
   * Builds an active nodemailer Transporter
   */
  private createTransporter(): nodemailer.Transporter | null {
    const rawUser = (this.configService.get<string>('SMTP_USER') || process.env.SMTP_USER || '').trim();
    const rawPass = (this.configService.get<string>('SMTP_PASS') || process.env.SMTP_PASS || '').trim();
    const user = rawUser.replace(/^["']|["']$/g, '').trim();
    const pass = rawPass.replace(/^["']|["']$/g, '').replace(/\s+/g, ''); // Strip quotes and spaces from Gmail App Passwords
    const host = (this.configService.get<string>('SMTP_HOST') || process.env.SMTP_HOST || 'smtp.gmail.com').replace(/^["']|["']$/g, '').trim();
    const port = Number(this.configService.get<number>('SMTP_PORT') || process.env.SMTP_PORT || 465);

    if (!user || !pass) {
      return null;
    }

    // Google Gmail SMTP SSL Transport
    if (host === 'smtp.gmail.com' || user.toLowerCase().endsWith('@gmail.com')) {
      return nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
      });
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
      connectionTimeout: 15000,
    });
  }

  /**
   * Send a professional, responsive workspace invitation email
   */
  async sendWorkspaceInvitation(options: WorkspaceInvitationEmailOptions): Promise<EmailSendResult> {
    const inviteLink = `${this.appUrl}/invite?token=${encodeURIComponent(options.token)}`;
    const formattedExpiry = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    }).format(options.expiresAt);

    const subject = `Join "${options.workspaceName}" on Nirmaanify AI`;
    const htmlContent = this.generateInvitationHtml({
      ...options,
      inviteLink,
      formattedExpiry,
    });
    const textContent = `
Hello,

${options.inviterName} (${options.inviterEmail}) has invited you to join the "${options.workspaceName}" workspace on Nirmaanify AI as a [${options.role}].

Click the link below to accept the invitation and start collaborating:
${inviteLink}

This invitation will expire on ${formattedExpiry}.

If you did not expect this invitation, you can safely ignore this email.

— The Nirmaanify AI Team
    `.trim();

    const transporter = this.getTransporter();

    if (transporter) {
      try {
        const fromHeader = this.getFromHeader();

        const info = await transporter.sendMail({
          from: fromHeader,
          to: options.to,
          subject,
          text: textContent,
          html: htmlContent,
        });

        this.logger.log(
          `✉️ Real Gmail invitation successfully sent to ${options.to} (Message ID: ${info.messageId})`
        );
        return {
          success: true,
          delivered: true,
          message: `Email successfully delivered to ${options.to}`,
          messageId: info.messageId,
          inviteLink,
        };
      } catch (error: any) {
        this.logger.error(
          `❌ Gmail SMTP error sending to ${options.to}: ${error?.message}`,
          error?.stack
        );
        return {
          success: false,
          delivered: false,
          message: `Gmail SMTP Error: ${error?.message || 'Failed to authenticate or send email'}`,
          inviteLink,
        };
      }
    } else {
      this.logger.warn(
        `\n=======================================================\n✉️ [DEV EMAIL SIMULATOR] Workspace Invitation\nTo: ${options.to}\nSubject: ${subject}\nWorkspace: ${options.workspaceName} (Role: ${options.role})\nInvite Link: ${inviteLink}\nExpires: ${formattedExpiry}\n⚠️ Note: To send via real Gmail inbox, configure SMTP_USER & SMTP_PASS in .env\n=======================================================\n`
      );
      return {
        success: true,
        delivered: false,
        message: `Invitation generated. Set SMTP_USER and SMTP_PASS in .env to deliver real Gmail messages.`,
        inviteLink,
      };
    }
  }

  /**
   * Send a professional, responsive account email verification message
   */
  async sendEmailVerification(options: EmailVerificationOptions): Promise<EmailSendResult> {
    const verifyLink = `${this.appUrl}/verify-email?token=${encodeURIComponent(options.token)}&email=${encodeURIComponent(options.to)}`;
    const formattedExpiry = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    }).format(options.expiresAt);

    const subject = `Verify your Nirmaanify AI account - ${options.otp}`;
    const htmlContent = this.generateVerificationHtml({
      ...options,
      verifyLink,
      formattedExpiry,
    });
    const textContent = `
Hello ${options.name},

Welcome to Nirmaanify AI! Please confirm your email address to activate your account.

Your 6-Digit Verification Code:
${options.otp}

Or click the link below to verify automatically:
${verifyLink}

This verification code and link will expire on ${formattedExpiry}.

If you did not create an account on Nirmaanify AI, please ignore this email.

— The Nirmaanify AI Team
    `.trim();

    const transporter = this.getTransporter();

    if (transporter) {
      try {
        const fromHeader = this.getFromHeader();

        const info = await transporter.sendMail({
          from: fromHeader,
          to: options.to,
          subject,
          text: textContent,
          html: htmlContent,
        });

        this.logger.log(
          `✉️ Real Gmail verification email sent to ${options.to} (Message ID: ${info.messageId})`
        );
        return {
          success: true,
          delivered: true,
          message: `Verification email delivered to ${options.to}`,
          messageId: info.messageId,
          verifyLink,
          otp: options.otp,
        };
      } catch (error: any) {
        this.logger.error(
          `❌ Gmail SMTP error sending verification to ${options.to}: ${error?.message}`,
          error?.stack
        );
        return {
          success: false,
          delivered: false,
          message: `Gmail SMTP Error: ${error?.message || 'Failed to authenticate or send email'}`,
          verifyLink,
          otp: options.otp,
        };
      }
    } else {
      this.logger.warn(
        `\n=======================================================\n✉️ [DEV EMAIL SIMULATOR] Email Verification\nTo: ${options.to} (${options.name})\nSubject: ${subject}\nVerification Code (OTP): ${options.otp}\nVerify Link: ${verifyLink}\nExpires: ${formattedExpiry}\n⚠️ Note: To send via real Gmail inbox, configure SMTP_USER & SMTP_PASS in .env\n=======================================================\n`
      );
      return {
        success: true,
        delivered: false,
        message: `Verification code generated. Set SMTP_USER and SMTP_PASS in .env to deliver real Gmail messages.`,
        verifyLink,
        otp: options.otp,
      };
    }
  }

  /**
   * Send a secure, real password reset email with recovery link
   */
  async sendPasswordReset(options: PasswordResetEmailOptions): Promise<EmailSendResult> {
    const resetLink = `${this.appUrl}/reset-password?token=${encodeURIComponent(options.token)}`;
    const formattedExpiry = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZoneName: 'short',
    }).format(options.expiresAt);

    const displayName = options.name || options.to.split('@')[0];
    const subject = 'Reset your Nirmaanify AI password';
    const htmlContent = this.generatePasswordResetHtml({
      to: options.to,
      name: displayName,
      token: options.token,
      resetLink,
      formattedExpiry,
    });
    const textContent = `
Hello ${displayName},

We received a request to reset the password for your Nirmaanify AI account.

Click the link below to securely choose a new password:
${resetLink}

This password reset link will expire on ${formattedExpiry} (valid for 1 hour).

If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.

— The Nirmaanify AI Team
    `.trim();

    const transporter = this.getTransporter();

    if (transporter) {
      try {
        const fromHeader = this.getFromHeader();

        const info = await transporter.sendMail({
          from: fromHeader,
          to: options.to,
          subject,
          text: textContent,
          html: htmlContent,
        });

        this.logger.log(
          `✉️ Real Gmail password reset email sent to ${options.to} (Message ID: ${info.messageId})`
        );
        return {
          success: true,
          delivered: true,
          message: `Password reset email delivered to ${options.to}`,
          messageId: info.messageId,
          resetLink,
        };
      } catch (error: any) {
        this.logger.error(
          `❌ Gmail SMTP error sending password reset to ${options.to}: ${error?.message}`,
          error?.stack
        );
        return {
          success: false,
          delivered: false,
          message: `Gmail SMTP Error: ${error?.message || 'Failed to authenticate or send email'}`,
          resetLink,
        };
      }
    } else {
      this.logger.warn(
        `\n=======================================================\n✉️ [DEV EMAIL SIMULATOR] Password Reset\nTo: ${options.to} (${displayName})\nSubject: ${subject}\nReset Link: ${resetLink}\nExpires: ${formattedExpiry}\n⚠️ Note: To send via real Gmail inbox, configure SMTP_USER & SMTP_PASS in .env\n=======================================================\n`
      );
      return {
        success: true,
        delivered: false,
        message: `Password reset link generated. Set SMTP_USER and SMTP_PASS in .env to deliver real Gmail messages.`,
        resetLink,
      };
    }
  }

  /**
   * Generates a modern, responsive HTML email template for account email verification
   */
  private generateVerificationHtml(data: {
    to: string;
    name: string;
    token: string;
    otp: string;
    verifyLink: string;
    formattedExpiry: string;
  }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your Email Address</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #090A0F;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #F8FAFC;
    }
    .container {
      max-width: 580px;
      margin: 40px auto;
      background: #0F111A;
      border: 1px solid #24293D;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .header-bar {
      height: 6px;
      background: linear-gradient(90deg, #635BFF 0%, #8B5CF6 50%, #22D3EE 100%);
    }
    .content {
      padding: 40px 36px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 32px;
    }
    .brand-logo {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #635BFF, #22D3EE);
      border-radius: 10px;
      display: inline-block;
      text-align: center;
      line-height: 36px;
      font-weight: 900;
      color: #FFFFFF;
      font-size: 18px;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      margin-left: 10px;
      vertical-align: middle;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      margin: 0 0 12px 0;
      line-height: 1.3;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #94A3B8;
      margin: 0 0 24px 0;
    }
    .otp-box {
      background: #161926;
      border: 1.5px dashed #635BFF;
      border-radius: 16px;
      padding: 24px;
      text-align: center;
      margin: 28px 0;
    }
    .otp-title {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #A5AEFD;
      margin-bottom: 8px;
    }
    .otp-code {
      font-family: 'Courier New', Courier, monospace;
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 8px;
      color: #FFFFFF;
      margin: 0;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, #635BFF 0%, #8B5CF6 100%);
      color: #FFFFFF !important;
      font-weight: 700;
      font-size: 15px;
      text-decoration: none;
      padding: 16px 36px;
      border-radius: 14px;
      box-shadow: 0 10px 25px -5px rgba(99, 91, 255, 0.4);
    }
    .link-fallback {
      background: #141724;
      border-radius: 10px;
      padding: 12px;
      font-family: monospace;
      font-size: 12px;
      color: #818CF8;
      word-break: break-all;
      margin-top: 12px;
    }
    .footer {
      padding: 24px 36px;
      background: #090A0F;
      border-top: 1px solid #1E2337;
      text-align: center;
      font-size: 12px;
      color: #475569;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-bar"></div>
    <div class="content">
      <div class="brand">
        <span class="brand-logo">N</span>
        <span class="brand-name">Nirmaanify AI</span>
      </div>

      <h1>Welcome to Nirmaanify AI, ${data.name}!</h1>
      <p>
        Please verify your email address to unlock your full development studio and start collaborating.
      </p>

      <div class="otp-box">
        <div class="otp-title">Your 6-Digit Verification Code</div>
        <div class="otp-code">${data.otp}</div>
      </div>

      <div class="btn-container">
        <a href="${data.verifyLink}" class="btn-primary" target="_blank">
          Verify Email Address 🚀
        </a>
      </div>

      <p style="font-size: 12px; color: #64748B; margin-top: 24px; margin-bottom: 6px;">
        Or click the direct verification link:
      </p>
      <div class="link-fallback">
        ${data.verifyLink}
      </div>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Nirmaanify AI Inc. Multi-Tenant Cloud Architecture.</p>
      <p>If you did not sign up for Nirmaanify AI, you can safely ignore this email.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generates a modern, responsive HTML email template for workspace invitations
   */
  private generateInvitationHtml(data: {
    to: string;
    inviterName: string;
    inviterEmail: string;
    workspaceName: string;
    role: UserRole;
    inviteLink: string;
    formattedExpiry: string;
  }): string {
    const roleColors: Record<UserRole, { bg: string; text: string; border: string }> = {
      OWNER: { bg: '#EEF2FF', text: '#4F46E5', border: '#C7D2FE' },
      ADMIN: { bg: '#FDF2F8', text: '#DB2777', border: '#FBCFE8' },
      DEVELOPER: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
      EDITOR: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
      VIEWER: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
      MEMBER: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0' },
    };

    const roleBadge = roleColors[data.role] || roleColors.DEVELOPER;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Workspace Invitation</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #090A0F;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #F8FAFC;
    }
    .container {
      max-width: 580px;
      margin: 40px auto;
      background: #0F111A;
      border: 1px solid #24293D;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .header-bar {
      height: 6px;
      background: linear-gradient(90deg, #635BFF 0%, #8B5CF6 50%, #22D3EE 100%);
    }
    .content {
      padding: 40px 36px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 32px;
    }
    .brand-logo {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #635BFF, #22D3EE);
      border-radius: 10px;
      display: inline-block;
      text-align: center;
      line-height: 36px;
      font-weight: 900;
      color: #FFFFFF;
      font-size: 18px;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      margin-left: 10px;
      vertical-align: middle;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #94A3B8;
      margin: 0 0 24px 0;
    }
    .invite-card {
      background: #161926;
      border: 1px solid #24293D;
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 32px;
    }
    .role-badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.5px;
      background: ${roleBadge.bg};
      color: ${roleBadge.text};
      border: 1px solid ${roleBadge.border};
    }
    .btn-container {
      text-align: center;
      margin: 32px 0;
    }
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, #635BFF 0%, #8B5CF6 100%);
      color: #FFFFFF !important;
      font-weight: 700;
      font-size: 15px;
      text-decoration: none;
      padding: 16px 36px;
      border-radius: 14px;
      box-shadow: 0 10px 25px -5px rgba(99, 91, 255, 0.4);
      transition: all 0.2s ease;
    }
    .link-fallback {
      background: #141724;
      border-radius: 10px;
      padding: 12px;
      font-family: monospace;
      font-size: 12px;
      color: #818CF8;
      word-break: break-all;
      margin-top: 12px;
    }
    .footer {
      padding: 24px 36px;
      background: #090A0F;
      border-top: 1px solid #1E2337;
      text-align: center;
      font-size: 12px;
      color: #475569;
    }
    .footer p {
      margin: 4px 0;
      color: #475569;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-bar"></div>
    <div class="content">
      <div class="brand">
        <span class="brand-logo">N</span>
        <span class="brand-name">Nirmaanify AI</span>
      </div>

      <h1>You're invited to collaborate!</h1>
      <p>
        <strong style="color: #F8FAFC;">${data.inviterName}</strong> (<span style="color: #818CF8;">${data.inviterEmail}</span>) has invited you to join the multi-tenant development studio <strong style="color: #F8FAFC;">"${data.workspaceName}"</strong>.
      </p>

      <div class="invite-card">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #64748B;">Workspace:</td>
            <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #FFFFFF; text-align: right;">${data.workspaceName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #64748B; border-top: 1px solid #1E2337;">Assigned Role:</td>
            <td style="padding: 8px 0; text-align: right; border-top: 1px solid #1E2337;">
              <span class="role-badge">${data.role}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 13px; color: #64748B; border-top: 1px solid #1E2337;">Expires:</td>
            <td style="padding: 8px 0; font-size: 12px; color: #94A3B8; text-align: right; border-top: 1px solid #1E2337;">${data.formattedExpiry}</td>
          </tr>
        </table>
      </div>

      <div class="btn-container">
        <a href="${data.inviteLink}" class="btn-primary" target="_blank">
          Accept Invitation & Join Studio 🚀
        </a>
      </div>

      <p style="font-size: 12px; color: #64748B; margin-top: 24px; margin-bottom: 6px;">
        Button not working? Copy and paste this URL into your browser:
      </p>
      <div class="link-fallback">
        ${data.inviteLink}
      </div>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Nirmaanify AI Inc. Multi-Tenant Cloud Architecture.</p>
      <p>If you did not expect this invitation, you can safely disregard this email.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Generates a modern, responsive HTML email template for password reset requests
   */
  private generatePasswordResetHtml(data: {
    to: string;
    name: string;
    token: string;
    resetLink: string;
    formattedExpiry: string;
  }): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your Nirmaanify AI Password</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #090A0F;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #F8FAFC;
    }
    .container {
      max-width: 580px;
      margin: 40px auto;
      background: #0F111A;
      border: 1px solid #24293D;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }
    .header-bar {
      height: 6px;
      background: linear-gradient(90deg, #635BFF 0%, #8B5CF6 50%, #22D3EE 100%);
    }
    .content {
      padding: 40px 36px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 32px;
    }
    .brand-logo {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #635BFF, #22D3EE);
      border-radius: 10px;
      display: inline-block;
      text-align: center;
      line-height: 36px;
      font-weight: 900;
      color: #FFFFFF;
      font-size: 18px;
    }
    .brand-name {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      margin-left: 10px;
      vertical-align: middle;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      margin: 0 0 12px 0;
      line-height: 1.3;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #94A3B8;
      margin: 0 0 24px 0;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, #635BFF 0%, #8B5CF6 100%);
      color: #FFFFFF !important;
      font-weight: 700;
      font-size: 15px;
      text-decoration: none;
      padding: 16px 36px;
      border-radius: 14px;
      box-shadow: 0 10px 25px -5px rgba(99, 91, 255, 0.4);
    }
    .notice-box {
      background: #161926;
      border: 1px solid #24293D;
      border-radius: 12px;
      padding: 16px;
      margin: 24px 0;
      font-size: 13px;
      color: #94A3B8;
    }
    .link-fallback {
      background: #141724;
      border-radius: 10px;
      padding: 12px;
      font-family: monospace;
      font-size: 12px;
      color: #818CF8;
      word-break: break-all;
      margin-top: 12px;
    }
    .footer {
      padding: 24px 36px;
      background: #090A0F;
      border-top: 1px solid #1E2337;
      text-align: center;
      font-size: 12px;
      color: #475569;
    }
    .footer p {
      margin: 4px 0;
      color: #475569;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header-bar"></div>
    <div class="content">
      <div class="brand">
        <span class="brand-logo">N</span>
        <span class="brand-name">Nirmaanify AI</span>
      </div>

      <h1>Password Reset Request</h1>
      <p>
        Hello ${data.name}, we received a request to reset your password for your Nirmaanify AI account.
      </p>

      <div class="btn-container">
        <a href="${data.resetLink}" class="btn-primary" target="_blank">
          Reset Your Password 🔐
        </a>
      </div>

      <div class="notice-box">
        ⏱️ This password reset link will expire on <strong>${data.formattedExpiry}</strong> (valid for 1 hour).
      </div>

      <p style="font-size: 12px; color: #64748B; margin-top: 24px; margin-bottom: 6px;">
        Button not working? Copy and paste this URL directly into your browser:
      </p>
      <div class="link-fallback">
        ${data.resetLink}
      </div>

      <p style="font-size: 12px; color: #64748B; margin-top: 24px;">
        If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Nirmaanify AI Inc. Multi-Tenant Cloud Architecture.</p>
      <p>Secure Enterprise Developer Cloud Platform.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

