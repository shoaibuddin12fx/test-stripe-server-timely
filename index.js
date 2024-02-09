const cors = require('cors');

const { Stripe_Prebuild_checkout } = require('./Stripe')
require('dotenv').config()



const express = require('express')
const app = express()


const corsOptions = {
    origin:"https://localhost:3000",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    "Access-Control-Allow-Origin": "*"
};
  app.use(cors(corsOptions));

app.listen(3001, () => {
    console.log(`Server running at ${process.env.APP_SERVER_DOMAIN_URL}`)
})

app.get('/', (_, res) => {
    res.redirect(308, `/create-checkout-session`)
})

app.get('/create-checkout-session', async (_, res) => {
    const data = await Stripe_Prebuild_checkout()
    res.json(data);
})

app.post('/stripe-checkout-session', async (_, res) => {
    const url = await Stripe_Prebuild_checkout()
    res.redirect(303, url)
})