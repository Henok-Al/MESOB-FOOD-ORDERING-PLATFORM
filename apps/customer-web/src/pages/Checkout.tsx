import React, { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Paper,
    TextField,
    Button,
    RadioGroup,
    FormControlLabel,
    Radio,
    Divider,
    Alert,
    CircularProgress,
    Stack,
    Chip,
    Stepper,
    Step,
    StepLabel,
    InputAdornment,
    Switch,
    FormControl,
    Checkbox,
    Collapse,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { LocalOffer, InfoOutlined, ShieldOutlined, AccountBalanceWallet, Stars, ExpandMore, ExpandLess, AttachMoney } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { RootState } from '../store';
import { clearCart } from '../store/slices/cartSlice';
import api from '../services/api';
import stripePromise from '../config/stripe';
import PaymentForm from '../components/PaymentForm';
import { useAuth } from '../hooks/useAuth';
import { getWallet, Wallet as WalletType } from '../services/walletService';
import { getLoyaltyAccount, calculatePotentialPoints, calculateDiscountFromPoints, LoyaltyAccount } from '../services/loyaltyService';

const Checkout: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const cart = useSelector((state: RootState) => state.cart);
    const { isLoading } = useAuth(); // This will redirect to login if not authenticated

    const [address, setAddress] = useState('');
    const [contactInfo, setContactInfo] = useState({ fullName: '', phone: '' });
    const [instructions, setInstructions] = useState('');
    const [contactlessDelivery, setContactlessDelivery] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [promoCode, setPromoCode] = useState('');
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [promoMessage, setPromoMessage] = useState<string | null>(null);
    const [isApplyingPromo, setIsApplyingPromo] = useState(false);

    // Wallet state
    const [walletBalance, setWalletBalance] = useState<number>(0);
    const [useWallet, setUseWallet] = useState(false);
    const [walletExpanded, setWalletExpanded] = useState(false);

    // Loyalty state
    const [loyaltyPoints, setLoyaltyPoints] = useState<number>(0);
    const [loyaltyTier, setLoyaltyTier] = useState<string>('bronze');
    const [useLoyalty, setUseLoyalty] = useState(false);
    const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
    const [loyaltyExpanded, setLoyaltyExpanded] = useState(false);

    // Load wallet and loyalty data
    useEffect(() => {
        const fetchWalletAndLoyalty = async () => {
            try {
                const [walletData, loyaltyData] = await Promise.all([
                    getWallet().catch(() => null),
                    getLoyaltyAccount().catch(() => null)
                ]);
                
                if (walletData?.wallet) {
                    setWalletBalance(walletData.wallet.balance);
                }
                if (loyaltyData) {
                    setLoyaltyPoints(loyaltyData.points);
                    setLoyaltyTier(loyaltyData.tier);
                }
            } catch (err) {
                console.log('Could not load wallet/loyalty data');
            }
        };
        fetchWalletAndLoyalty();
    }, []);

    const subtotal = cart.total;
    const deliveryFee = 2.99;
    const discountAmount = Number((subtotal * promoDiscount).toFixed(2));
    
    // Calculate loyalty discount
    const loyaltyDiscount = useLoyalty ? calculateDiscountFromPoints(pointsToRedeem) : 0;
    
    // Calculate wallet discount
    const walletDiscount = useWallet && walletBalance > 0 ? Math.min(walletBalance, subtotal - discountAmount - loyaltyDiscount) : 0;
    
    // Final total after all discounts
    const totalAfterDiscounts = Math.max(subtotal - discountAmount - loyaltyDiscount - walletDiscount + deliveryFee, 0);
    const totalAmount = totalAfterDiscounts;
    
    // Calculate points to be earned
    const potentialPoints = calculatePotentialPoints(totalAfterDiscounts, loyaltyTier);
    
    const checkoutSteps = ['Delivery Details', 'Payment', 'Confirmation'];
    const activeStep = Math.min((address ? 1 : 0) + (paymentMethod ? 1 : 0), checkoutSteps.length - 1);
    const stripeOptions = useMemo(() => (
        clientSecret
            ? {
                clientSecret,
                appearance: {
                    theme: 'flat' as const,
                    variables: {
                        colorPrimary: '#FF4B2B',
                        fontFamily: '"Outfit", "Inter", sans-serif',
                    },
                },
            }
            : undefined
    ), [clientSecret]);

    useEffect(() => {
        if (paymentMethod === 'card') {
            const fetchClientSecret = async () => {
                try {
                    const response = await api.post('/payments/create-intent', {
                        amount: totalAmount,
                        currency: 'usd',
                        metadata: {
                            restaurantId: cart.restaurantId,
                        }
                    });
                    setClientSecret(response.data.data.clientSecret);
                } catch (err: any) {
                    console.error('Failed to fetch client secret:', err);
                    if (err.response?.status === 401) {
                        setError('Please log in to continue with checkout.');
                        navigate('/login');
                    } else {
                        setError('Failed to initialize payment system. Please try again.');
                    }
                }
            };

            fetchClientSecret();
        } else {
            setClientSecret(null);
        }
    }, [paymentMethod, totalAmount, cart.restaurantId, navigate]);

    // Show loading spinner while authentication is being verified (hooks already declared)
    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (cart.items.length === 0) {
        return (
            <Container sx={{ py: 8, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    Your cart is empty
                </Typography>
                <Button variant="contained" onClick={() => navigate('/')}>
                    Go to Home
                </Button>
            </Container>
        );
    }

    const getOrderData = () => ({
        restaurant: cart.restaurantId,
        items: cart.items.map((item) => ({
            product: item._id,
            name: item.name,
            quantity: item.quantity,
            price: item.price,
        })),
        subtotal,
        totalAmount,
        discount: discountAmount,
        deliveryFee,
        deliveryAddress: address,
        paymentMethod,
        customerNotes: instructions,
        contactName: contactInfo.fullName,
        contactPhone: contactInfo.phone,
        contactlessDelivery,
        promoCode: promoDiscount > 0 ? promoCode : undefined,
    });

    const handlePlaceOrder = async () => {
        if (!address || !contactInfo.fullName || !contactInfo.phone) {
            setError('Please add your contact name, phone, and delivery address.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const orderData = getOrderData();
            await api.post('/orders', orderData);

            dispatch(clearCart());
            navigate('/orders');
        } catch (err: any) {
            console.error('Order failed:', err);
            setError(err.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentSuccess = async (paymentIntentId: string) => {
        if (!address || !contactInfo.fullName || !contactInfo.phone) {
            setError('Please add your contact name, phone, and delivery address.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const orderData = getOrderData();
            await api.post('/payments/confirm', {
                paymentIntentId,
                orderData
            });

            dispatch(clearCart());
            navigate('/orders');
        } catch (err: any) {
            console.error('Order confirmation failed:', err);
            setError(err.response?.data?.message || 'Failed to confirm order');
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentError = (errorMessage: string) => {
        setError(errorMessage);
    };

    const handleApplyPromo = () => {
        if (!promoCode.trim()) {
            setPromoMessage('Enter a promo code to continue.');
            return;
        }

        setIsApplyingPromo(true);
        setPromoMessage(null);

        setTimeout(() => {
            if (promoCode.trim().toUpperCase() === 'SAVE10') {
                setPromoDiscount(0.1);
                setPromoMessage('Promo applied! 10% off your subtotal.');
            } else {
                setPromoDiscount(0);
                setPromoMessage('That code is not valid. Try SAVE10 for 10% off.');
            }
            setIsApplyingPromo(false);
        }, 600);
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6FA', py: 4 }}>
            <Container maxWidth="lg">
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2} sx={{ mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>
                            Checkout
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Securely finalize your order in just a few steps.
                        </Typography>
                    </Box>
                    <Chip label={`${cart.items.length} item${cart.items.length !== 1 ? 's' : ''} in cart`} color="primary" sx={{ fontWeight: 'bold' }} />
                </Stack>

                <Box sx={{ mb: 4 }}>
                    <Stepper activeStep={activeStep} alternativeLabel>
                        {checkoutSteps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                </Box>

                <Paper sx={{ p: 3, borderRadius: 3, mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ShieldOutlined color="primary" />
                    <Box>
                        <Typography fontWeight="bold">Secure payments powered by Stripe</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Your card details are encrypted and never stored on our servers.
                        </Typography>
                    </Box>
                </Paper>

                <Grid container spacing={4}>
                    {/* Left Side - Delivery & Payment */}
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Delivery Details
                            </Typography>

                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Full Name"
                                        value={contactInfo.fullName}
                                        onChange={(e) => setContactInfo((prev) => ({ ...prev, fullName: e.target.value }))}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        value={contactInfo.phone}
                                        onChange={(e) => setContactInfo((prev) => ({ ...prev, phone: e.target.value }))}
                                    />
                                </Grid>
                            </Grid>

                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                placeholder="Street, city, state & zip"
                                label="Delivery Address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                sx={{ mb: 2 }}
                            />

                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Delivery Instructions (optional)"
                                value={instructions}
                                onChange={(e) => setInstructions(e.target.value)}
                                placeholder="Gate code, buzzer, leave at door, etc."
                                sx={{ mb: 2 }}
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={contactlessDelivery}
                                        onChange={(e) => setContactlessDelivery(e.target.checked)}
                                        color="primary"
                                    />
                                }
                                label="Leave at door (contactless delivery)"
                            />
                        </Paper>

                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Payment Method
                            </Typography>
                            <RadioGroup
                                value={paymentMethod}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                sx={{ mb: 3 }}
                            >
                                <FormControlLabel value="card" control={<Radio />} label="Credit/Debit Card" />
                                <FormControlLabel value="cash" control={<Radio />} label="Cash on Delivery" />
                            </RadioGroup>

                            {/* Wallet Option */}
                            {walletBalance > 0 && (
                                <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                    <Box 
                                        display="flex" 
                                        alignItems="center" 
                                        justifyContent="space-between"
                                        onClick={() => setWalletExpanded(!walletExpanded)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <AccountBalanceWallet color="primary" />
                                            <Typography fontWeight="bold">
                                                Use Wallet Balance
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Chip 
                                                label={`${walletBalance.toFixed(2)} available`} 
                                                color="success" 
                                                size="small" 
                                            />
                                            {walletExpanded ? <ExpandLess /> : <ExpandMore />}
                                        </Box>
                                    </Box>
                                    <Collapse in={walletExpanded}>
                                        <Box sx={{ mt: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={useWallet}
                                                        onChange={(e) => setUseWallet(e.target.checked)}
                                                    />
                                                }
                                                label={
                                                    <Typography>
                                                        Apply ${walletDiscount.toFixed(2)} from wallet
                                                    </Typography>
                                                }
                                            />
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                This amount will be deducted from your wallet balance
                                            </Typography>
                                        </Box>
                                    </Collapse>
                                </Paper>
                            )}

                            {/* Loyalty Points Option */}
                            {loyaltyPoints > 0 && (
                                <Paper sx={{ p: 2, mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                                    <Box 
                                        display="flex" 
                                        alignItems="center" 
                                        justifyContent="space-between"
                                        onClick={() => setLoyaltyExpanded(!loyaltyExpanded)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Stars color="warning" />
                                            <Typography fontWeight="bold">
                                                Loyalty Points
                                            </Typography>
                                        </Box>
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Chip 
                                                label={`${loyaltyPoints.toLocaleString()} points`} 
                                                color="warning" 
                                                size="small" 
                                            />
                                            {loyaltyExpanded ? <ExpandLess /> : <ExpandMore />}
                                        </Box>
                                    </Box>
                                    <Collapse in={loyaltyExpanded}>
                                        <Box sx={{ mt: 2 }}>
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={useLoyalty}
                                                        onChange={(e) => setUseLoyalty(e.target.checked)}
                                                    />
                                                }
                                                label={
                                                    <Typography>
                                                        Redeem points for discount
                                                    </Typography>
                                                }
                                            />
                                            {useLoyalty && (
                                                <Box sx={{ mt: 1, ml: 4 }}>
                                                    <TextField
                                                        type="number"
                                                        size="small"
                                                        label="Points to redeem"
                                                        value={pointsToRedeem}
                                                        onChange={(e) => {
                                                            const val = Math.min(Math.max(0, parseInt(e.target.value) || 0), loyaltyPoints);
                                                            setPointsToRedeem(val);
                                                        }}
                                                        inputProps={{ max: loyaltyPoints }}
                                                        helperText={`= ${calculateDiscountFromPoints(pointsToRedeem).toFixed(2)} discount`}
                                                    />
                                                    <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                        {[100, 250, 500, 1000].map((amt) => (
                                                            <Chip
                                                                key={amt}
                                                                label={`${amt} pts`}
                                                                onClick={() => setPointsToRedeem(Math.min(amt, loyaltyPoints))}
                                                                color={pointsToRedeem === amt ? 'primary' : 'default'}
                                                                size="small"
                                                                sx={{ cursor: 'pointer' }}
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            )}
                                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                                                You'll earn ~{potentialPoints.totalPoints} points on this order!
                                            </Typography>
                                        </Box>
                                    </Collapse>
                                </Paper>
                            )}

                            {paymentMethod === 'card' && (
                                <Box sx={{ mt: 2 }}>
                                    {clientSecret ? (
                                        <Elements stripe={stripePromise} options={stripeOptions} key={clientSecret}>
                                            <PaymentForm
                                                amount={totalAmount}
                                                onSuccess={handlePaymentSuccess}
                                                onError={handlePaymentError}
                                            />
                                        </Elements>
                                    ) : (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                                            <CircularProgress size={20} />
                                            <Typography variant="body2" color="text.secondary">
                                                Initializing secure payment fields...
                                            </Typography>
                                        </Box>
                                    )}
                                    <Alert severity="info" sx={{ mt: 2 }} icon={<InfoOutlined fontSize="small" />}>
                                        Use Stripe test cards like 4242 4242 4242 4242 with any future expiry and CVC 123.
                                    </Alert>
                                </Box>
                            )}
                        </Paper>
                    </Grid>

                    {/* Right Side - Order Summary */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, borderRadius: 3, position: 'sticky', top: 24 }}>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                                Order Summary
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
                                {cart.items.map((item) => (
                                    <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                                        <Typography variant="body2">
                                            {item.quantity}x {item.name}
                                        </Typography>
                                        <Typography variant="body2" fontWeight="bold">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography color="text.secondary">Subtotal</Typography>
                                <Typography fontWeight="bold">${subtotal.toFixed(2)}</Typography>
                            </Box>
                            {promoDiscount > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography color="success.main">Promo Discount</Typography>
                                    <Typography fontWeight="bold" color="success.main">- ${discountAmount.toFixed(2)}</Typography>
                                </Box>
                            )}
                            {useLoyalty && loyaltyDiscount > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography color="warning.main">Loyalty Discount</Typography>
                                    <Typography fontWeight="bold" color="warning.main">- ${loyaltyDiscount.toFixed(2)}</Typography>
                                </Box>
                            )}
                            {useWallet && walletDiscount > 0 && (
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                    <Typography color="primary.main">Wallet</Typography>
                                    <Typography fontWeight="bold" color="primary.main">- ${walletDiscount.toFixed(2)}</Typography>
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography color="text.secondary">Delivery Fee</Typography>
                                <Typography fontWeight="bold">${deliveryFee.toFixed(2)}</Typography>
                            </Box>

                            <Divider sx={{ my: 2 }} />

                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold">Total</Typography>
                                <Typography variant="h6" fontWeight="bold" color="primary">
                                    ${totalAmount.toFixed(2)}
                                </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Promo code"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <LocalOffer color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Button
                                    variant="outlined"
                                    onClick={handleApplyPromo}
                                    disabled={isApplyingPromo}
                                    sx={{ whiteSpace: 'nowrap' }}
                                >
                                    {isApplyingPromo ? 'Applying…' : 'Apply'}
                                </Button>
                            </Box>

                            {promoMessage && (
                                <Alert severity={promoDiscount > 0 ? 'success' : 'warning'} sx={{ mb: 2 }}>
                                    {promoMessage}
                                </Alert>
                            )}

                            {error && (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            {paymentMethod === 'cash' && (
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    onClick={handlePlaceOrder}
                                    disabled={loading}
                                    sx={{ py: 1.5, fontSize: '1.1rem' }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Place Order (Cash)'}
                                </Button>
                            )}

                            {paymentMethod === 'card' && !clientSecret && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                                    <CircularProgress size={24} />
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default Checkout;