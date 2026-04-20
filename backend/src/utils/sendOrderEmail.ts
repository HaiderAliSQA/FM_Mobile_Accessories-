import transporter from '../config/email';
import PDFDocument from 'pdfkit';

interface OrderItem {
  name: string;
  size: number;
  color: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderData {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress: string;
  customerCity: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharges: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  notes?: string;
  createdAt: Date;
}

// ─────────────────────────────────────
// GENERATE PDF BUFFER
// ─────────────────────────────────────
export const generateOrderPDF = (order: OrderData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const buffers: Buffer[] = [];
      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const GOLD = '#B8860B';
      const DARK = '#1A1714';
      const GRAY = '#5C5650';
      const LIGHT = '#F5F3EE';
      const RED   = '#C41E3A';

      const pageWidth = doc.page.width - 100;

      // ── HEADER ──
      doc.rect(0, 0, doc.page.width, 100).fill(DARK);
      doc
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .fontSize(22)
        .text('FM MOBILE ACCESSORIES', 50, 28, { align: 'center', width: pageWidth });
      doc
        .fillColor(GOLD)
        .font('Helvetica')
        .fontSize(10)
        .text('Your One-Stop Mobile Shop — Quality Accessories at Best Prices', 50, 56, {
          align: 'center',
          width: pageWidth,
        });
      doc
        .fillColor('#FFFFFF')
        .font('Helvetica')
        .fontSize(9)
        .text('Premium Mobile Accessories Collection', 50, 74, { align: 'center', width: pageWidth });

      doc.moveDown(3);

      // ── ORDER RECEIPT TITLE ──
      doc
        .fillColor(DARK)
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('ORDER RECEIPT', 50, 120, { align: 'center', width: pageWidth });

      // Gold underline
      const titleWidth = 140;
      doc
        .moveTo((doc.page.width - titleWidth) / 2, 140)
        .lineTo((doc.page.width - titleWidth) / 2 + titleWidth, 140)
        .strokeColor(GOLD)
        .lineWidth(2)
        .stroke();

      // ── ORDER INFO BOX ──
      const boxY = 160;
      doc
        .rect(50, boxY, pageWidth, 80)
        .fill(LIGHT);

      const orderDate = new Date(order.createdAt);
      const dateStr = orderDate.toLocaleDateString('en-PK', {
        day: '2-digit', month: 'long', year: 'numeric',
      });
      const timeStr = orderDate.toLocaleTimeString('en-PK', {
        hour: '2-digit', minute: '2-digit',
      });

      // Left column
      doc.fillColor(GRAY).font('Helvetica').fontSize(9)
        .text('Order Number:', 65, boxY + 12);
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9)
        .text(order.orderNumber, 65, boxY + 24);

      doc.fillColor(GRAY).font('Helvetica').fontSize(9)
        .text('Date:', 65, boxY + 42);
      doc.fillColor(DARK).font('Helvetica').fontSize(9)
        .text(`${dateStr} at ${timeStr}`, 65, boxY + 54);

