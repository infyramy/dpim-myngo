import { configService } from "@/services/config";
import type { EmailOptions, EmailResponse } from "@/types/email";

/**
 * Email service supporting multiple providers (Mailjet, Plunk)
 */
export class EmailService {
  private apiKey: string;
  private baseUrl: string;
  private defaultFromEmail: string;
  private provider: "mailjet" | "plunk";

  constructor() {
    // Check which provider is configured
    this.provider = configService.email.mailjetApiKey ? "mailjet" : "plunk";

    if (this.provider === "mailjet") {
      this.apiKey = configService.email.mailjetApiKey;
      this.baseUrl = "https://api.mailjet.com/v3.1";
    } else {
      this.apiKey = configService.email.plunkApiKey;
      this.baseUrl = "https://api.useplunk.com/v1";
    }

    this.defaultFromEmail = configService.email.defaultFromEmail;
  }

  /**
   * Send an email using the configured provider
   */
  async sendEmail(options: EmailOptions): Promise<EmailResponse> {
    try {
      // If no API key is provided, log a warning and return a fake success response in development
      if (!this.apiKey) {
        console.warn(
          `${this.provider.toUpperCase()}_API_KEY is not set. Email would have been sent with the following details:`,
          options
        );

        if (configService.isDevelopment) {
          return {
            success: true,
            message: "Email sending simulated in development mode",
            data: {
              id: "dev-email-id",
              to: options.to,
              subject: options.subject || "No Subject",
              createdAt: new Date().toISOString(),
            },
          };
        }

        throw new Error(
          `${this.provider.toUpperCase()}_API_KEY is not configured`
        );
      }

      if (this.provider === "mailjet") {
        return await this.sendWithMailjet(options);
      } else {
        return await this.sendWithPlunk(options);
      }
    } catch (error: any) {
      console.error("Error sending email:", error);

      return {
        success: false,
        message: error.message || "Failed to send email",
        error,
      };
    }
  }

  /**
   * Send email using Mailjet API
   */
  private async sendWithMailjet(options: EmailOptions): Promise<EmailResponse> {
    const response = await fetch(`${this.baseUrl}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${this.apiKey}:${configService.email.mailjetSecretKey}`
        ).toString("base64")}`,
      },
      body: JSON.stringify({
        Messages: [
          {
            From: {
              Email: options.from || this.defaultFromEmail,
              Name: options.fromName || "MyNGO",
            },
            To: Array.isArray(options.to)
              ? options.to.map((email) => ({ Email: email }))
              : [{ Email: options.to }],
            Subject: options.subject,
            HTMLPart: options.body,
            TextPart: options.textBody,
            ...(options.replyTo && { ReplyTo: { Email: options.replyTo } }),
            ...(options.templateId && {
              TemplateID: parseInt(options.templateId),
            }),
            ...(options.variables && { Variables: options.variables }),
          },
        ],
      }),
    });

    const data = await response.json();

    console.log("Response from Mailjet: ", data);

    if (!response.ok) {
      throw new Error(data.ErrorMessage || "Failed to send email via Mailjet");
    }

    return {
      success: true,
      message: "Email sent successfully via Mailjet",
      data: {
        id: data.Messages[0].To[0].MessageID,
        to: options.to,
        subject: options.subject || "No Subject",
        createdAt: new Date().toISOString(),
      },
    };
  }

  /**
   * Send email using Plunk API (legacy support)
   */
  private async sendWithPlunk(options: EmailOptions): Promise<EmailResponse> {
    const response = await fetch(`${this.baseUrl}/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        to: options.to,
        subject: options.subject,
        body: options.body,
        from: options.from || this.defaultFromEmail,
        replyTo: options.replyTo,
        templateId: options.templateId,
        variables: options.variables,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send email via Plunk");
    }

    return {
      success: true,
      message: "Email sent successfully via Plunk",
      data: data,
    };
  }

  /**
   * Send an email using a template
   */
  async sendTemplateEmail(
    to: string | string[],
    templateId: string,
    variables: Record<string, any>,
    options: Partial<EmailOptions> = {}
  ): Promise<EmailResponse> {
    return this.sendEmail({
      to,
      templateId,
      variables,
      ...options,
    });
  }

  /**
   * Send OTP email for authentication
   */
  async sendOtpEmail(
    to: string,
    otpCode: string,
    options: Partial<EmailOptions> = {}
  ): Promise<EmailResponse> {
    const body = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #333; text-align: center;">Login Verification Code</h1>
        <p style="color: #666; font-size: 16px;">
          You have requested to sign in to your account. Please use the verification code below:
        </p>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
          <h2 style="color: #2563eb; font-size: 32px; letter-spacing: 4px; margin: 0;">${otpCode}</h2>
        </div>
        <p style="color: #666; font-size: 14px;">
          This code will expire in 10 minutes. If you didn't request this code, please ignore this email.
        </p>
        <p style="color: #999; font-size: 12px; margin-top: 30px;">
          Best regards,<br>The MyNGO Team
        </p>
      </div>
    `;

    return this.sendEmail({
      to,
      subject: "Your Login Verification Code",
      body,
      ...options,
    });
  }

  /**
   * Send a welcome email to a new user
   */
  async sendWelcomeEmail(
    to: string,
    name: string,
    options: Partial<EmailOptions> = {}
  ): Promise<EmailResponse> {
    // You would typically have a template ID for welcome emails
    // const templateId = 'welcome-email-template-id';

    // For now, we'll use a simple HTML body
    const body = `
      <h1>Welcome to MyNGO, ${name}!</h1>
      <p>Thank you for joining our platform. We're excited to have you on board.</p>
      <p>If you have any questions or need assistance, feel free to reply to this email.</p>
      <p>Best regards,<br>The MyNGO Team</p>
    `;

    return this.sendEmail({
      to,
      subject: "Welcome to MyNGO!",
      body,
      ...options,
    });
  }

  /**
   * Send a password reset email
   */
  async sendPasswordResetEmail(
    to: string,
    resetLink: string,
    options: Partial<EmailOptions> = {}
  ): Promise<EmailResponse> {
    const body = `
      <h1>Password Reset</h1>
      <p>You've requested to reset your password. Click the link below to proceed:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <p>If you didn't request this, you can safely ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
      <p>Best regards,<br>The MyNGO Team</p>
    `;

    return this.sendEmail({
      to,
      subject: "Password Reset Request",
      body,
      ...options,
    });
  }
}

// Export a singleton instance
export const emailService = new EmailService();
