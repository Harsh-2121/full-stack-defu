import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendPermissionRequest(
  adminEmail: string,
  requestData: {
    id: string;
    userEmail: string;
    serverName: string;
    serverDescription: string;
  }
) {
  const approveUrl = `${process.env.SERVER_URL}/api/permissions/${requestData.id}/approve`;
  const rejectUrl = `${process.env.SERVER_URL}/api/permissions/${requestData.id}/reject`;

  const mailOptions = {
    from: process.env.SMTP_USER,
    to: adminEmail,
    subject: `New Server Creation Request: ${requestData.serverName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Public Server Creation Request</h2>
        <p>A user has requested permission to create a public server:</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Server Name:</strong> ${requestData.serverName}</p>
          <p><strong>Description:</strong> ${requestData.serverDescription}</p>
          <p><strong>Requested by:</strong> ${requestData.userEmail}</p>
        </div>
        
        <div style="margin: 30px 0;">
          <a href="${approveUrl}" 
             style="background: #10b981; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px; margin-right: 10px;
                    display: inline-block;">
            Approve Request
          </a>
          <a href="${rejectUrl}" 
             style="background: #ef4444; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 6px;
                    display: inline-block;">
            Reject Request
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This is an automated message from your Chat App system.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Permission request email sent to:', adminEmail);
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function sendPermissionResponse(
  userEmail: string,
  serverName: string,
  approved: boolean
) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: userEmail,
    subject: `Server Creation Request ${approved ? 'Approved' : 'Rejected'}: ${serverName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${approved ? '#10b981' : '#ef4444'};">
          Request ${approved ? 'Approved' : 'Rejected'}
        </h2>
        <p>Your request to create the public server "${serverName}" has been ${approved ? 'approved' : 'rejected'}.</p>
        
        ${approved ? `
          <p>You can now access and manage your server in the chat application.</p>
        ` : `
          <p>If you have questions about this decision, please contact the administrator.</p>
        `}
        
        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          This is an automated message from your Chat App system.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending response email:', error);
  }
}
