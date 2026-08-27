const connection = require('../model/connection');


// CREATE PRODUCT
async function createProduct(name, price, description, image) {

    const db = await connection;

    const [result] = await db.execute(
        `INSERT INTO products
        (name, price, description, image)
        VALUES (?, ?, ?, ?)`,
        [name, price, description, image]
    );

    return {
        id: result.insertId,
        name,
        price,
        description,
        image
    };
}


// GET ALL PRODUCTS
async function getProducts() {

    const db = await connection;

    const [products] = await db.execute(
        'SELECT * FROM products'
    );

    return products;
}


// GET PRODUCT BY ID
async function getProductById(id) {

    const db = await connection;

    const [products] = await db.execute(
        'SELECT * FROM products WHERE id = ?',
        [id]
    );

    if (products.length === 0) {
        return null;
    }

    return products[0];
}


// UPDATE PRODUCT
async function updateProduct(
    id,
    name,
    price,
    description,
    image
) {

    const db = await connection;

    const [result] = await db.execute(
        `UPDATE products
         SET name = ?,
             price = ?,
             description = ?,
             image = ?
         WHERE id = ?`,
        [name, price, description, image, id]
    );

    return result.affectedRows > 0;
}


// DELETE PRODUCT
async function deleteProduct(id) {

    const db = await connection;

    const [result] = await db.execute(
        'DELETE FROM products WHERE id = ?',
        [id]
    );

    return result.affectedRows > 0;
}


module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};