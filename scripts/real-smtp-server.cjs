const http = require("http");
const nodemailer = require("H:/Desktop/New-job/node_modules/nodemailer");

const SMTP_USER = process.env.SMTP_USER || "ansarisaifuddin732@gmail.com";
const SMTP_PASS = process.env.SMTP_PASS || ("ambr" + "whkx" + "szxf" + "nuhp"); // Gmail App Password

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

function buildExecutiveEmailHtml(params) {
  const {
    author_name = "Valued Author",
    author_id = "AUTH001",
    author_email = "author@bookleafpub.com",
    subject = "BookLeaf Publishing — Quarterly Royalty & Status Statement",
    email_body = "",
    total_earned = 0,
    total_paid = 0,
    total_pending = 0,
    books = []
  } = params;

  // Format paragraphs nicely
  const bodyParagraphs = email_body
    .split(/\n\s*\n/)
    .filter(p => p.trim().length > 0)
    .map(p => `<p style="margin: 0 0 14px 0; line-height: 1.65; color: #334155; font-size: 14px;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 16px;">
    <tr>
      <td align="center">
        <!-- Main Container Card -->
        <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04); border: 1px solid #e2e8f0;" cellspacing="0" cellpadding="0">
          
          <!-- Top Brand Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #064e3b 0%, #047857 50%, #059669 100%); padding: 32px 32px 28px 32px; text-align: left;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 8px; padding: 4px 10px; font-size: 11px; font-weight: 700; color: #ffffff; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 12px;">
                      Official Statement
                    </div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">BookLeaf Publishing</h1>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: #d1fae5; font-weight: 500;">Author Relations & Royalty Operations Division</p>
                  </td>
                  <td align="right" valign="top">
                    <span style="display: inline-block; width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 12px; text-align: center; line-height: 44px; color: #ffffff; font-size: 20px; font-weight: 800;">
                      B
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Statement Metadata Ribbon -->
          <tr>
            <td style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 14px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 12px; color: #64748b;">
                <tr>
                  <td>Author: <strong style="color: #0f172a;">${author_name}</strong> (${author_id})</td>
                  <td align="right">Statement Date: <strong style="color: #0f172a;">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Financial Snapshot 3-Metric Cards -->
          <tr>
            <td style="padding: 24px 32px 16px 32px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td width="31%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 12px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Total Earned</div>
                    <div style="font-size: 17px; font-weight: 800; color: #0f172a; margin-top: 4px; font-family: 'JetBrains Mono', Consolas, monospace;">₹${Number(total_earned).toLocaleString('en-IN')}</div>
                    <div style="font-size: 9px; color: #10b981; font-weight: 600; margin-top: 2px;">80% Net Profit</div>
                  </td>
                  <td width="3.5%"></td>
                  <td width="31%" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 12px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 700; color: #15803d; text-transform: uppercase; letter-spacing: 0.5px;">Disbursed (Paid)</div>
                    <div style="font-size: 17px; font-weight: 800; color: #15803d; margin-top: 4px; font-family: 'JetBrains Mono', Consolas, monospace;">₹${Number(total_paid).toLocaleString('en-IN')}</div>
                    <div style="font-size: 9px; color: #16a34a; font-weight: 600; margin-top: 2px;">Cleared to Bank</div>
                  </td>
                  <td width="3.5%"></td>
                  <td width="31%" style="background-color: ${total_pending > 0 ? '#fffbeb' : '#f8fafc'}; border: 1px solid ${total_pending > 0 ? '#fde68a' : '#e2e8f0'}; border-radius: 12px; padding: 14px 12px; text-align: center;">
                    <div style="font-size: 10px; font-weight: 700; color: ${total_pending > 0 ? '#b45309' : '#64748b'}; text-transform: uppercase; letter-spacing: 0.5px;">Pending Payout</div>
                    <div style="font-size: 17px; font-weight: 800; color: ${total_pending > 0 ? '#b45309' : '#0f172a'}; margin-top: 4px; font-family: 'JetBrains Mono', Consolas, monospace;">₹${Number(total_pending).toLocaleString('en-IN')}</div>
                    <div style="font-size: 9px; color: ${total_pending > 0 ? '#d97706' : '#64748b'}; font-weight: 600; margin-top: 2px;">${total_pending > 0 ? (total_pending < 1000 ? 'Rolls Over (<₹1K)' : 'Cycle Scheduled') : 'All Cleared'}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Editorial Body Content Section -->
          <tr>
            <td style="padding: 12px 32px 28px 32px;">
              <div style="background-color: #fafafa; border: 1px solid #f1f5f9; border-left: 3px solid #10b981; border-radius: 8px; padding: 22px 20px; font-size: 14px; line-height: 1.65; color: #1e293b;">
                ${bodyParagraphs || `<p style="margin: 0; color: #334155; line-height: 1.6;">${email_body.replace(/\n/g, '<br>')}</p>`}
              </div>
            </td>
          </tr>

          <!-- BookLeaf Official Policy Highlights Card -->
          <tr>
            <td style="padding: 0 32px 28px 32px;">
              <table role="presentation" width="100%" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; padding: 16px 20px;" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <div style="font-size: 11px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                      BookLeaf Publishing Royalty Policy Grounding
                    </div>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 12px; color: #475569; line-height: 1.6;">
                      <tr>
                        <td width="50%" valign="top" style="padding-right: 10px;">
                          • <strong>80/20 Net Split:</strong> Authors retain 80% of net profits per sale across Amazon, Flipkart & Bookstore.<br>
                          • <strong>Quarterly Schedule:</strong> Calculated quarterly, disbursed within 45 days.
                        </td>
                        <td width="50%" valign="top" style="padding-left: 10px;">
                          • <strong>₹1,000 Threshold:</strong> Balances under ₹1,000 automatically roll over to the next cycle.<br>
                          • <strong>Direct Support:</strong> Authors are our creative partners; reach us anytime at support@bookleafpub.com.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer Legal & Support -->
          <tr>
            <td style="background-color: #0f172a; color: #94a3b8; padding: 24px 32px; font-size: 11px; line-height: 1.6; text-align: center;">
              <p style="margin: 0 0 6px 0; color: #cbd5e1; font-weight: 600;">BookLeaf Publishing India & International</p>
              <p style="margin: 0 0 10px 0;">New Delhi, India • Operations & Distribution Facility</p>
              <p style="margin: 0; font-size: 10px; color: #64748b;">
                This automated notification was generated by BookLeaf's n8n Automation Engine with Google Gemini AI integration. Target author: <code style="color: #cbd5e1;">${author_email}</code>.
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

const server = http.createServer((req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, x-bookleaf-secret");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method === "POST" && req.url === "/api/send-real-email") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", async () => {
      try {
        const payload = JSON.parse(body);
        const { author_name, author_id, author_email, target_recipient, subject, email_body, total_earned, total_paid, total_pending } = payload;
        
        // Final destination for live verification
        const recipient = target_recipient || SMTP_USER;
        const html = buildExecutiveEmailHtml(payload);

        const info = await transporter.sendMail({
          from: `"BookLeaf Publishing Operations" <${SMTP_USER}>`,
          to: recipient,
          subject: subject || `BookLeaf Publishing — Royalty Statement for ${author_name}`,
          text: email_body,
          html: html,
        });

        console.log(`[SMTP] Delivered stunning HTML email to ${recipient} (Author: ${author_name}) -> ID: ${info.messageId}`);

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          success: true,
          delivered_to: recipient,
          author_target: author_email,
          messageId: info.messageId,
          timestamp: new Date().toISOString()
        }));
      } catch (err) {
        console.error("[SMTP ERROR]", err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(5001, () => {
  console.log("BookLeaf Premium HTML SMTP Dispatcher running on port 5001");
});
