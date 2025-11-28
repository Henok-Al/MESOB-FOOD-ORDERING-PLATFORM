import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Typography,
    Container,
    Grid,
    Button,
    Paper,
    Divider,
    Skeleton,
    Chip,
    TextField,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    SelectChangeEvent,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, AccessTime, DeliveryDining, Search, Close, Add, Remove } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import ProductCard from '../components/common/ProductCard';
import { RootState } from '../store';
import { clearCart, addToCart } from '../store/slices/cartSlice';
import { Restaurant, Product } from '@food-ordering/types';

const RestaurantDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    // Search and filter state
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [sortBy, setSortBy] = useState<string>('name');

    // Product modal state
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);

    const cart = useSelector((state: RootState) => state.cart);

    // Get unique categories
    const categories = useMemo(() => {
        const cats = ['All', ...new Set(products.map(p => p.category))];
        return cats;
    }, [products]);

    // Filter and sort products
    const filteredProducts = useMemo(() => {
        let filtered = products;

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.description?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategory !== 'All') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Sort
        filtered = [...filtered].sort((a, b) => {
            if (sortBy === 'price-low') return a.price - b.price;
            if (sortBy === 'price-high') return b.price - a.price;
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            return 0;
        });

        return filtered;
    }, [products, searchQuery, selectedCategory, sortBy]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch products for this restaurant
                const productsResponse = await api.get(`/restaurants/${id}/products`);
                setProducts(productsResponse.data.data.products);

                // Fetch restaurant details
                const restResponse = await api.get('/restaurants');
                const found = restResponse.data.data.restaurants.find((r: any) => r._id === id || r.id === id);
                if (found) setRestaurant(found);

            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleProductClick = (product: Product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedProduct(null);
        setQuantity(1);
    };

    const handleAddToCart = () => {
        if (selectedProduct) {
            dispatch(addToCart({
                product: selectedProduct,
                quantity,
                restaurantId: id || '',
            }));
            handleCloseModal();
        }
    };

    if (loading) {
        return (
            <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6FA' }}>
                <Skeleton variant="rectangular" height={300} animation="wave" />
                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <Skeleton variant="text" width={200} height={40} sx={{ mb: 2 }} />
                            <Skeleton variant="rectangular" height={60} sx={{ mb: 4 }} />
                            <Grid container spacing={3}>
                                {[1, 2, 3, 4].map((i) => (
                                    <Grid item xs={12} key={i}>
                                        <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        );
    }

    if (!restaurant) {
        return (
            <Container sx={{ py: 4 }}>
                <Typography variant="h5">Restaurant not found</Typography>
                <Button onClick={() => navigate('/')}>Back to Home</Button>
            </Container>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F5F6FA', pb: 8 }}>
            {/* Hero Section */}
            <Box
                sx={{
                    height: 300,
                    backgroundImage: `url(${restaurant.imageUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.7))',
                    },
                }}
            >
                <Container maxWidth="lg" sx={{ height: '100%', position: 'relative', display: 'flex', alignItems: 'flex-end', pb: 4 }}>
                    <Box sx={{ color: 'white' }}>
                        <Typography variant="h2" fontWeight="bold" gutterBottom>
                            {restaurant.name}
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                            {restaurant.description}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                            <Chip
                                icon={<Star sx={{ color: '#FFD700 !important' }} />}
                                label={restaurant.rating}
                                sx={{ bgcolor: 'white', fontWeight: 'bold' }}
                            />
                            <Chip
                                icon={<AccessTime sx={{ color: 'white' }} />}
                                label={restaurant.deliveryTime}
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)' }}
                            />
                            <Chip
                                icon={<DeliveryDining sx={{ color: 'white' }} />}
                                label={`Min Order $${restaurant.minOrder}`}
                                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', backdropFilter: 'blur(4px)' }}
                            />
                        </Box>
                    </Box>
                </Container>
            </Box>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Grid container spacing={4}>
                    {/* Menu Section */}
                    <Grid item xs={12} md={8}>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" fontWeight="bold" gutterBottom>
                                Menu
                            </Typography>

                            {/* Search and   Filters */}
                            <Box sx={{ mt: 3, mb: 3 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <TextField
                                            fullWidth
                                            placeholder="Search menu items..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <Search />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6} md={3}>
                                        <FormControl fullWidth>
                                            <InputLabel>Sort By</InputLabel>
                                            <Select
                                                value={sortBy}
                                                label="Sort By"
                                                onChange={(e: SelectChangeEvent) => setSortBy(e.target.value)}
                                            >
                                                <MenuItem value="name">Name</MenuItem>
                                                <MenuItem value="price-low">Price: Low to High</MenuItem>
                                                <MenuItem value="price-high">Price: High to Low</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                {/* Category Chips */}
                                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {categories.map((category) => (
                                        <Chip
                                            key={category}
                                            label={category}
                                            onClick={() => setSelectedCategory(category)}
                                            color={selectedCategory === category ? 'primary' : 'default'}
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Box>

                        {/* Products List */}
                        {filteredProducts.length === 0 ? (
                            <Paper sx={{ p: 6, textAlign: 'center' }}>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    No items found
                                </Typography>
                                <Typography color="text.disabled">
                                    Try adjusting your search or filters
                                </Typography>
                            </Paper>
                        ) : (
                            <Grid container spacing={3}>
                                {filteredProducts.map((product) => (
                                    <Grid item xs={12} key={product._id}>
                                        <Box onClick={() => handleProductClick(product)} sx={{ cursor: 'pointer' }}>
                                            <ProductCard product={product} restaurantId={restaurant._id || ''} />
                                        </Box>
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Grid>

                    {/* Cart Sidebar */}
                    <Grid item xs={12} md={4}>
                        <Paper sx={{ p: 3, position: 'sticky', top: 24, borderRadius: 3 }}>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                Your Order
                            </Typography>
                            <Divider sx={{ my: 2 }} />

                            {cart.items.length === 0 ? (
                                <Box sx={{ textAlign: 'center', py: 4 }}>
                                    <Typography color="text.secondary" gutterBottom>
                                        Your cart is empty
                                    </Typography>
                                    <Typography variant="body2" color="text.disabled">
                                        Add items from the menu to start your order
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    {cart.items.map((item) => (
                                        <Box key={item._id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Typography fontWeight="bold" color="primary">
                                                    {item.quantity}x
                                                </Typography>
                                                <Typography>
                                                    {item.name}
                                                </Typography>
                                            </Box>
                                            <Typography fontWeight="bold">
                                                ${(item.price * item.quantity).toFixed(2)}
                                            </Typography>
                                        </Box>
                                    ))}

                                    <Divider sx={{ my: 2 }} />

                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                                        <Typography variant="h6" fontWeight="bold">Total</Typography>
                                        <Typography variant="h6" fontWeight="bold" color="primary">
                                            ${cart.total.toFixed(2)}
                                        </Typography>
                                    </Box>

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        sx={{ mb: 2 }}
                                        onClick={() => navigate('/checkout')}
                                    >
                                        Checkout
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        size="small"
                                        color="error"
                                        onClick={() => dispatch(clearCart())}
                                    >
                                        Clear Cart
                                    </Button>
                                </>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Container>

            {/* Product Details Modal */}
            <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
                {selectedProduct && (
                    <>
                        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="h5" fontWeight="bold">
                                {selectedProduct.name}
                            </Typography>
                            <IconButton onClick={handleCloseModal}>
                                <Close />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent>
                            <Box>
                                <img
                                    src={selectedProduct.image}
                                    alt={selectedProduct.name}
                                    style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 8 }}
                                />
                                <Typography variant="h6" color="primary" sx={{ mt: 2, mb: 1 }}>
                                    ${selectedProduct.price.toFixed(2)}
                                </Typography>
                                <Typography color="text.secondary" sx={{ mb: 3 }}>
                                    {selectedProduct.description}
                                </Typography>
                                <Typography variant="body2" color="text.disabled" sx={{ mb: 2 }}>
                                    Category: {selectedProduct.category}
                                </Typography>

                                <Divider sx={{ my: 3 }} />

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Typography fontWeight="bold">Quantity:</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <IconButton
                                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                disabled={quantity <= 1}
                                            >
                                                <Remove />
                                            </IconButton>
                                            <Typography sx={{ minWidth: 30, textAlign: 'center', fontWeight: 'bold' }}>
                                                {quantity}
                                            </Typography>
                                            <IconButton onClick={() => setQuantity(quantity + 1)}>
                                                <Add />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={handleAddToCart}
                                    >
                                        Add to Cart - ${(selectedProduct.price * quantity).toFixed(2)}
                                    </Button>
                                </Box>
                            </Box>
                        </DialogContent>
                    </>
                )}
            </Dialog>
        </Box>
    );
};

export default RestaurantDetails;
