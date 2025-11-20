import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
    try {
        // Parse the request body
        const body = await request.json();
        const { name, email, subject, message } = body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { error: 'All fields are required' },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: 'Invalid email address' },
                { status: 400 }
            );
        }

        // Validate message length
        if (message.length < 10) {
            return NextResponse.json(
                { error: 'Message must be at least 10 characters long' },
                { status: 400 }
            );
        }

        // Get email configuration from environment variables
        const toEmail = process.env.CONTACT_EMAIL_TO || 'contact@multigyan.com';
        const fromEmail = process.env.CONTACT_EMAIL_FROM || 'onboarding@resend.dev';

        // Send email using Resend
        const data = await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            replyTo: email,
            subject: `Contact Form: ${subject}`,
            html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Form Submission</h1>
            </div>
            
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #667eea; margin-top: 0; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Contact Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 10px 0; font-weight: bold; color: #555; width: 100px;">Name:</td>
                    <td style="padding: 10px 0; color: #333;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-weight: bold; color: #555;">Email:</td>
                    <td style="padding: 10px 0;">
                      <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 0; font-weight: bold; color: #555;">Subject:</td>
                    <td style="padding: 10px 0; color: #333;">${subject}</td>
                  </tr>
                </table>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px;">
                <h2 style="color: #667eea; margin-top: 0; font-size: 18px; border-bottom: 2px solid #667eea; padding-bottom: 10px;">Message</h2>
                <div style="color: #333; white-space: pre-wrap; line-height: 1.8;">${message}</div>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: #e8f4f8; border-left: 4px solid #667eea; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #555;">
                  <strong>💡 Tip:</strong> You can reply directly to this email to respond to ${name}.
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; padding: 20px; color: #999; font-size: 12px;">
              <p style="margin: 0;">This email was sent from the MultiGyan contact form</p>
              <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} MultiGyan. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
            text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
You can reply directly to this email to respond to ${name}.
      `.trim()
        });

        return NextResponse.json(
            {
                success: true,
                message: 'Email sent successfully',
                id: data.id
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Contact form error:', error);

        // Handle specific Resend errors
        if (error.message?.includes('API key')) {
            return NextResponse.json(
                { error: 'Email service configuration error. Please contact support.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to send email. Please try again later.' },
            { status: 500 }
        );
    }
}
