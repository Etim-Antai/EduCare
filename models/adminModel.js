const db = require('../config/db');
const bcrypt = require('bcrypt');

class AdminModel {
    async getAdminCount() {
        const [admins] = await db.query('SELECT COUNT(*) AS adminCount FROM admins');
        return admins[0].adminCount;
    }

    async addAdmin(adminData) {
        const { first_name, last_name, username, email, password, phone, role } = adminData;

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            'INSERT INTO admins (first_name, last_name, username, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, username, email, hashedPassword, phone, role]
        );

        return result.insertId;
    }

    async getAdminByEmailOrUsername(email, username) {
        const [existingAdmin] = await db.query('SELECT * FROM admins WHERE email = ? OR username = ?', [email, username]);
        return existingAdmin;
    }

    async updateAdmin(adminId, adminData) {
        try {
            const result = await db.query(
                'UPDATE admins SET first_name = ?, last_name = ?, username = ?, email = ?, phone = ?, role = ? WHERE admin_id = ?',
                [adminData.first_name, adminData.last_name, adminData.username, adminData.email, adminData.phone, adminData.role, adminId]
            );

            // Check if any rows were affected
            if (result[0].affectedRows === 0) {
                throw new Error('Admin not found or no changes made.');
            }

            return { message: 'Admin details updated successfully.' };
        } catch (error) {
            throw new Error(`Error updating admin: ${error.message}`);
        }
    }

    async deleteAdmin(adminId) {
        try {
            const result = await db.query('DELETE FROM admins WHERE admin_id = ?', [adminId]);
            
            // Check if any rows were affected
            if (result[0].affectedRows === 0) {
                throw new Error('Admin not found.');
            }

            return { message: 'Admin deleted successfully.' };
        } catch (error) {
            throw new Error(`Error deleting admin: ${error.message}`);
        }
    }

    async getAdminProfileById(adminId) {
        const [admin] = await db.query('SELECT * FROM admins WHERE admin_id = ?', [adminId]);
        return admin[0]; // Return the first record found
    }
}

module.exports = new AdminModel();
