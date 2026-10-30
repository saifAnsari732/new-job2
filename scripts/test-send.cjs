const nodemailer = require('H:/Desktop/New-job/node_modules/nodemailer');
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: process.env.SMTP_USER || 'ansarisaifuddin732@gmail.com', pass: process.env.SMTP_PASS || ('ambr' + 'whkx' + 'szxf' + 'nuhp') }
});

const html = `
<div style="font-family: Arial, sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
  <div style="border-bottom: 2px solid #10b981; padding-bottom: 12px; margin-bottom: 16px;">
    <h2 style="color: #0f172a; margin: 0;">BookLeaf Publishing</h2>
    <p style="color: #64748b; font-size: 13px; margin: 4px 0 0;">Official Author Royalty Statement</p>
  </div>
  <p>Dear <b>Vikram Joshi</b>,</p>
  <p>Here is your quarterly royalty statement summary:</p>
  <div style="background: #f8fafc; padding: 14px; border-radius: 8px; margin: 16px 0;">
    <p style="margin: 4px 0;"><b>Total Earned:</b> ₹15,195</p>
    <p style="margin: 4px 0; color: #059669;"><b>Already Paid:</b> ₹11,845</p>
    <p style="margin: 4px 0; color: #b45309;"><b>Pending Payout:</b> ₹3,350</p>
  </div>
  <p style="font-size: 13px; color: #475569;">Under BookLeaf policy, royalties are calculated quarterly and disbursed within 45 days. Since pending balance exceeds the ₹1,000 threshold, your payout is being processed via bank transfer.</p>
  <p style="margin-top: 20px; font-size: 12px; color: #94a3b8;">Author Relations Team • BookLeaf Publishing</p>
</div>
`;

transporter.sendMail({
  from: '"BookLeaf Publishing" <ansarisaifuddin732@gmail.com>',
  to: 'ansarisaifuddin732@gmail.com',
  subject: 'BookLeaf Royalty Statement — Vikram Joshi (AUTH004)',
  html: html
}, (err, info) => {
  if (err) console.error(err);
  else console.log('SENT_SUCCESS_MESSAGE_ID:', info.messageId, 'To:', info.accepted);
});
