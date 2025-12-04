import { loadStripe } from '@stripe/stripe-js';

// Make sure to add VITE_STRIPE_PUBLISHABLE_KEY to your .env file
const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';
const stripePromise = loadStripe(publishableKey);

export default stripePromise;