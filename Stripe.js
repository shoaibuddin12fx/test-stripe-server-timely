require("dotenv").config()
const stripe = require('stripe')(process.env.REACT_APP_API_KEY_STRIPE)

const Stripe_Prebuild_checkout = async () => {
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Stubborn Attachments Book',
                    },
                    unit_amount: 2000
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.REACT_APP_CLIENT_DOMAIN_URL}?success=true`,
        cancel_url: `${process.env.REACT_APP_CLIENT_DOMAIN_URL}?canceled=true`,
    })
    return session.url
}

module.exports = { Stripe_Prebuild_checkout }