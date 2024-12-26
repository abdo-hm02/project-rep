const db = require('./db');
const bcrypt = require('bcrypt');

class Agent {
  static async create(data) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const query = `
      INSERT INTO agents (
        email, password, first_name, last_name, agent_type
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, first_name, last_name, agent_type
    `;
   
    const values = [
      data.email,
      hashedPassword,
      data.first_name,
      data.last_name,
      data.agent_type // 'insurance' or 'conservation'
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM agents WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0];
  }

  static async validatePassword(plainPassword, hashedPassword) {
    try {
      return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
      console.error('Password validation error:', error);
      return false;
    }
  }
}

module.exports = Agent;