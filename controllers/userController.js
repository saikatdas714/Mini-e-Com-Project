const bcrypt = require('bcrypt');
const connection = require('../model/connection');


// CREATE USER
async function createUser(name, email, password, role = 'normal') {
    const db = await connection;

    // Check if email already exists
    const [existingUser] = await db.execute(
        'SELECT id FROM users WHERE email = ?',
        [email]
    );

    if (existingUser.length > 0) {
        throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.execute(
        `INSERT INTO users (name, email, password, role)
         VALUES (?, ?, ?, ?)`,
        [name, email, hashedPassword, role]
    );

    return result;
}


// GET ALL USERS
async function getUsers() {
    const db = await connection;

    const [users] = await db.execute(
        'SELECT id, name, email, role FROM users'
    );

    return users;
}


// GET USER BY ID
async function getUserById(id) {
    const db = await connection;

    const [users] = await db.execute(
        'SELECT id, name, email, role FROM users WHERE id = ?',
        [id]
    );

    return users[0];
}


// GET USER BY EMAIL
async function getUserByEmail(email) {
    const db = await connection;

    const [users] = await db.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );

    return users[0];
}


// LOGIN / CHECK PASSWORD
async function loginUser(email, password) {
    const user = await getUserByEmail(email);

    if (!user) {
        return null;
    }

    const match = await bcrypt.compare(
        password,
        user.password
    );

    if (!match) {
        return null;
    }

    // Don't send password to the rest of the application
    delete user.password;

    return user;
}


// UPDATE USER
async function updateUser(id, name, email) {
    const db = await connection;

    const [result] = await db.execute(
        `UPDATE users
         SET name = ?, email = ?
         WHERE id = ?`,
        [name, email, id]
    );

    return result;
}


// UPDATE PASSWORD
async function updatePassword(id, newPassword) {
    const db = await connection;

    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    const [result] = await db.execute(
        `UPDATE users
         SET password = ?
         WHERE id = ?`,
        [hashedPassword, id]
    );

    return result;
}


// UPDATE ROLE
async function updateRole(id, role) {
    const db = await connection;

    const [result] = await db.execute(
        `UPDATE users
         SET role = ?
         WHERE id = ?`,
        [role, id]
    );

    return result;
}


// DELETE USER
async function deleteUser(id) {
    const db = await connection;

    const [result] = await db.execute(
        'DELETE FROM users WHERE id = ?',
        [id]
    );

    return result;
}


module.exports = {
    createUser,
    getUsers,
    getUserById,
    getUserByEmail,
    loginUser,
    updateUser,
    updatePassword,
    updateRole,
    deleteUser
};