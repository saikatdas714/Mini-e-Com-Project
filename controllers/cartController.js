const supabase = require('../model/connection');

// ADD PRODUCT TO CART
async function addToCart(userId, productId) {
    const { error } = await supabase
        .from('cart')
        .upsert(
            { user_id: userId, product_id: productId },
            { onConflict: 'user_id, product_id', ignoreDuplicates: true }
        );

    if (error) {
        throw new Error(error.message);
    }
}

// GET USER CART
async function getCart(userId) {
    const { data, error } = await supabase
        .from('cart')
        .select(`
            id,
            product_id,
            products (
                id,
                name,
                price,
                description,
                image
            )
        `)
        .eq('user_id', userId);

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        return [];
    }

    return data
        .filter(item => item.products)
        .map(item => ({
            id: item.id,
            product_id: item.product_id,
            name: item.products.name,
            price: item.products.price,
            description: item.products.description,
            image: item.products.image
        }));
}

// REMOVE PRODUCT FROM CART
async function removeFromCart(userId, productId) {
    const { error } = await supabase
        .from('cart')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

    if (error) {
        throw new Error(error.message);
    }
}

module.exports = {
    addToCart,
    getCart,
    removeFromCart
};
