import React, { useState } from 'react';
import {
    Box,
    Typography,
    Rating,
    TextField,
    Button,
    Grid,
    Paper,
} from '@mui/material';
import { Star } from '@mui/icons-material';

interface ReviewFormProps {
    orderId: string;
    restaurantName: string;
    onSubmit: (reviewData: ReviewData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export interface ReviewData {
    orderId: string;
    rating: number;
    foodRating?: number;
    serviceRating?: number;
    deliveryRating?: number;
    comment?: string;
    photos?: string[];
}

const ReviewForm: React.FC<ReviewFormProps> = ({
    orderId,
    restaurantName,
    onSubmit,
    onCancel,
    isLoading,
}) => {
    const [formData, setFormData] = useState<ReviewData>({
        orderId,
        rating: 0,
        foodRating: 0,
        serviceRating: 0,
        deliveryRating: 0,
        comment: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.rating === 0) {
            alert('Please provide an overall rating');
            return;
        }
        onSubmit(formData);
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Typography variant="h6" gutterBottom>
                Review {restaurantName}
            </Typography>

            <Paper sx={{ p: 3, mt: 2, bgcolor: '#F5F6FA' }}>
                {/* Overall Rating */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" fontWeight="bold" gutterBottom>
                        Overall Rating *
                    </Typography>
                    <Rating
                        value={formData.rating}
                        onChange={(_, value) => setFormData({ ...formData, rating: value || 0 })}
                        size="large"
                        icon={<Star fontSize="inherit" />}
                        emptyIcon={<Star fontSize="inherit" />}
                    />
                </Box>

                {/* Detailed Ratings */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body2" gutterBottom>
                            Food Quality
                        </Typography>
                        <Rating
                            value={formData.foodRating}
                            onChange={(_, value) => setFormData({ ...formData, foodRating: value || 0 })}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body2" gutterBottom>
                            Service
                        </Typography>
                        <Rating
                            value={formData.serviceRating}
                            onChange={(_, value) => setFormData({ ...formData, serviceRating: value || 0 })}
                            size="small"
                        />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Typography variant="body2" gutterBottom>
                            Delivery
                        </Typography>
                        <Rating
                            value={formData.deliveryRating}
                            onChange={(_, value) => setFormData({ ...formData, deliveryRating: value || 0 })}
                            size="small"
                        />
                    </Grid>
                </Grid>

                {/* Comment */}
                <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Share your experience (optional)"
                    value={formData.comment}
                    onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                    placeholder="What did you like or dislike about your order?"
                    sx={{ mb: 2 }}
                />

                <Typography variant="caption" color="text.secondary">
                    Your review will help others make better choices and help restaurants improve their service.
                </Typography>
            </Paper>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit Review'}
                </Button>
            </Box>
        </Box>
    );
};

export default ReviewForm;
