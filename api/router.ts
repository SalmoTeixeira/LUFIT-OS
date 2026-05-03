import { authRouter } from "./auth-router";
import { dashboardRouter } from "./dashboard-router";
import { orderRouter } from "./order-router";
import { productRouter } from "./product-router";
import { inventoryRouter } from "./inventory-router";
import { paymentRouter } from "./payment-router";
import { shippingRouter } from "./shipping-router";
import { cartRouter } from "./cart-router";
import { mercadopagoRouter } from "./mercadopago-router";
import { kanguRouter } from "./kangu-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  dashboard: dashboardRouter,
  order: orderRouter,
  product: productRouter,
  inventory: inventoryRouter,
  payment: paymentRouter,
  shipping: shippingRouter,
  cart: cartRouter,
  mercadopago: mercadopagoRouter,
  kangu: kanguRouter,
});

export type AppRouter = typeof appRouter;
