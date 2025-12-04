import React, { useState } from 'react';
import {
    PaymentElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js';
import { Button, CircularProgress, Alert, Box } from '@mui/material';

interface PaymentFormProps {
    onSuccess: (paymentIntentId: string) => void;
    onError: (error: string) => void;
    amount: number;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSuccess, onError, amount }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setLoading(true);
        setErrorMessage(null);

        try {
            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    // Make sure to change this to your payment completion page
                    return_url: `${window.location.origin}/orders`,
                },
                redirect: 'if_required',
            });

            if (error) {
                setErrorMessage(error.message || 'An unexpected error occurred.');
                onError(error.message || 'Payment failed');
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent.id);
            } else {
                setErrorMessage('Payment status: ' + (paymentIntent?.status || 'unknown'));
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'An unexpected error occurred.');
            onError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
                <PaymentElement />
            </Box>

            {errorMessage && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {errorMessage}
                </Alert>
            )}

            <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={!stripe || loading}
                sx={{ py: 1.5, fontSize: '1.1rem' }}
            >
                {loading ? <CircularProgress size={24} color="inherit" /> : `Pay $${amount.toFixed(2)}`}
            </Button>
        </form>
    );
};

export default PaymentForm;
