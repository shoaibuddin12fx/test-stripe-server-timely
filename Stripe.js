const { response } = require("express");

require("dotenv").config();

const stripe = require("stripe")(
  "sk_test_51OeglILUeFL12yLIIDqRbiKaP8KQg2xRctXCPWO6Fm1rcWMFsbqJG18bBZHojNhb2cOJL5pHUY7KSJoeH7wCVyAy00SowCyTUT"
);

const Stripe_Prebuild_checkout = async () => {
  return new Promise((resolve) => {
    setTimeout(async () => {
      // let obj = {
      //     success_url: `${process.env.REACT_APP_CLIENT_DOMAIN_URL}/stripe-checkout-success`,
      //     cancel_url: `${process.env.REACT_APP_CLIENT_DOMAIN_URL}/stripe-checkout-failure`,
      // }
      // resolve(obj);
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: "Stubborn Attachments Book",
              },
              unit_amount: 2000,
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: `${process.env.REACT_APP_CLIENT_DOMAIN_URL}?success=true`,
        cancel_url: `${process.env.REACT_APP_CLIENT_DOMAIN_URL}?canceled=true`,
      });

      resolve({ clientSecret: session.client_secret });
    }, 1000);
  });
};

const getStripeProducts = async () => {
  return new Promise(async (resolve) => {
    const products = await stripe.products.list();

    // Iterate through products and fetch associated prices
    const productsWithPrices = await Promise.all(
      products.data.map(async (product) => {
        const prices = await stripe.prices.list({ product: product.id });
        return { ...product, prices: prices.data };
      })
    );

    resolve(productsWithPrices);
  });
};

const getClientSecret = async (res) => {
  try {
    const setupIntent = await stripe.setupIntents.create({
      usage: "off_session",
    });

    res.json({ clientSecret: setupIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const postCreateSubscription = async (req) => {
  return new Promise(async (resolve) => {
    try {
      const { price, PaymentMethod, email, quantity } = req.body;

      // Check if any required field is missing
      if (!price || !PaymentMethod || !email) {
        console.error("Error: Missing required fields");
        resolve({ ok: false, error: "Missing required fields" });
        return;
      }

      // Check if a customer with the given email already exists
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      let customer;
      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: email,
        });
      }
      await stripe.paymentMethods.attach(PaymentMethod, {
        customer: customer.id,
      });
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: price, quantity: quantity }],
        default_payment_method: PaymentMethod,
      });

      console.log(subscription, "Subscription created successfully");

      resolve({ ok: true, subscription });
    } catch (error) {
      console.error("Error creating subscription:", error);
      resolve({ ok: false });
    }
  });
};

const processPayment = async (req) => {
  return new Promise(async (resolve) => {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        payment_method: paymentMethodId,
        amount: 1000,
        currency: "usd",
        confirmation_method: "manual",
        confirm: true,
      });

      res.json({ client_secret: paymentIntent.client_secret });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).send({ error: "Payment failed" });
    }
  });
};

const getStripeSubscriptions = async (email) => {
  return new Promise(async (resolve) => {
    try {
      const existingCustomers = await stripe.customers.list({
        email: email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        const customer = existingCustomers.data[0];
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
        });

        resolve({ ok: true, subscriptions: subscriptions.data });
      } else {
        resolve({ ok: false, error: "Customer not found" });
      }
    } catch (error) {
      console.error("Error getting subscriptions:", error);
      resolve({ ok: false });
    }
  });
};

const getSubscriptionStatus = async (subscriptionId) => {
  return new Promise(async (resolve) => {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);

      if (subscription) {
        const status = subscription.status;
        const quantity = subscription.quantity;

        resolve({ ok: true, status, quantity });
      } else {
        resolve({ ok: false });
      }
    } catch (error) {
      console.error("Error retrieving subscription:", error);
      resolve({ ok: false });
    }
  });
};

const cancelStripeSubscription = async (subscriptionId) => {
  return new Promise(async (resolve) => {
    try {
      const canceledSubscription  = await stripe.subscriptions.del(subscriptionId);

      if (canceledSubscription) {       
        resolve({ ok: true, subscriptions: canceledSubscription });
      } else {
        resolve({ ok: false, error: "Subscription not found" });
      }
    } catch (error) {
      console.error("Error getting subscriptions:", error);
      resolve({ ok: false });
    }
  });
};

const updateStripeSubscription = async (subscriptionId, itemId, quantity) => {
    return new Promise(async (resolve) => {
      try {
        const updateSubscription  = await stripe.subscriptions.update(subscriptionId, {
            items: [
                {
                    id: itemId,
                    quantity: quantity,
                }
            ]
        });
  
        if (updateSubscription) {       
          resolve({ ok: true, subscriptions: updateSubscription });
        } else {
          resolve({ ok: false, error: "Subscription not found" });
        }
      } catch (error) {
        console.error("Error getting subscriptions:", error);
        resolve({ ok: false });
      }
    });
  };

module.exports = {
  Stripe_Prebuild_checkout,
  getStripeProducts,
  postCreateSubscription,
  getClientSecret,
  processPayment,
  getStripeSubscriptions,
  getSubscriptionStatus,
  cancelStripeSubscription,
  updateStripeSubscription
};
