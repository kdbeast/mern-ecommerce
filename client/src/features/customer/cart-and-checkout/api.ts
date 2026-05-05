import type {
  AppliedPromo,
  CheckoutDataResponse,
  CustomerCartResponse,
  SyncCustomerCartBody,
  CheckoutPointsResponse,
  CheckoutConfirmResponse,
  AddCustomerCartItemBody,
  CheckoutSessionResponse,
  CustomerCartItemIdentifier,
  CheckoutPayWithPointsResponse,
} from "./types";
import { getCustomerAddresses } from "../profile/api";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api";

const buildCartItemUrl = (
  item: CustomerCartItemIdentifier,
  action?: "increase" | "decrease",
) => {
  const searchParams = new URLSearchParams();

  if (item.color) searchParams.set("color", item.color);
  if (item.size) searchParams.set("size", item.size);

  const query = searchParams.toString();
  const actionPath = action ? `/${action}` : "";
  const path = `/customer/cart/items/${item.productId}${actionPath}`;

  return query ? `${path}?${query}` : path;
};

export const getCustomerCart = () =>
  apiGet<CustomerCartResponse>("/customer/cart");

export const addCustomerCartItem = (body: AddCustomerCartItemBody) =>
  apiPost<CustomerCartResponse, AddCustomerCartItemBody>(
    "/customer/cart/items",
    body,
  );

export const increaseCustomerCartItem = (item: CustomerCartItemIdentifier) =>
  apiPatch<CustomerCartResponse>(buildCartItemUrl(item, "increase"));

export const decreaseCustomerCartItem = (item: CustomerCartItemIdentifier) =>
  apiPatch<CustomerCartResponse>(buildCartItemUrl(item, "decrease"));

export const removeCustomerCartItem = (item: CustomerCartItemIdentifier) =>
  apiDelete<CustomerCartResponse>(buildCartItemUrl(item));

export const syncCustomerCart = (body: SyncCustomerCartBody) =>
  apiPost<CustomerCartResponse, SyncCustomerCartBody>(
    "/customer/cart/sync",
    body,
  );

// checkout apis

export const getCheckoutPoints = () =>
  apiGet<CheckoutPointsResponse>("/customer/checkout/points");

export const getCheckoutData = async (): Promise<CheckoutDataResponse> => {
  const [cart, addresses, checkoutPoints] = await Promise.all([
    getCustomerCart(),
    getCustomerAddresses(),
    getCheckoutPoints(),
  ]);

  const safeCart = cart ?? { items: [], totalQuantity: 0 };
  const safeAddresseds = addresses ?? { items: [] };

  const subtotal = safeCart.items.reduce(
    (sum, item) => sum + item.finalPrice * item.quantity,
    0,
  );

  return {
    cart: safeCart,
    addresses: safeAddresseds,
    subtotal,
    points: checkoutPoints.points ?? 0,
  };
};

export const applyCustomerPromo = (body: {
  code: string;
  orderValue: number;
}) =>
  apiPost<AppliedPromo, { code: string; orderValue: number }>(
    "/customer/promos/apply",
    body,
  );

export const createCheckoutSession = (body: {
  addressId: string;
  promoCode?: string;
}) =>
  apiPost<CheckoutSessionResponse, typeof body>(
    "/customer/checkout/create-session",
    body,
  );

export const payWithPointsCheckout = (body: {
  addressId: string;
  promoCode?: string;
}) =>
  apiPost<CheckoutPayWithPointsResponse, typeof body>(
    "/customer/checkout/pay-with-points",
    body,
  );

export const confirmCheckout = (body: {
  orderId: string;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}) =>
  apiPost<CheckoutConfirmResponse, typeof body>(
    "/customer/checkout/confirm",
    body,
  );
