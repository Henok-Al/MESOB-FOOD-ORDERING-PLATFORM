import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Rating,
  Chip,
  IconButton,
  Button,
  Stack,
  Divider,
  Pagination,
} from '@mui/material';
import {
  ThumbUp,
  Flag,
  CheckCircle,
  Image as ImageIcon,
} from '@mui/icons-material';
import api from '../services/api';

interface Review {
  _id: string;
  user: {
    name: string;
    avatar?: string;
  };
  rating: number;
  title?: string;
  comment: string;
  photos?: string[];
  tags?: string[];
  helpfulCount: number;
  createdAt: string;
  adminResponse?: {
    message: string;
    respondedAt: string;
  };
}

interface ReviewsListProps {
  reviews: Review[];
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  onMarkHelpful?: (reviewId: string) => void;
  onReport?: (reviewId: string) => void;
  showReportButton?: boolean;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  reviews,
  totalPages,
  currentPage,
  onPageChange,
  onMarkHelpful,
  onReport,
  showReportButton = true,
}) => {
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());
  const [expandedPhotos, setExpandedPhotos] = useState<string | null>(null);

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await api.post(`/reviews/${reviewId}/helpful`);
      setHelpfulReviews((prev) => new Set(prev).add(reviewId));
      onMarkHelpful?.(reviewId);
    } catch (err) {
      console.error('Failed to mark helpful:', err);
    }
  };

  const handleReport = async (reviewId: string) => {
    if (!window.confirm('Report this review for inappropriate content?')) return;
    try {
      await api.post(`/reviews/${reviewId}/report`, { reason: 'inappropriate' });
      alert('Review reported. Thank you for helping keep our community safe.');
      onReport?.(reviewId);
    } catch (err) {
      console.error('Failed to report:', err);
    }
  };

  if (reviews.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          No reviews yet. Be the first to review!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {reviews.map((review, index) => (
        <Card key={review._id} sx={{ mb: 2, boxShadow: 'none', border: '1px solid #e0e0e0' }}>
          <CardContent>
            {/* User Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar src={review.user?.avatar} sx={{ mr: 2 }}>
                {review.user?.name?.[0]?.toUpperCase()}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {review.user?.name}
                  <CheckCircle
                    sx={{ ml: 0.5, fontSize: 14, color: 'success.main', verticalAlign: 'middle' }}
                  />
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Box>
            </Box>

            {/* Rating */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Rating value={review.rating} readOnly size="small" />
              <Typography variant="body2" sx={{ ml: 1 }}>
                {review.rating}.0
              </Typography>
            </Box>

            {/* Title */}
            {review.title && (
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                {review.title}
              </Typography>
            )}

            {/* Comment */}
            <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
              {review.comment}
            </Typography>

            {/* Tags */}
            {review.tags && review.tags.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
                {review.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
              </Stack>
            )}

            {/* Photos */}
            {review.photos && review.photos.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                {review.photos.map((photo, photoIndex) => (
                  <Box
                    key={photoIndex}
                    component="img"
                    src={photo}
                    alt={`Review photo ${photoIndex + 1}`}
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 1,
                      cursor: 'pointer',
                    }}
                    onClick={() => setExpandedPhotos(expandedPhotos === photo ? null : photo)}
                  />
                ))}
              </Stack>
            )}

            {/* Admin Response */}
            {review.adminResponse && (
              <Box
                sx={{
                  bgcolor: 'grey.50',
                  p: 2,
                  borderRadius: 1,
                  mb: 2,
                  borderLeft: 3,
                  borderColor: 'primary.main',
                }}
              >
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Response from Restaurant
                </Typography>
                <Typography variant="body2">{review.adminResponse.message}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(review.adminResponse.respondedAt).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                startIcon={<ThumbUp />}
                size="small"
                onClick={() => handleMarkHelpful(review._id)}
                disabled={helpfulReviews.has(review._id)}
                variant={helpfulReviews.has(review._id) ? 'contained' : 'text'}
              >
                Helpful ({review.helpfulCount + (helpfulReviews.has(review._id) ? 1 : 0)})
              </Button>
              {showReportButton && (
                <IconButton size="small" onClick={() => handleReport(review._id)} color="error">
                  <Flag fontSize="small" />
                </IconButton>
              )}
            </Box>
          </CardContent>
        </Card>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(_, page) => onPageChange(page)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default ReviewsList;
