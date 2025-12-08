import React from 'react';
import { Box, Card, CardContent, Typography, Avatar, Rating, Chip, IconButton, Divider } from '@mui/material';
import { ThumbUpOutlined, ThumbUp } from '@mui/icons-material';
import type { Review } from '@food-ordering/types';

interface ReviewCardProps {
    review: Review;
    onMarkHelpful?: (reviewId: string) => void;
    userHasMarkedHelpful?: boolean;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onMarkHelpful, userHasMarkedHelpful = false }) => {
    const formatDate = (dateString: Date) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return date.toLocaleDateString();
    };

    const user = typeof review.user === 'object' ? review.user : null;
    const userName = user ? `${user.firstName} ${user.lastName}` : 'Anonymous';
    const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}` : 'A';

    return (
        <Card sx={{ mb: 2, boxShadow: 1 }}>
            <CardContent>
                {/* User Info and Rating */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {userInitials}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {userName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {formatDate(review.createdAt)}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <Rating value={review.rating} readOnly size="small" precision={0.5} />
                            {review.isVerified && (
                                <Chip label="Verified" size="small" color="success" sx={{ height: 20 }} />
                            )}
                        </Box>
                    </Box>
                </Box>

                {/* Detailed Ratings */}
                {(review.foodRating || review.serviceRating || review.deliveryRating) && (
                    <Box sx={{ display: 'flex', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                        {review.foodRating && (
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Food
                                </Typography>
                                <Rating value={review.foodRating} readOnly size="small" />
                            </Box>
                        )}
                        {review.serviceRating && (
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Service
                                </Typography>
                                <Rating value={review.serviceRating} readOnly size="small" />
                            </Box>
                        )}
                        {review.deliveryRating && (
                            <Box>
                                <Typography variant="caption" color="text.secondary">
                                    Delivery
                                </Typography>
                                <Rating value={review.deliveryRating} readOnly size="small" />
                            </Box>
                        )}
                    </Box>
                )}

                {/* Review Comment */}
                {review.comment && (
                    <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
                        {review.comment}
                    </Typography>
                )}

                {/* Review Photos */}
                {review.photos && review.photos.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, overflowX: 'auto' }}>
                        {review.photos.map((photo, index) => (
                            <Box
                                key={index}
                                component="img"
                                src={photo}
                                alt={`Review photo ${index + 1}`}
                                sx={{
                                    width: 100,
                                    height: 100,
                                    objectFit: 'cover',
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    '&:hover': { opacity: 0.8 },
                                }}
                            />
                        ))}
                    </Box>
                )}

                {/* Helpful Button */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton
                        size="small"
                        onClick={() => onMarkHelpful?.(review._id || review.id || '')}
                        disabled={userHasMarkedHelpful}
                        color={userHasMarkedHelpful ? 'primary' : 'default'}
                    >
                        {userHasMarkedHelpful ? <ThumbUp fontSize="small" /> : <ThumbUpOutlined fontSize="small" />}
                    </IconButton>
                    <Typography variant="caption" color="text.secondary">
                        {review.helpfulCount > 0 && `${review.helpfulCount} people found this helpful`}
                    </Typography>
                </Box>

                {/* Restaurant Response */}
                {review.restaurantResponse && (
                    <>
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1 }}>
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                Response from Restaurant
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {review.restaurantResponse.comment}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                {formatDate(review.restaurantResponse.respondedAt)}
                            </Typography>
                        </Box>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default ReviewCard;
