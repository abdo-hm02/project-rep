const db = require('./db');
const bcrypt = require('bcrypt');

class User {
  static async create(userData) {
    const {
      firstName, lastName, email, phoneNumber, password,
      birthDate, idExpirationDate, birthPlace, cardNumber,
      fatherFullName, motherFullName, address, gender,
      civilStatusNumber
    } = userData;

    const hashedPassword = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (
        first_name, last_name, email, phone_number, password,
        birth_date, id_expiration_date, birth_place, card_number,
        father_full_name, mother_full_name, address, gender,
        civil_status_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING id, first_name, last_name, email, phone_number,
        birth_date, id_expiration_date, birth_place, card_number,
        father_full_name, mother_full_name, address, gender,
        civil_status_number, created_at
    `;

    const values = [
      firstName, lastName, email, phoneNumber, hashedPassword,
      birthDate, idExpirationDate, birthPlace, cardNumber,
      fatherFullName, motherFullName, address, gender,
      civilStatusNumber
    ];

    try {
      const { rows } = await db.query(query, values);
      return rows[0];
    } catch (error) {
      if (error.code === '23505') { // unique violation
        if (error.constraint.includes('email')) {
          throw new Error('Email already exists');
        } else if (error.constraint.includes('card_number')) {
          throw new Error('Card number already exists');
        } else if (error.constraint.includes('civil_status_number')) {
          throw new Error('Civil status number already exists');
        }
      }
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = $1';
    const { rows } = await db.query(query, [email]);
    return rows[0];
  }

  static async validatePassword(providedPassword, storedPassword) {
    return bcrypt.compare(providedPassword, storedPassword);
  }
}

module.exports = User;