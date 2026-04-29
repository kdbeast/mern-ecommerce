import Razorpay from "razorpay";

const checkEnv = (name: string): string => {
  const extractValue = process.env[name];

  if (!extractValue) {
    throw new Error(`${name} not found `);
  }

  return extractValue;
};

export const razorpay = new Razorpay({
  key_id: checkEnv("RAZORPAY_KEY_ID"),
  key_secret: checkEnv("RAZORPAY_KEY_SECRET"),
});

export const toSubUnits = (amount: number) => {
  return Math.round(amount * 100);
};
