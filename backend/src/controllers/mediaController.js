const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { query } = require('../config/database');

exports.upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { folderId, altText, tags } = req.body;
    const file = req.file;
    const fileUrl = `/uploads/${path.relative(process.env.UPLOAD_PATH || './uploads', file.path).replace(/\\/g, '/')}`;

    if (file.mimetype.startsWith('image/') && !file.mimetype.includes('svg')) {
      try {
        await sharp(file.path)
          .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(file.path + '.webp');
      } catch (sharpErr) { /* non-fatal */ }
    }

    const result = await query(
      `INSERT INTO media_files (folder_id, file_name, original_name, mime_type, file_size, file_path, file_url, alt_text, tags, uploaded_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING file_id`,
      [folderId || null, file.filename, file.originalname, file.mimetype,
       file.size, file.path, fileUrl, altText || null, tags || null, req.user.user_id]
    );

    res.status(201).json({
      success: true,
      data: {
        fileId:       result.rows[0].file_id,
        fileName:     file.filename,
        originalName: file.originalname,
        fileUrl,
        mimeType:     file.mimetype,
        fileSize:     file.size,
      },
    });
  } catch (err) { next(err); }
};

exports.getFiles = async (req, res, next) => {
  try {
    const { folderId, search, type, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const conditions = ['1=1'];
    const params = [];

    if (folderId) { params.push(+folderId); conditions.push(`folder_id = $${params.length}`); }
    if (search)   { params.push(`%${search}%`); const n = params.length; conditions.push(`(original_name ILIKE $${n} OR alt_text ILIKE $${n} OR tags ILIKE $${n})`); }
    if (type === 'image')    conditions.push(`mime_type LIKE 'image/%'`);
    if (type === 'document') conditions.push(`mime_type = 'application/pdf'`);
    if (type === 'video')    conditions.push(`mime_type LIKE 'video/%'`);

    const where = 'WHERE ' + conditions.join(' AND ');

    const [countR, dataR] = await Promise.all([
      query(`SELECT COUNT(*) AS total FROM media_files ${where}`, params),
      query(
        `SELECT mf.*, u.first_name || ' ' || u.last_name AS uploader_name
         FROM media_files mf LEFT JOIN users u ON mf.uploaded_by = u.user_id
         ${where} ORDER BY mf.created_at DESC
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

exports.deleteFile = async (req, res, next) => {
  try {
    const result = await query(`SELECT file_path FROM media_files WHERE file_id = $1`, [+req.params.id]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    const filePath = result.rows[0].file_path;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await query(`DELETE FROM media_files WHERE file_id = $1`, [+req.params.id]);
    res.json({ success: true, message: 'File deleted' });
  } catch (err) { next(err); }
};

exports.getFolders = async (req, res, next) => {
  try {
    const result = await query(`SELECT * FROM media_folders ORDER BY name`);
    res.json({ success: true, data: result.rows });
  } catch (err) { next(err); }
};

exports.createFolder = async (req, res, next) => {
  try {
    const { name, parentId } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const result = await query(
      `INSERT INTO media_folders (name, slug, parent_id) VALUES ($1,$2,$3) RETURNING folder_id`,
      [name, slug, parentId || null]
    );
    res.status(201).json({ success: true, data: { folderId: result.rows[0].folder_id } });
  } catch (err) { next(err); }
};