      // Right column
      doc.fillColor(GRAY).font('Helvetica').fontSize(9)
        .text('Payment Method:', 310, boxY + 12);
      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9)
        .text(order.paymentMethod.toUpperCase().replace('_', ' '), 310, boxY + 24);

      doc.fillColor(GRAY).font('Helvetica').fontSize(9)
        .text('Payment Status:', 310, boxY + 42);
      const statusColor = order.paymentStatus === 'paid' ? '#2D6A4F' : '#854D0E';
      doc.fillColor(statusColor).font('Helvetica-Bold').fontSize(9)
        .text(order.paymentStatus.toUpperCase(), 310, boxY + 54);

      // ── CUSTOMER DETAILS ──
      const custY = boxY + 100;
      doc
        .fillColor(DARK)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text('CUSTOMER DETAILS', 50, custY);
      doc
        .moveTo(50, custY + 16)
        .lineTo(50 + pageWidth, custY + 16)
        .strokeColor(GOLD)
        .lineWidth(1)
        .stroke();

      const custData = [
        ['Name',    order.customerName],
        ['Phone',   order.customerPhone],
        ['Email',   order.customerEmail || 'Not provided'],
        ['City',    order.customerCity],
        ['Address', order.customerAddress],
      ];

      let custRowY = custY + 24;
      custData.forEach(([label, value]) => {
        doc.fillColor(GRAY).font('Helvetica').fontSize(9)
          .text(`${label}:`, 50, custRowY, { width: 80 });
        doc.fillColor(DARK).font('Helvetica').fontSize(9)
          .text(value, 140, custRowY, { width: pageWidth - 90 });
        custRowY += 18;
      });

      // ── ORDER ITEMS TABLE ──
      const tableY = custRowY + 20;
      doc
        .fillColor(DARK)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text('ORDER ITEMS', 50, tableY);
      doc
        .moveTo(50, tableY + 16)
        .lineTo(50 + pageWidth, tableY + 16)
        .strokeColor(GOLD)
        .lineWidth(1)
        .stroke();

      // Table header
      const headerY = tableY + 24;
      doc.rect(50, headerY, pageWidth, 22).fill(DARK);

      const cols = { product: 50, size: 240, color: 300, qty: 360, price: 410, total: 465 };
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(8);
      doc.text('PRODUCT', cols.product + 4, headerY + 7);
      doc.text('COLOR',   cols.color,        headerY + 7);
      doc.text('QTY',     cols.qty,          headerY + 7);
      doc.text('PRICE',   cols.price,        headerY + 7);
      doc.text('TOTAL',   cols.total,        headerY + 7);

      // Table rows
      let rowY = headerY + 22;
      order.items.forEach((item, index) => {
        const rowBg = index % 2 === 0 ? '#FFFFFF' : LIGHT;
        doc.rect(50, rowY, pageWidth, 22).fill(rowBg);

        const itemTotal = item.price * item.quantity;
        doc.fillColor(DARK).font('Helvetica').fontSize(8);
        doc.text(item.name.substring(0, 35), cols.product + 4, rowY + 7);
        doc.text(item.color || 'N/A',         cols.color,       rowY + 7);
        doc.text(item.quantity.toString(),    cols.qty,         rowY + 7);
        doc.text(`PKR ${item.price.toLocaleString()}`, cols.price, rowY + 7);
        doc.text(`PKR ${itemTotal.toLocaleString()}`, cols.total, rowY + 7);

        rowY += 22;
      });

      // Table border
      doc
        .rect(50, headerY, pageWidth, rowY - headerY)
        .strokeColor('#E8E4DC')
        .lineWidth(0.5)
        .stroke();

      // ── PRICE SUMMARY ──
      const summaryY = rowY + 16;
      const summaryX = 360;
      const summaryW = pageWidth - summaryX + 50;

      const priceRows = [
        ['Subtotal:',         `PKR ${order.subtotal.toLocaleString()}`],
        ['TCS Delivery:',     order.deliveryCharges === 0 ? 'FREE' : `PKR ${order.deliveryCharges.toLocaleString()}`],
      ];

      let prY = summaryY;
      priceRows.forEach(([label, value]) => {
        doc.fillColor(GRAY).font('Helvetica').fontSize(9)
          .text(label, summaryX, prY, { width: 90 });
        doc.fillColor(DARK).font('Helvetica').fontSize(9)
          .text(value, summaryX + 95, prY, { align: 'right', width: summaryW - 95 });
        prY += 18;
      });

      // Total row
      doc.rect(summaryX, prY, summaryW, 24).fill(DARK);
      doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(10)
        .text('TOTAL:', summaryX + 6, prY + 7);
      doc.fillColor(GOLD).font('Helvetica-Bold').fontSize(10)
        .text(`PKR ${order.totalAmount.toLocaleString()}`, summaryX + 6, prY + 7, {
          align: 'right', width: summaryW - 12,
        });

      // ── PAYMENT INSTRUCTIONS ──
      const payY = prY + 44;
      doc
        .fillColor(DARK)
        .font('Helvetica-Bold')
        .fontSize(11)
        .text('PAYMENT INSTRUCTIONS', 50, payY);
      doc
        .moveTo(50, payY + 16)
        .lineTo(50 + pageWidth, payY + 16)
        .strokeColor(GOLD)
        .lineWidth(1)
        .stroke();

      const payBoxY = payY + 24;
      doc.rect(50, payBoxY, pageWidth, 70).fill(LIGHT);
      doc.rect(50, payBoxY, pageWidth, 70).strokeColor('#E8E4DC').lineWidth(0.5).stroke();

      let payText = '';
      const method = order.paymentMethod.toLowerCase();

      if (method === 'cod') {
        payText = `Please keep PKR ${order.totalAmount.toLocaleString()} ready in cash for payment on delivery.\nOur TCS courier will deliver within 2 business days.`;
      } else if (method === 'jazzcash') {
        payText = `JazzCash Number: +92 300 7002 061\nAccount Title: Shahbaz Arif\nAmount: PKR ${order.totalAmount.toLocaleString()}\n${order.transactionId ? `Transaction ID: ${order.transactionId}` : 'Please send payment and reply with your Transaction ID on WhatsApp.'}`;
      } else if (method === 'easypaisa') {
        payText = `Easypaisa Number: +92 300 7002 061\nAccount Title: Shahbaz Arif\nAmount: PKR ${order.totalAmount.toLocaleString()}\n${order.transactionId ? `Transaction ID: ${order.transactionId}` : 'Please send payment and reply with your Transaction ID on WhatsApp.'}`;
      } else if (method === 'bank_transfer') {
        payText = `Bank: Meezan Bank\nAccount Number: 48010112475304\nAccount Title: FM Mobile Accessories\nAmount: PKR ${order.totalAmount.toLocaleString()}\n${order.transactionId ? `Reference ID: ${order.transactionId}` : 'Please transfer and reply with your Transaction Reference on WhatsApp.'}`;
      }

      doc.fillColor(DARK).font('Helvetica').fontSize(9)
        .text(payText, 65, payBoxY + 10, { width: pageWidth - 30, lineGap: 4 });

      // ── FOOTER ──
      const footerY = doc.page.height - 80;
      doc
        .moveTo(50, footerY)
        .lineTo(50 + pageWidth, footerY)
        .strokeColor('#E8E4DC')
        .lineWidth(0.5)
        .stroke();

      doc.fillColor(DARK).font('Helvetica-Bold').fontSize(9)
        .text('Thank you for shopping with FM Mobile Accessories!', 50, footerY + 10, {
          align: 'center', width: pageWidth,
        });
      doc.fillColor(GRAY).font('Helvetica').fontSize(8)
        .text('For queries: WhatsApp +92 300 700 2061 | Return Policy: 7-day exchange on unused items', 50, footerY + 26, {
          align: 'center', width: pageWidth,
        });
      doc.fillColor(GRAY).font('Helvetica').fontSize(7)
        .text('FM Mobile Accessories — Premium Tech Gear — Pakistan', 50, footerY + 42, {
          align: 'center', width: pageWidth,
        });

      // Page number
      doc.fillColor(GRAY).font('Helvetica').fontSize(7)
        .text('Page 1 of 1', 50, footerY + 56, {
          align: 'right', width: pageWidth,
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

// ─────────────────────────────────────
// SEND EMAIL WITH PDF ATTACHMENT
// ─────────────────────────────────────
export const sendOrderEmail = async (order: OrderData): Promise<void> => {
  try {
    // Generate PDF
    const pdfBuffer = await generateOrderPDF(order);

    const orderDate = new Date(order.createdAt);
    const dateStr = orderDate.toLocaleDateString('en-PK', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const method = order.paymentMethod.toLowerCase();

    // Payment details HTML block
    let paymentHTML = '';
    if (method === 'cod') {
      paymentHTML = `
        <div style="background:#FEF9C3;border:1px solid #EAB308;padding:16px;margin-top:16px;border-radius:4px;">
          <strong style="color:#854D0E;">💵 Cash on Delivery</strong><br>
          <span style="color:#854D0E;font-size:13px;">
            Customer will pay <strong>PKR ${order.totalAmount.toLocaleString()}</strong> in cash on delivery.
          </span>
        </div>`;
    } else if (method === 'jazzcash') {
      paymentHTML = `
        <div style="background:#FFF7ED;border:1px solid #F97316;padding:16px;margin-top:16px;border-radius:4px;">
          <strong style="color:#9A3412;">📱 JazzCash Payment</strong><br>
          <span style="color:#9A3412;font-size:13px;">
            Number: <strong>+92 300 7002 061</strong> (Shahbaz Arif)<br>
            Amount: <strong>PKR ${order.totalAmount.toLocaleString()}</strong><br>
            ${order.transactionId ? `Transaction ID: <strong>${order.transactionId}</strong>` : '⚠️ Payment verification pending'}
          </span>
        </div>`;
    } else if (method === 'easypaisa') {
      paymentHTML = `
        <div style="background:#F0FDF4;border:1px solid #22C55E;padding:16px;margin-top:16px;border-radius:4px;">
          <strong style="color:#166534;">📱 Easypaisa Payment</strong><br>
          <span style="color:#166534;font-size:13px;">
            Number: <strong>+92 300 7002 061</strong> (Shahbaz Arif)<br>
            Amount: <strong>PKR ${order.totalAmount.toLocaleString()}</strong><br>
            ${order.transactionId ? `Transaction ID: <strong>${order.transactionId}</strong>` : '⚠️ Payment verification pending'}
          </span>
        </div>`;
    } else if (method === 'bank_transfer') {
      paymentHTML = `
        <div style="background:#EFF6FF;border:1px solid #3B82F6;padding:16px;margin-top:16px;border-radius:4px;">
          <strong style="color:#1E40AF;">🏦 Bank Transfer (Meezan Bank)</strong><br>
          <span style="color:#1E40AF;font-size:13px;">
            Account: <strong>48010112475304</strong> | Title: <strong>FM Mobile Accessories</strong><br>
            Amount: <strong>PKR ${order.totalAmount.toLocaleString()}</strong><br>
            ${order.transactionId ? `Reference ID: <strong>${order.transactionId}</strong>` : '⚠️ Payment verification pending'}
          </span>
        </div>`;
    }

    // Items table rows
    const itemRows = order.items.map((item, i) => `
      <tr style="background:${i % 2 === 0 ? '#FFFFFF' : '#F5F3EE'};">
        <td style="padding:10px 12px;font-size:13px;color:#1A1714;border-bottom:1px solid #E8E4DC;">${item.name}</td>
        <td style="padding:10px 12px;font-size:13px;color:#5C5650;border-bottom:1px solid #E8E4DC;text-align:center;">${item.color || 'N/A'}</td>
        <td style="padding:10px 12px;font-size:13px;color:#5C5650;border-bottom:1px solid #E8E4DC;text-align:center;">${item.quantity}</td>
        <td style="padding:10px 12px;font-size:13px;color:#1A1714;border-bottom:1px solid #E8E4DC;text-align:right;">PKR ${item.price.toLocaleString()}</td>
        <td style="padding:10px 12px;font-size:13px;font-weight:600;color:#1A1714;border-bottom:1px solid #E8E4DC;text-align:right;">PKR ${(item.price * item.quantity).toLocaleString()}</td>
      </tr>`).join('');

    // Full HTML email
    const htmlEmail = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>New Order — ${order.orderNumber}</title>
</head>
<body style="margin:0;padding:0;background:#F5F3EE;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3EE;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;max-width:600px;">

        <!-- HEADER -->
        <tr>
          <td style="background:#1A1714;padding:28px 40px;text-align:center;">
            <h1 style="color:#FFFFFF;font-size:22px;margin:0;letter-spacing:4px;font-family:Georgia,serif;">
              FM MOBILE ACCESSORIES
            </h1>
            <p style="color:#B8860B;font-size:11px;margin:6px 0 0;letter-spacing:2px;">
              YOUR ONE-STOP MOBILE SHOP
            </p>
          </td>
        </tr>

        <!-- ALERT BANNER -->
        <tr>
          <td style="background:#B8860B;padding:14px 40px;text-align:center;">
            <p style="color:#FFFFFF;font-size:14px;font-weight:bold;margin:0;">
              🛍️ NEW ORDER RECEIVED — ${order.orderNumber}
            </p>
            <p style="color:#FBF6E9;font-size:12px;margin:4px 0 0;">${dateStr}</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:32px 40px;">

            <!-- ORDER INFO -->
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#F5F3EE;border:1px solid #E8E4DC;margin-bottom:24px;">
              <tr>
                <td style="padding:14px 16px;border-right:1px solid #E8E4DC;">
                  <p style="font-size:10px;color:#9C9890;margin:0;letter-spacing:1px;text-transform:uppercase;">Order Number</p>
                  <p style="font-size:15px;font-weight:bold;color:#B8860B;margin:4px 0 0;">${order.orderNumber}</p>
                </td>
                <td style="padding:14px 16px;border-right:1px solid #E8E4DC;">
                  <p style="font-size:10px;color:#9C9890;margin:0;letter-spacing:1px;text-transform:uppercase;">Payment</p>
                  <p style="font-size:13px;font-weight:bold;color:#1A1714;margin:4px 0 0;">${order.paymentMethod.toUpperCase().replace('_',' ')}</p>
                </td>
                <td style="padding:14px 16px;">
                  <p style="font-size:10px;color:#9C9890;margin:0;letter-spacing:1px;text-transform:uppercase;">Status</p>
                  <p style="font-size:13px;font-weight:bold;color:${order.paymentStatus === 'paid' ? '#166534' : '#854D0E'};margin:4px 0 0;">
                    ${order.paymentStatus.toUpperCase()}
                  </p>
                </td>
              </tr>
            </table>

            <!-- CUSTOMER DETAILS -->
            <h3 style="font-size:12px;letter-spacing:2px;color:#9C9890;margin:0 0 12px;
                        text-transform:uppercase;border-bottom:1px solid #E8E4DC;padding-bottom:8px;">
              Customer Details
            </h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              ${[
                ['Name', order.customerName],
                ['Phone', order.customerPhone],
                ['Email', order.customerEmail || 'Not provided'],
                ['City', order.customerCity],
                ['Address', order.customerAddress],
                ['Notes', order.notes || 'None'],
              ].map(([label, value]) => `
              <tr>
                <td style="padding:6px 0;font-size:12px;color:#9C9890;width:80px;">${label}:</td>
                <td style="padding:6px 0;font-size:13px;color:#1A1714;font-weight:500;">${value}</td>
              </tr>`).join('')}
            </table>

            <!-- ORDER ITEMS -->
            <h3 style="font-size:12px;letter-spacing:2px;color:#9C9890;margin:0 0 12px;
                        text-transform:uppercase;border-bottom:1px solid #E8E4DC;padding-bottom:8px;">
              Order Items
            </h3>
            <table width="100%" cellpadding="0" cellspacing="0"
              style="border:1px solid #E8E4DC;margin-bottom:24px;">
              <tr style="background:#1A1714;">
                <th style="padding:10px 12px;font-size:10px;color:#FFFFFF;letter-spacing:1px;text-align:left;">PRODUCT</th>
                <th style="padding:10px 12px;font-size:10px;color:#FFFFFF;letter-spacing:1px;text-align:center;">COLOR</th>
                <th style="padding:10px 12px;font-size:10px;color:#FFFFFF;letter-spacing:1px;text-align:center;">QTY</th>
                <th style="padding:10px 12px;font-size:10px;color:#FFFFFF;letter-spacing:1px;text-align:right;">PRICE</th>
                <th style="padding:10px 12px;font-size:10px;color:#FFFFFF;letter-spacing:1px;text-align:right;">TOTAL</th>
              </tr>
              ${itemRows}
              <!-- Subtotal -->
              <tr style="background:#F5F3EE;">
                <td colspan="4" style="padding:10px 12px;font-size:12px;color:#5C5650;text-align:right;">Subtotal:</td>
                <td style="padding:10px 12px;font-size:13px;color:#1A1714;text-align:right;">PKR ${order.subtotal.toLocaleString()}</td>
              </tr>
              <!-- Delivery -->
              <tr style="background:#F5F3EE;">
                <td colspan="4" style="padding:6px 12px;font-size:12px;color:#5C5650;text-align:right;">TCS Delivery:</td>
                <td style="padding:6px 12px;font-size:13px;color:#1A1714;text-align:right;">
                  ${order.deliveryCharges === 0 ? '<span style="color:#166534;font-weight:bold;">FREE</span>' : `PKR ${order.deliveryCharges.toLocaleString()}`}
                </td>
              </tr>
              <!-- Total -->
              <tr style="background:#1A1714;">
                <td colspan="4" style="padding:12px;font-size:13px;font-weight:bold;color:#FFFFFF;text-align:right;letter-spacing:1px;">TOTAL:</td>
                <td style="padding:12px;font-size:15px;font-weight:bold;color:#C9A84C;text-align:right;">PKR ${order.totalAmount.toLocaleString()}</td>
              </tr>
            </table>

            <!-- PAYMENT INSTRUCTIONS -->
            <h3 style="font-size:12px;letter-spacing:2px;color:#9C9890;margin:0 0 8px;
                        text-transform:uppercase;border-bottom:1px solid #E8E4DC;padding-bottom:8px;">
              Payment Instructions
            </h3>
            ${paymentHTML}

          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#1A1714;padding:20px 40px;text-align:center;">
            <p style="color:#9C9890;font-size:11px;margin:0;">
              This email was sent automatically by FM Mobile Accessories order system.
            </p>
            <p style="color:#C9A84C;font-size:11px;margin:8px 0 0;">
              WhatsApp: +92 300 700 2061 | Return Policy: 7-day exchange on unused items
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>

</body>
</html>`;

    // Send email
    const mailOptions = {
      from: `"FM Mobile Accessories" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || 'Hafizhaideraliuet@gmail.com',
      subject: `🛍️ New Order — ${order.orderNumber} — PKR ${order.totalAmount.toLocaleString()}`,
      html: htmlEmail,
      attachments: [
        {
          filename: `Order_${order.orderNumber}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Order email sent for ${order.orderNumber}`);

  } catch (error) {
    // IMPORTANT: Never throw — order must succeed even if email fails
    console.error(`❌ Email failed for order ${(order as any).orderNumber}:`, error);
  }
};
