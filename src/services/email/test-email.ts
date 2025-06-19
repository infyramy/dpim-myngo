import { emailService } from './index';

/**
 * Test email sending functionality
 * Run this from the browser console or a test page
 */
export async function testEmailSending() {
  console.log('🧪 Testing email service...');
  
  try {
    // Test basic email sending
    const result = await emailService.sendEmail({
      to: 'your-test-email@example.com', // Replace with your actual email
      subject: 'MyNGO - Email Service Test',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2563eb;">✅ Email Service Working!</h1>
          <p>Congratulations! Your MyNGO email service is now configured with Mailjet.</p>
          <p><strong>Provider:</strong> Mailjet</p>
          <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            This is a test email to verify your email service integration.
          </p>
        </div>
      `,
      from: 'no-reply@yourdomain.com' // Make sure this matches your verified domain
    });

    console.log('📧 Email test result:', result);
    
    if (result.success) {
      console.log('✅ SUCCESS: Email sent successfully!');
      console.log('📋 Message ID:', result.data?.id);
    } else {
      console.log('❌ FAILED: Email sending failed');
      console.log('🔍 Error:', result.message);
    }
    
    return result;
    
  } catch (error) {
    console.error('💥 Email test error:', error);
    return {
      success: false,
      message: 'Test failed with exception',
      error
    };
  }
}

/**
 * Test OTP email functionality
 */
export async function testOtpEmail() {
  console.log('🔐 Testing OTP email...');
  
  try {
    const result = await emailService.sendOtpEmail(
      'your-test-email@example.com', // Replace with your actual email
      '123456'
    );
    
    console.log('🔐 OTP email result:', result);
    return result;
    
  } catch (error) {
    console.error('💥 OTP email test error:', error);
    return {
      success: false,
      message: 'OTP test failed with exception',
      error
    };
  }
}

// Export for easy console testing
if (typeof window !== 'undefined') {
  (window as any).testEmail = testEmailSending;
  (window as any).testOtp = testOtpEmail;
  console.log('🚀 Email testing functions loaded! Try: testEmail() or testOtp()');
} 