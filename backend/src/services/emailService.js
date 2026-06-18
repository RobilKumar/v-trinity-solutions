const nodemailer = require('nodemailer');
const { query, sql } = require('../config/database');
const logger = require('../utils/logger');

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return transporter;
};

const interpolate = (template, vars) => {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || '');
};

exports.sendTemplate = async (templateKey, toEmail, variables = {}) => {
  try {
    const result = await query(
      `SELECT Subject, Body FROM EmailTemplates WHERE TemplateKey = @key AND IsActive = 1`,
      { key: { type: sql.NVarChar, value: templateKey } }
    );

    if (!result.recordset.length) {
      logger.warn(`Email template not found: ${templateKey}`);
      return;
    }

    const { Subject, Body } = result.recordset[0];
    const subject = interpolate(Subject, variables);
    const html    = interpolate(Body, variables);

    await exports.send(toEmail, subject, html);
  } catch (err) {
    logger.error('Email template send error:', err);
    throw err;
  }
};

exports.send = async (to, subject, html, text = null) => {
  try {
    const info = await getTransporter().sendMail({
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
      ...(text && { text }),
    });
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (err) {
    logger.error(`Email send failed to ${to}:`, err);
    // Queue for retry
    await query(
      `INSERT INTO EmailQueue (ToEmail, Subject, Body, Status) VALUES (@to, @sub, @body, 'failed')`,
      {
        to:   { type: sql.NVarChar, value: to },
        sub:  { type: sql.NVarChar, value: subject },
        body: { type: sql.NVarChar, value: html },
      }
    ).catch(() => {});
    throw err;
  }
};
