const { Stripe_Prebuild_checkout } = require('./Stripe')
require('dotenv').config()
const express = require('express')
const app = express()

app.listen(3001, () => {
    console.log(`Server running at ${process.env.APP_SERVER_DOMAIN_URL}`)
})

app.get('/', (_, res) => {
    res.redirect(308, `${process.env.APP_SERVER_DOMAIN_URL}/create-checkout-session`)
})

app.get('/create-checkout-session', async (_, res) => {
    const url = await Stripe_Prebuild_checkout()
    res.redirect(303, url)
})