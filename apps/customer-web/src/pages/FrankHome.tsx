import { Box, Typography, Button, Container } from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import { FRANK_COLORS } from '@food-ordering/constants';
import Header from '../components/layout/Header';
import CategoryTabs from '../components/CategoryTabs';
import ProductCard from '../components/ProductCard';

// Sample products matching FRANK menu
const products = [
  {
    id: '1',
    name: 'Pork ribs medium size',
    description: 'Pork ribs medium size, 352g',
    price: 790,
    isHit: true,
  },
  {
    id: '2',
    name: 'Pork ribs King EXTRA',
    description: 'Pork ribs King EXTRA size in hot dog style, 1090g',
    price: 1990,
    isHot: true,
  },
  {
    id: '3',
    name: 'King Size Extra Hot pork ribs',
    description: 'King Size Extra Hot pork ribs with nachos, 930g',
    price: 1790,
    isHot: true,
  },
  {
    id: '4',
    name: 'King Size pork ribs',
    description: 'King Size pork ribs with pepperoni and mozzarella, 950g',
    price: 1790,
    isHot: false,
  },
  {
    id: '5',
    name: 'BBQ pork ribs',
    description: 'BBQ pork ribs – signature, vacuum-packed, 570g',
    price: 890,
    isHit: true,
  },
  {
    id: '6',
    name: 'BASTA Size pork ribs',
    description: 'BASTA Size pork ribs with Camembert, figs, and lingonberry sauce, 880g',
    price: 1790,
    isHot: true,
  },
  {
    id: '7',
    name: 'Marbled beef ribs',
    description: 'Marbled beef ribs with stone potatoes and kimchi cucumbers, 793g',
    price: 2190,
  },
  {
    id: '8',
    name: 'BASTA Size Extra Hot',
    description: 'BASTA Size Extra Hot pork ribs with nachos, 920g',
    price: 1790,
    isHot: true,
  },
];

export default function FrankHome() {
  return (
    <Box sx={{ minHeight: '100vh', background: FRANK_COLORS.bgPrimary }}>
      <Header />
      
      {/* Address Banner */}
      <Box
        sx={{
          mt: 8,
          background: FRANK_COLORS.error,
          py: 1.5,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <LocationOn sx={{ color: '#fff', fontSize: 20 }} />
        <Typography sx={{ color: '#fff', fontWeight: 600, fontSize: '0.9375rem' }}>
          Bolshoy Prospekt PS, 35
        </Typography>
      </Box>

      <CategoryTabs />

      {/* Products Grid */}
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: 4,
          px: { xs: 2, md: 4 },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
          }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </Box>
      </Container>
    </Box>
  );
}
