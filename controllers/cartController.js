const connection = require('../model/connection');


// ADD PRODUCT TO CART
async function addToCart(userId, productId) {

    const db = await connection;

    await db.execute(
        `INSERT IGNORE INTO cart (user_id, product_id)
         VALUES (?, ?)`,
        [userId, productId]
    );
}


// GET USER CART
async function getCart(userId) {

    const db = await connection;

    const [cart] = await db.execute(
        `SELECT
            cart.id,
            products.id AS product_id,
            products.name,
            products.price,
            products.description,
            products.image
         FROM cart
         JOIN products
         ON cart.product_id = products.id
         WHERE cart.user_id = ?`,
        [userId]
    );

    return cart;
}


// REMOVE PRODUCT FROM CART
async function removeFromCart(userId, productId) {

    const db = await connection;

    await db.execute(
        `DELETE FROM cart
         WHERE user_id = ? AND product_id = ?`,
        [userId, productId]
    );
}


module.exports = {
    addToCart,
    getCart,
    removeFromCart
};