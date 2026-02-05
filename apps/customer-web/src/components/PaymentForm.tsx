import React, { useState, useEffect } from 'react';
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
    const [paymentElementReady, setPaymentElementReady] = useState(false);

    // Check if PaymentElement is properly mounted
    useEffect(() => {
        if (elements) {
            const checkPaymentElement = async () => {
                try {
                    const paymentElement = elements.getElement('payment');
                    setPaymentElementReady(!!paymentElement);
                    console.log('PaymentElement ready:', !!paymentElement);
                    
                    // If PaymentElement is not mounted, try to mount it
                    if (!paymentElement && stripe) {
                        console.log('Attempting to mount PaymentElement...');
                        const container = document.getElementById('payment-element-container');
                        if (container) {
                            const element = stripe.elements().create('payment');
                            element.mount(container);
                            setPaymentElementReady(true);
                            console.log('PaymentElement mounted successfully');
                        }
                    }
                } catch (err) {
                    console.error('Error checking PaymentElement:', err);
                    setPaymentElementReady(false);
                }
            };
            
            // Small delay to ensure element is mounted
            const timer = setTimeout(checkPaymentElement, 100);
            return () => clearTimeout(timer);
        }
    }, [elements, stripe]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) {
            console.error('Stripe or Elements not available');
            return;
        }

        if (!paymentElementReady) {
            console.error('PaymentElement is not ready');
            setErrorMessage('Payment form is loading. Please wait a moment and try again.');
            return;
        }

        setLoading(true);
        setErrorMessage(null);

        try {
            console.log('Attempting payment with:', {
                stripeLoaded: !!stripe,
                elementsLoaded: !!elements,
                paymentElementReady
            });

            const { error, paymentIntent } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    // Make sure to change this to your payment completion page
                    return_url: `${window.location.origin}/orders`,
                },
                redirect: 'if_required',
            });

            if (error) {
                console.error('Stripe payment error:', error);
                setErrorMessage(error.message || 'An unexpected error occurred.');
                onError(error.message || 'Payment failed');
            } else if (paymentIntent && paymentIntent.status === 'succeeded') {
                console.log('Payment succeeded:', paymentIntent.id);
                onSuccess(paymentIntent.id);
            } else {
                console.warn('Payment status unknown:', paymentIntent?.status);
                setErrorMessage('Payment status: ' + (paymentIntent?.status || 'unknown'));
            }
        } catch (err: any) {
            console.error('Payment exception:', err);
            setErrorMessage(err.message || 'An unexpected error occurred.');
            onError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }} id="payment-element-container">
                {/* PaymentElement will be dynamically mounted here */}
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
