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

const postCreateSubscription = async (req) => {
  return new Promise(async (resolve) => {
    try {
      const { productId, paymentMethodId } = req.body;

      const subscription = await stripe.subscriptions.create({
        items: [{ price: productId }],
        default_payment_method: paymentMethodId,
        // Add other subscription parameters as needed
      });

      res.status(200).json({ subscription });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ error: "Subscription creation failed" });
    }
  });
};

module.exports = { Stripe_Prebuild_checkout, getStripeProducts, postCreateSubscription };
