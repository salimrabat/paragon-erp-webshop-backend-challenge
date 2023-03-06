const express = require('express');
const PostgresqlDBHandler = require("../database/queries");
const router = express.Router();
const dataBase = new PostgresqlDBHandler()


/**
 * Test database connection
 */
router.get('/', async (req, res) => {
    try {
        await dataBase.testConnection()
        res.status(200).json({
            message: "Connection working"
        });
    } catch (error) {
        console.log('Could not fetch all users from database', error);
        res.status(500).json({
            message: "Could not establish connection to database"
        });
    }
});

/**
 * Api request to get all users in the database.
 */
router.get('/users', async (req, res) => {
    try {
        const users = await dataBase.getAllUsers();
        res.status(200).json({
            users: users
        });
    } catch (error) {
        console.log('Could not fetch all users from database', error);
        res.status(500).json({
            message: "Could not fetch all users from database"
        });
    }
});

/**
 * Api request to get user by id.
 */
router.get('/user', async (req, res) => {
    try {
        const userId = req.query.id;
        const user = await dataBase.getUserById(userId);
        if (user) {
            res.status(200).json({
                user: user
            });
        } else {
            res.status(204).json({
                message: "User not found"
            });
        }
    } catch (error) {
        console.log('Could not fetch user from database', error);
        res.status(500).json({
            message: "Could not fetch user from database"
        });
    }
});


/**
 * Api request to get all products in the database.
 */
router.get('/products', async (req, res) => {
    try {
        const products = await dataBase.getAllProducts();
        res.status(200).json({
            products: products
        });
    } catch (error) {
        console.log('Could not fetch all products from database', error);
        res.status(500).json({
            message: "Could not fetch all products from database"
        });
    }
});


/**
 * Api request to create a new order.
 * @param {String} userId
 * @param {String} streetAddress
 * @param {String} postalCode
 * @param {String} city
 * @param {String} country
 * @param {Array} products
 */
router.post('/order', async (req, res) => {
    const { userId, streetAddress, postalCode, city, country, products } = req.body;

    // Validate the request body
    if (!userId || typeof userId !== 'string' ||
        !streetAddress || typeof streetAddress !== 'string' ||
        !postalCode || typeof postalCode !== 'string' ||
        !city || typeof city !== 'string' ||
        !country || typeof country !== 'string' ||
        !Array.isArray(products)) {
        return res.status(400).json({ message: 'Invalid request body' });
    }

    // Check if the user exists
    const user = await dataBase.getUserById(userId);
    if (!user) {
        return res.status(404).json({
            message: 'User not found',
            userId
        });
    }

    for (const product of products) {
        const result = await dataBase.getProductByIdAndCheckIfInStock(product.id, product.quantity);
        if (!result) {
            return res.status(400).json({
                message: "Product out of stock",
                productId: product.id
            });
        }
    }

    try {
        const orderId = await dataBase.createOrder(userId, streetAddress, postalCode, city, country, products);
        res.status(201).json({
            orderId,
            message: 'Order confirmed'
        });
    } catch (error) {
        console.error('Could not create order', error);
        res.status(500).json({ message: 'Internal server error' });
    }

})

module.exports = router;