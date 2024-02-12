const cors = require('cors');

const { Stripe_Prebuild_checkout, getStripeProducts, postCreateSubscription } = require('./Stripe')
require('dotenv').config()



const express = require('express')
const app = express()


app.use(function(req, res, next) {
    var oneof = false;
    if(req.headers.origin) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        oneof = true;
    }
    if(req.headers['access-control-request-method']) {
        res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
        oneof = true;
    }
    if(req.headers['access-control-request-headers']) {
        res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
        oneof = true;
    }
    if(oneof) {
        res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
    }

    // intercept OPTIONS method
    if (oneof && req.method == 'OPTIONS') {
        res.send(200);
    }
    else {
        next();
    }
});

app.listen(3001, () => {
    console.log(`Server running at ${process.env.APP_SERVER_DOMAIN_URL}`)
})

// app.get('/', (_, res) => {
//     res.redirect(308, `/create-checkout-session`)
// })

app.get('/get-stripe-products', async (_, res) => {
  const data = await getStripeProducts()
  res.json(data);
})

app.post('/create-subscription', async (req, res) => {

  const data = await postCreateSubscription(req)
  res.send(data);

})

app.get('/create-checkout-session', async (_, res) => {
    const data = await Stripe_Prebuild_checkout()
    res.json(data);
})

app.post('/stripe-checkout-session', async (_, res) => {
    const url = await Stripe_Prebuild_checkout()
    res.redirect(303, url)
})

app.get('/stripe-checkout-success', async (req, res) => {
    const sessionId = req.query.session_id;
  
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
  
      // Check if the payment was successful
      if (session.payment_status === 'paid') {
        // Update your application state or handle other success-related logic
        res.send('Payment successful!');
      } else {
        res.send('Payment not successful.');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving session information.');
    }
  });
  
  app.get('/stripe-checkout-failure', async (req, res) => {
    const sessionId = req.query.session_id;
  
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
  
      // Handle cancellation or failure logic
      res.send(`Payment canceled or failed: ${session.payment_status}`);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error retrieving session information.');
    }
  });
