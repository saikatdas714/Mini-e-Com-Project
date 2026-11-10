const nodemailer = require('nodemailer');

/**
 * Creates and returns a nodemailer transporter based on environment variables.
 */
function createTransporter() {
    // If SMTP host is explicitly specified
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // Default to Gmail or configured EMAIL_SERVICE
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }

    return null;
}

/**
 * Generates responsive, beautifully styled HTML for purchase notification.
 */
function generateOrderHtml({ orderId, orderDate, customer, items, totalAmount, paymentScreenshot }) {
    const formattedTotal = Number(totalAmount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const itemsHtml = items.map(item => {
        const itemPrice = (Number(item.price) || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        const imageUrl = item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=150&auto=format&fit=crop&q=80';

        return `
            <tr>
                <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: top; width: 64px;">
                    <img src="${imageUrl}" alt="${item.name}" width="60" height="60" style="border-radius: 8px; object-fit: cover; display: block; border: 1px solid #e5e7eb;" />
                </td>
                <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: top;">
                    <div style="font-weight: 600; color: #111827; font-size: 15px; margin-bottom: 4px;">
                        ${item.name}
                    </div>
                    <div style="color: #6b7280; font-size: 13px; line-height: 1.4;">
                        ${item.description || 'No description available'}
                    </div>
                </td>
                <td style="padding: 14px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: top; text-align: right; white-space: nowrap;">
                    <span style="font-weight: 700; color: #111827; font-size: 15px;">₹${itemPrice}</span>
                </td>
            </tr>
        `;
    }).join('');

    const paymentProofHtml = paymentScreenshot ? `
        <!-- Payment Screenshot Proof -->
        <tr>
            <td style="padding: 20px 32px 10px 32px;">
                <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 10px 0; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">
                    📸 Payment Confirmation Screenshot
                </h3>
                <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px; text-align: center;">
                    <img src="cid:paymentScreenshot" alt="Payment Confirmation Screenshot" style="max-width: 100%; max-height: 480px; border-radius: 6px; border: 1px solid #d1d5db; display: inline-block; box-shadow: 0 2px 6px rgba(0,0,0,0.08);" />
                    <div style="margin-top: 10px; font-size: 13px; color: #4b5563; font-weight: 500;">
                        Attached Proof: <strong>${paymentScreenshot.originalname || 'payment-screenshot.jpg'}</strong>
                    </div>
                </div>
            </td>
        </tr>
    ` : '';

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation #${orderId}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f3f4f6; padding: 30px 15px;">
            <tr>
                <td align="center">
                    <table role="presentation" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.08); border: 1px solid #e5e7eb;">
                        
                        <!-- Header Banner -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #131921 0%, #1e293b 100%); padding: 30px 32px; text-align: center;">
                                <div style="display: inline-block; background-color: #f08804; color: #ffffff; border-radius: 50%; width: 44px; height: 44px; line-height: 44px; font-size: 22px; margin-bottom: 12px;">
                                    🛍️
                                </div>
                                <h1 style="color: #ffffff; margin: 0 0 6px 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">
                                    Mini e-Com
                                </h1>
                                <p style="color: #cbd5e1; margin: 0; font-size: 14px;">
                                    Order Purchase Confirmation & Payment Proof
                                </p>
                            </td>
                        </tr>

                        <!-- Order Success Alert -->
                        <tr>
                            <td style="padding: 24px 32px 10px 32px;">
                                <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 14px 18px; border-radius: 6px;">
                                    <div style="color: #065f46; font-weight: 700; font-size: 15px;">
                                        Order Placed with Payment Proof
                                    </div>
                                    <div style="color: #047857; font-size: 13px; margin-top: 3px;">
                                        A new purchase order has been placed. Payment screenshot is attached below for verification.
                                    </div>
                                </div>
                            </td>
                        </tr>

                        <!-- Customer & Order Meta Information -->
                        <tr>
                            <td style="padding: 16px 32px 0 32px;">
                                <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; padding: 16px;">
                                    <tr>
                                        <td style="padding: 6px 10px; font-size: 13px; color: #6b7280; width: 40%;">Order ID:</td>
                                        <td style="padding: 6px 10px; font-size: 13px; font-weight: 700; color: #111827;">#${orderId}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 10px; font-size: 13px; color: #6b7280;">Order Date:</td>
                                        <td style="padding: 6px 10px; font-size: 13px; color: #111827;">${orderDate}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 10px; font-size: 13px; color: #6b7280;">Customer Name:</td>
                                        <td style="padding: 6px 10px; font-size: 13px; font-weight: 600; color: #111827;">${customer.name || 'Valued Customer'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 10px; font-size: 13px; color: #6b7280;">Customer Email:</td>
                                        <td style="padding: 6px 10px; font-size: 13px; color: #111827;">${customer.email || 'N/A'}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 10px; font-size: 13px; color: #6b7280;">Payment Method:</td>
                                        <td style="padding: 6px 10px; font-size: 13px; color: #10b981; font-weight: 700;">UPI (Screenshot Submitted)</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Items Purchased -->
                        <tr>
                            <td style="padding: 24px 32px 0 32px;">
                                <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 12px 0; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px;">
                                    Purchased Items (${items.length})
                                </h3>
                                <table width="100%" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                                    ${itemsHtml}
                                </table>
                            </td>
                        </tr>

                        <!-- Pricing Summary -->
                        <tr>
                            <td style="padding: 20px 32px;">
                                <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; padding: 16px;">
                                    <tr>
                                        <td style="padding: 6px 10px; font-size: 14px; color: #4b5563;">Subtotal</td>
                                        <td style="padding: 6px 10px; font-size: 14px; color: #111827; text-align: right; font-weight: 600;">₹${formattedTotal}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 10px; font-size: 14px; color: #4b5563;">Delivery Charges</td>
                                        <td style="padding: 6px 10px; font-size: 14px; color: #10b981; text-align: right; font-weight: 700;">FREE</td>
                                    </tr>
                                    <tr>
                                        <td colspan="2" style="padding: 8px 10px 0 10px;">
                                            <div style="border-top: 1px dashed #d1d5db; margin: 4px 0 10px 0;"></div>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 10px; font-size: 16px; font-weight: 800; color: #111827;">Total Paid</td>
                                        <td style="padding: 6px 10px; font-size: 18px; font-weight: 800; color: #d94d07; text-align: right;">₹${formattedTotal}</td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        ${paymentProofHtml}

                        <!-- Footer -->
                        <tr>
                            <td style="background-color: #f9fafb; padding: 24px 32px; border-top: 1px solid #e5e7eb; text-align: center;">
                                <p style="margin: 0 0 6px 0; font-size: 13px; color: #6b7280; font-weight: 500;">
                                    <strong>Mini e-Com</strong> Order Management System
                                </p>
                                <p style="margin: 0; font-size: 11px; color: #9ca3af;">
                                    &copy; 2026 Mini e-Com. Designed by Saikat Das.
                                </p>
                            </td>
                        </tr>

                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}

/**
 * Generates plain-text version for email clients that do not render HTML.
 */
function generateOrderText({ orderId, orderDate, customer, items, totalAmount, paymentScreenshot }) {
    const formattedTotal = Number(totalAmount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const itemsText = items.map((item, index) => {
        const itemPrice = (Number(item.price) || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        return `${index + 1}. ${item.name} - ₹${itemPrice}\n   Description: ${item.description || 'N/A'}`;
    }).join('\n\n');

    const paymentText = paymentScreenshot
        ? `Payment Proof Screenshot: Attached (${paymentScreenshot.originalname || 'payment-screenshot.jpg'})\n`
        : '';

    return `
========================================
MINI E-COM - ORDER PURCHASE CONFIRMATION
========================================

Order ID: #${orderId}
Order Date: ${orderDate}
Customer Name: ${customer.name || 'Valued Customer'}
Customer Email: ${customer.email || 'N/A'}
Payment Status: Confirmed / Paid
${paymentText}
----------------------------------------
PURCHASED ITEMS (${items.length}):
----------------------------------------
${itemsText}

----------------------------------------
PRICING DETAILS:
----------------------------------------
Subtotal: ₹${formattedTotal}
Delivery: FREE
Total Paid: ₹${formattedTotal}

----------------------------------------
Thank you for your purchase with Mini e-Com!
========================================
    `.trim();
}

/**
 * Sends order purchase confirmation email.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.orderId - Unique order identifier
 * @param {Object} options.customer - Customer details { id, name, email }
 * @param {Array} options.items - Cart items purchased
 * @param {number} options.totalAmount - Total order price
 * @param {Object} [options.paymentScreenshot] - Optional screenshot metadata { path, originalname }
 */
async function sendPurchaseNotification({ to = 'saikatdas7320@gmail.com', orderId, customer, items, totalAmount, paymentScreenshot }) {
    const transporter = createTransporter();

    const orderDate = new Date().toLocaleString('en-IN', {
        timeZone: 'Asia/Kolkata',
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    const htmlContent = generateOrderHtml({ orderId, orderDate, customer, items, totalAmount, paymentScreenshot });
    const textContent = generateOrderText({ orderId, orderDate, customer, items, totalAmount, paymentScreenshot });

    if (!transporter) {
        console.warn('\n[Email Service Warning]: EMAIL_USER / EMAIL_PASS or SMTP credentials are not configured in .env.');
        console.warn(`[Email Service Warning]: Could not deliver real email to ${to} for Order #${orderId}.`);
        console.warn('Set EMAIL_USER and EMAIL_PASS in your .env file to enable live delivery.\n');
        return {
            delivered: false,
            reason: 'Credentials not configured'
        };
    }

    const attachments = [];
    if (paymentScreenshot && paymentScreenshot.path) {
        attachments.push({
            filename: paymentScreenshot.originalname || 'payment-screenshot.jpg',
            path: paymentScreenshot.path,
            cid: 'paymentScreenshot'
        });
    }

    const mailOptions = {
        from: process.env.EMAIL_FROM || `"Mini e-Com" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: `🛒 Order Confirmation #${orderId} (Payment Proof Attached) - Mini e-Com`,
        text: textContent,
        html: htmlContent,
        attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Order notification sent successfully to ${to}. Message ID: ${info.messageId}`);

    return {
        delivered: true,
        messageId: info.messageId
    };
}

module.exports = {
    sendPurchaseNotification,
    generateOrderHtml,
    generateOrderText
};
