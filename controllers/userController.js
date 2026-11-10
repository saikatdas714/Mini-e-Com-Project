const bcrypt = require('bcrypt');
const supabase = require('../model/connection');

// CREATE USER
async function createUser(name, email, password, role = 'normal') {
    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (checkError) {
        throw new Error(checkError.message);
    }

    if (existingUser) {
        throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([{
            name,
            email,
            password: hashedPassword,
            role
        }])
        .select('id, name, email, role')
        .single();

    if (insertError) {
        throw new Error(insertError.message);
    }

    return newUser;
}

// GET ALL USERS
async function getUsers() {
    const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .order('id', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data || [];
}

// GET USER BY ID
async function getUserById(id) {
    const { data, error } = await supabase
        .from('users')
        .select('id, name, email, role')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// GET USER BY EMAIL OR USERNAME
async function getUserByEmail(identifier) {
    if (!identifier) return null;

    const trimmed = identifier.trim();
    const prefix = trimmed.includes('@') ? trimmed.split('@')[0] : trimmed;

    const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${trimmed},name.eq.${trimmed},email.eq.${prefix},name.eq.${prefix}`)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// LOGIN / CHECK PASSWORD
async function loginUser(email, password) {
    const user = await getUserByEmail(email);

    if (!user) {
        return null;
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return null;
    }

    // Don't send password to the rest of the application
    delete user.password;

    return user;
}

// UPDATE USER
async function updateUser(id, name, email) {
    const { data, error } = await supabase
        .from('users')
        .update({ name, email })
        .eq('id', id)
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// UPDATE PASSWORD
async function updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const { data, error } = await supabase
        .from('users')
        .update({ password: hashedPassword })
        .eq('id', id)
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// UPDATE ROLE
async function updateRole(id, role) {
    const { data, error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', id)
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// DELETE USER
async function deleteUser(id) {
    const { data, error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return data;
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
