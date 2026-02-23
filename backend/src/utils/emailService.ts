import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'Food Ordering <noreply@example.com>',
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw error;
  }
};

export const sendOrderConfirmationEmail = async (
  to: string,
  orderDetails: any
): Promise<void> => {
  const html = `
    <h2>Order Confirmation</h2>
    <p>Thank you for your order! Your order #${orderDetails.orderId} has been confirmed.</p>
    <h3>Order Details:</h3>
    <ul>
      <li>Restaurant: ${orderDetails.restaurantName}</li>
      <li>Total: $${orderDetails.total}</li>
      <li>Status: ${orderDetails.status}</li>
    </ul>
    <p>You can track your order status in the app.</p>
  `;

  await sendEmail({
    to,
    subject: `Order Confirmation #${orderDetails.orderId}`,
    html,
  });
};

export const sendOrderStatusUpdateEmail = async (
  to: string,
  orderDetails: any
): Promise<void> => {
  const html = `
    <h2>Order Status Update</h2>
    <p>Your order #${orderDetails.orderId} status has been updated to: <strong>${orderDetails.status}</strong></p>
    <p>You can track your order in the app for more details.</p>
  `;

  await sendEmail({
    to,
    subject: `Order #${orderDetails.orderId} - ${orderDetails.status}`,
    html,
  });
};

export const sendWelcomeEmail = async (to: string, name: string): Promise<void> => {
  const html = `
    <h2>Welcome to Food Ordering!</h2>
    <p>Hi ${name},</p>
    <p>Thank you for joining us. Start exploring delicious food from your favorite restaurants.</p>
    <p>Happy ordering!</p>
  `;

  await sendEmail({
    to,
    subject: 'Welcome to Food Ordering!',
    html,
  });
};
