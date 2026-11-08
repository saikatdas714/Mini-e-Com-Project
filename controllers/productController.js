const supabase = require('../model/connection');

// CREATE PRODUCT
async function createProduct(name, price, description, image) {
    const { data, error } = await supabase
        .from('products')
        .insert([{
            name,
            price,
            description,
            image
        }])
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// GET ALL PRODUCTS
async function getProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data || [];
}

// GET PRODUCT BY ID
async function getProductById(id) {
    const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    return data;
}

// UPDATE PRODUCT
async function updateProduct(id, name, price, description, image) {
    const { data, error } = await supabase
        .from('products')
        .update({
            name,
            price,
            description,
            image
        })
        .eq('id', id)
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return Boolean(data && data.length > 0);
}

// DELETE PRODUCT
async function deleteProduct(id) {
    const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select();

    if (error) {
        throw new Error(error.message);
    }

    return Boolean(data && data.length > 0);
}

module.exports = {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
