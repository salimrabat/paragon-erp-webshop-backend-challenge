const express = require('express');
const PostgresqlDBHandler = require("../database/queries");
const router = express.Router();


router.get('/', async (req, res) => {
    await new PostgresqlDBHandler().testConnection()
        .then(_ => {
            res.status(200).json({
                message: "Connection working"
            });
        })
        .catch(reason => {
            console.log('Could not fetch all users from database', reason);
        })
})

/**
 * Api request to get all users in the database.
 */
router.get('/users', async (req, res) => {
    await new PostgresqlDBHandler().getAllUsers()
        .then(users => {
            res.status(200).json({
                users: users
            });
        })
        .catch(reason => {
            console.log('Could not fetch all users from database', reason);
        })
})

/**
 * Api request to get user by id.
 */
router.get('/user', async (req, res) => {
    await new PostgresqlDBHandler().getUserById(req.query.id)
        .then(user => {
            res.status(200).json({
                user: user
            });
        })
        .catch(reason => {
            console.log('Could not fetch user from database', reason);
        })
})


/**
 * Api request to get all products in the database.
 */
router.get('/products', async (req, res) => {
    await new PostgresqlDBHandler().getAllProducts()
        .then(products => {
            res.status(200).json({
                products: products
            });
        })
        .catch(reason => {
            console.log('Could not fetch all products from database', reason);
        })
})


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
    const pgHandler = new PostgresqlDBHandler()
    const userId = req.body.userId
    let streetAddress = req.body.streetAddress
    let postalCode = req.body.postalCode
    let city = req.body.city
    let country = req.body.country
    let products = req.body.products

    let user = await pgHandler.getUserById(userId)
    if (user === null || user === undefined) {
        return res.status(200).json({
            message: "User does not exist",
            userId: req.body.userId
        });
    }
    for (let i = 0; i < products.length; i++) {
        let product = products[i]
        let result = await pgHandler.getProductByIdAndCheckIfInStock(product.id, product.quantity)
        if (result === null || result === undefined) {
            return res.status(200).json({
                message: "Product out of stock",
                productId: product.id
            });
        }
    }
    await pgHandler.createOrder(userId, streetAddress, postalCode, city, country, products)
        .then(orderId => {
            res.status(200).json({
                orderId: orderId,
                message: "Order Confirmed!"
            });
        })
        .catch(reason => {
            res.status(500).json({
                message: "Order not created"
            });
            console.log('Could not create order', reason);
        })

})

module.exports = router;