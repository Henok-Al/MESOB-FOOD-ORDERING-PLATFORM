import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button, CircularProgress, Box, Alert, Typography } from '@mui/material';

interface PaymentFormProps {
    clientSecret: string;
    amount: number;
    onSuccess: (paymentIntentId: string) => void;
    onError: (error: string) => void;
}

const CARD_ELEMENT_OPTIONS = {
    style: {
        base: {
            fontSize: '16px',
            color: '#424770',
            '::placeholder': {
                color: '#aab7c4',
            },
        },
        invalid: {
            color: '#9e2146',
        },
    },
};

const PaymentForm: React.FC<PaymentFormProps> = ({ clientSecret, amount, onSuccess, onError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setProcessing(true);
        setError(null);

        const cardElement = elements.getElement(CardElement);

        if (!cardElement) {
            setError('Card element not found');
            setProcessing(false);
            return;
        }

        try {
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                },
            });

            if (stripeError) {
                setError(stripeError.message || 'Payment failed');
                onError(stripeError.message || 'Payment failed');
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent.id);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
            onError(err.message || 'An error occurred');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Payment Details
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Total Amount: ${amount.toFixed(2)}
                </Typography>

                <Box
                    sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                    }}
                >
                    {/* @ts-ignore - Stripe CardElement type mismatch with React 18 */}
                    <CardElement options={CARD_ELEMENT_OPTIONS} />
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {error}
                    </Alert>
                )}
            </Box>

            <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={!stripe || processing}
                startIcon={processing && <CircularProgress size={20} />}
            >
                {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
            </Button>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
                Your payment information is secure and encrypted
            </Typography>
        </form>
    );
};

export default PaymentForm;
