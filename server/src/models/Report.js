const db = require('../config/database');

class Report {
  static async findAll() {
    const result = await db.query(
      `SELECT * FROM reports ORDER BY generated_at DESC LIMIT 50`
    );
    return result.rows;
  }

  static async create(reportData) {
    const { name, type, dateRange, generatedBy, fileSize } = reportData;
    
    const result = await db.query(
      `INSERT INTO reports (name, type, date_range, generated_by, file_size, status)
       VALUES ($1, $2, $3, $4, $5, 'completed')
       RETURNING *`,
      [name, type, dateRange, generatedBy, fileSize || '1.2 MB']
    );
    
    return result.rows[0];
  }
}

module.exports = Report;