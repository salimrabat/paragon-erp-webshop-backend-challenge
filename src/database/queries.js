const Knex = require("knex")
const dotenv = require('dotenv');
dotenv.config();

class PostgresqlDBHandler {

    knex
    tableNameUsers
    tableNameProducts
    tableNameOrders
    tableNameOrderContents
    constructor() {

        this.knex = Knex({
            client: 'pg',
            connection: {
                user: process.env.DATABASE_USER,
                password: process.env.DATABASE_PASSWORD,
                host: process.env.DATABASE_HOST,
                port: process.env.DATABASE_PORT,
                database: process.env.DATABASE_SCHEMA,
            },
            pool: {
                min: +process.env.DATABASE_POOL_MIN || 0,
                max: +process.env.DATABASE_POOL_MAX || 10,
                idleTimeoutMillis: +process.env.DATABASE_POOL_IDLE || 10000
            },
            acquireConnectionTimeout: 2000
        })
        this.tableNameUsers = process.env.TABLE_NAME_USERS
        this.tableNameProducts = process.env.TABLE_NAME_PRODUCTS
        this.tableNameOrders = process.env.TABLE_NAME_ORDERS
        this.tableNameOrderContents = process.env.TABLE_NAME_ORDER_CONTENTS
    }

    async testConnection() {  // Verify the connection before proceeding
        try {
            await this.knex.raw('SELECT now()')
        } catch (error) {
            throw new Error('Unable to connect to Postgres via Knex. Ensure a valid connection.')
        }
    }

    async getAllUsers() {
        return this.knex(this.tableNameUsers)
    }

    async getUserById(id) {
        return this.knex(this.tableNameUsers).where({
            email: id
        }).first()
    }

    async getAllProducts() {
        return this.knex(this.tableNameProducts)
    }

    async getProductByIdAndCheckIfInStock(id, quantity) {
        return this.knex(this.tableNameProducts).where({
            id: id
        }).andWhere('quantity', '>=', quantity).first()
    }

    async insertOrder(userId, streetAddress, postalCode, city, country) {
        let result = await this.knex.insert({
            user_id: userId,
            order_date: new Date(),
            street_address: streetAddress,
            postal_code: postalCode,
            city: city,
            country: country
        }).returning('id').into(this.tableNameOrders)
        return result[0].id
    }

    async insertOrderContents(orderId, product) {
        return this.knex.insert({
            order_id: orderId,
            product_id: product.id,
            quantity: product.quantity
        }).into(this.tableNameOrderContents)
    }

    async updateProductQuantityById(product) {
        return this.knex(this.tableNameProducts).where({
            id: product.id
        }).decrement({
            quantity: product.quantity
        })
    }

    async createOrder(userId, streetAddress, postalCode, city, country, products) {
        const orderId = await this.insertOrder(userId, streetAddress, postalCode, city, country)
        for (let i = 0; i < products.length; i++) {
            let product = products[i]
            this.insertOrderContents(orderId, product).then(
                await this.updateProductQuantityById(product)
            )
        }
        return orderId
    }
}

module.exports = PostgresqlDBHandler