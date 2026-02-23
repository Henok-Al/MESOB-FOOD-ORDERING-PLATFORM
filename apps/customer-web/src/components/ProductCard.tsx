import { useState } from 'react';
import { Card, CardContent, Box, Typography, IconButton } from '@mui/material';
import { Add, LocalFireDepartment } from '@mui/icons-material';
import { FRANK_COLORS } from '@food-ordering/constants';

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  isHit?: boolean;
  isHot?: boolean;
}

export default function ProductCard({ 
  name, 
  description, 
  price, 
  image,
  isHit = false,
  isHot = false 
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        background: FRANK_COLORS.bgCard,
        borderRadius: 3,
        border: `1px solid ${FRANK_COLORS.border}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 20px 40px rgba(0,0,0,0.5)' : 'none',
      }}
    >
      <Box sx={{ position: 'relative', height: 200 }}>
        {/* Product Image Placeholder */}
        <Box
          sx={{
            width: '100%',
            height: '100%',
            background: `linear-gradient(135deg, ${FRANK_COLORS.bgElevated} 0%, ${FRANK_COLORS.bgSecondary} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {image ? (
            <img 
              src={image} 
              alt={name}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }} 
            />
          ) : (
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: FRANK_COLORS.bgElevated,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ color: FRANK_COLORS.textMuted, fontSize: '2rem' }}>🍖</Typography>
            </Box>
          )}
        </Box>

        {/* Badges */}
        {isHit && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: '#fbbf24',
              color: '#000',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
            }}
          >
            HIT
          </Box>
        )}
        
        {isHot && (
          <Box
            sx={{
              position: 'absolute',
              top: 12,
              left: isHit ? 70 : 12,
              background: FRANK_COLORS.error,
              color: '#fff',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            <LocalFireDepartment sx={{ fontSize: 14 }} />
            HOT
          </Box>
        )}

        {/* Add Button */}
        <IconButton
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            width: 44,
            height: 44,
            background: FRANK_COLORS.bgElevated,
            color: '#fff',
            '&:hover': {
              background: FRANK_COLORS.orange,
            },
          }}
        >
          <Add />
        </IconButton>
      </Box>

      <CardContent sx={{ p: 2 }}>
        {/* Price */}
        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            fontWeight: 700,
            fontSize: '1.5rem',
            mb: 1,
          }}
        >
          {price.toLocaleString()} ₽
        </Typography>

        {/* Product Name */}
        <Typography
          sx={{
            color: FRANK_COLORS.textPrimary,
            fontSize: '0.9375rem',
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
}
