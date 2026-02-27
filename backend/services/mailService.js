const nodemailer = require("nodemailer");

/**
 * Create a reusable SMTP transporter.
 * Uses Gmail by default — swap the service/host for other providers.
 */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Send an alert email to a family member when risk exceeds threshold.
 *
 * @param {{ to: string, userName: string, riskScore: number, flags: string[] }} opts
 */
async function sendAlert({ to, userName, riskScore, flags }) {
    const flagList = flags.length
        ? `<ul>${flags.map((f) => `<li>${f}</li>`).join("")}</ul>`
        : "<p>No specific flags — composite score triggered alert.</p>";

    const mailOptions = {
        from: `"NeuroTrace AI" <${process.env.EMAIL_USER}>`,
        to,
        subject: `⚠️ NeuroTrace Alert — Elevated Risk for ${userName}`,
        html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
        <h2 style="color:#e53e3e;">⚠️ Cognitive Drift Alert</h2>
        <p>Our monitoring system has detected an elevated risk score for <strong>${userName}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr>
            <td style="padding:8px;font-weight:bold;">Risk Score</td>
            <td style="padding:8px;color:#e53e3e;font-weight:bold;">${(riskScore * 100).toFixed(1)}%</td>
          </tr>
        </table>
        <h3>Flags</h3>
        ${flagList}
        <p style="color:#718096;font-size:0.85rem;margin-top:24px;">This is an automated alert from NeuroTrace AI (research demo). Not a medical diagnosis.</p>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Alert email sent to ${to}`);
    } catch (err) {
        console.error(`Email failed: ${err.message}`);
    }
}

module.exports = { sendAlert };
