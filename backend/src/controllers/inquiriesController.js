const { query } = require('../config/database');
const emailService = require('../services/emailService');

const INQUIRY_TYPES = ['CCTV', 'Cyber Security', 'SOC', 'SIEM', 'IT Infrastructure',
                       'Data Center', 'Networking', 'Cloud', 'Managed Services', 'Other'];

exports.submit = async (req, res, next) => {
  try {
    const { inquiryType, name, company, phone, email, location, projectType, budget, description } = req.body;

    if (!INQUIRY_TYPES.includes(inquiryType)) {
      return res.status(400).json({ success: false, message: 'Invalid inquiry type' });
    }

    const result = await query(
      `INSERT INTO inquiries (inquiry_type, name, company, phone, email, location, project_type, budget, description, ip_address, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING inquiry_id`,
      [inquiryType, name, company || null, phone, email, location || null,
       projectType || null, budget || null, description,
       req.ip, req.headers.referer || 'website']
    );

    const inquiryId = result.rows[0].inquiry_id;

    Promise.all([
      emailService.sendTemplate('inquiry_received', process.env.ADMIN_EMAIL, { Name: name, Company: company, InquiryType: inquiryType, Description: description }),
      emailService.sendTemplate('inquiry_confirmation', email, { Name: name, InquiryID: inquiryId }),
    ]).catch(err => console.error('Email send error:', err));

    res.status(201).json({
      success: true,
      message: 'Your inquiry has been submitted. We will contact you within 24 hours.',
      data: { inquiryId },
    });
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, type, search, assignedTo } = req.query;
    const offset = (page - 1) * limit;

    const conditions = ['1=1'];
    const params = [];

    if (status)    { params.push(status);        conditions.push(`i.status = $${params.length}`); }
    if (type)      { params.push(type);           conditions.push(`i.inquiry_type = $${params.length}`); }
    if (assignedTo){ params.push(+assignedTo);    conditions.push(`i.assigned_to = $${params.length}`); }
    if (search)    { params.push(`%${search}%`);  const n = params.length; conditions.push(`(i.name ILIKE $${n} OR i.company ILIKE $${n} OR i.email ILIKE $${n})`); }

    const where = 'WHERE ' + conditions.join(' AND ');

    const [countR, dataR] = await Promise.all([
      query(`SELECT COUNT(*) AS total FROM inquiries i ${where}`, params),
      query(
        `SELECT i.*, u.first_name || ' ' || u.last_name AS assigned_to_name
         FROM inquiries i LEFT JOIN users u ON i.assigned_to = u.user_id
         ${where} ORDER BY i.created_at DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        [...params, +limit, +offset]
      ),
    ]);

    res.json({
      success: true,
      data: dataR.rows,
      pagination: { page: +page, limit: +limit, total: parseInt(countR.rows[0].total) },
    });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT i.*, u.first_name || ' ' || u.last_name AS assigned_to_name
       FROM inquiries i LEFT JOIN users u ON i.assigned_to = u.user_id
       WHERE i.inquiry_id = $1`,
      [+req.params.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Inquiry not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) { next(err); }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, assignedTo } = req.body;
    const validStatuses = ['new', 'in_progress', 'quotation_sent', 'won', 'lost'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    await query(
      `UPDATE inquiries SET
         status      = COALESCE($1, status),
         assigned_to = COALESCE($2, assigned_to),
         updated_at  = NOW()
       WHERE inquiry_id = $3`,
      [status || null, assignedTo || null, +id]
    );

    res.json({ success: true, message: 'Inquiry updated' });
  } catch (err) { next(err); }
};

exports.getStats = async (req, res, next) => {
  try {
    const [byStatus, byType] = await Promise.all([
      query(`SELECT status, COUNT(*) AS count FROM inquiries GROUP BY status`),
      query(`SELECT inquiry_type, COUNT(*) AS count FROM inquiries GROUP BY inquiry_type ORDER BY count DESC`),
    ]);
    res.json({ success: true, data: { byStatus: byStatus.rows, byType: byType.rows } });
  } catch (err) { next(err); }
};
