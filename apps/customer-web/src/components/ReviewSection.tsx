import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  Button,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { RateReview } from '@mui/icons-material';
import ReviewsList from './ReviewsList';
import ReviewForm from './ReviewForm';
import api from '../services/api';

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  rating5: number;
  rating4: number;
  rating3: number;
  rating2: number;
  rating1: number;
}

interface ReviewSectionProps {
  restaurantId: string;
  canWriteReview?: boolean;
  orderId?: string;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({
  restaurantId,
  canWriteReview = false,
  orderId,
}) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [restaurantId, page, sortBy]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/reviews/restaurant/${restaurantId}?page=${page}&limit=5&sortBy=${sortBy}`
      );
      setReviews(response.data.data.reviews);
      setStats(response.data.data.stats);
      setTotalPages(response.data.pages);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    fetchReviews();
  };

  const getRatingPercentage = (count: number) => {
    if (!stats || stats.totalReviews === 0) return 0;
    return (count / stats.totalReviews) * 100;
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Customer Reviews
      </Typography>

      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Rating Summary */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h2" fontWeight="bold" color="primary">
                {stats.averageRating.toFixed(1)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                out of 5
              </Typography>
              <Typography variant="h6" sx={{ mt: 1 }}>
                {stats.totalReviews} reviews
              </Typography>
            </Paper>
          </Grid>

          {/* Rating Breakdown */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              {[5, 4, 3, 2, 1].map((rating) => (
                <Box key={rating} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 30 }}>
                    {rating} ★
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getRatingPercentage(
                      rating === 5
                        ? stats.rating5
                        : rating === 4
                        ? stats.rating4
                        : rating === 3
                        ? stats.rating3
                        : rating === 2
                        ? stats.rating2
                        : stats.rating1
                    )}
                    sx={{ flex: 1, mx: 2, height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 40 }}>
                    {rating === 5
                      ? stats.rating5
                      : rating === 4
                      ? stats.rating4
                      : rating === 3
                      ? stats.rating3
                      : rating === 2
                      ? stats.rating2
                      : stats.rating1}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Write Review Button */}
      {canWriteReview && orderId && (
        <Box sx={{ mb: 3 }}>
          <Button
            variant="contained"
            startIcon={<RateReview />}
            onClick={() => setShowReviewForm(true)}
          >
            Write a Review
          </Button>
        </Box>
      )}

      {/* Sort and Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="All Reviews" />
          <Tab label="With Photos" />
          <Tab label="5 Star" />
        </Tabs>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} displayEmpty>
            <MenuItem value="newest">Newest First</MenuItem>
            <MenuItem value="oldest">Oldest First</MenuItem>
            <MenuItem value="highest">Highest Rated</MenuItem>
            <MenuItem value="lowest">Lowest Rated</MenuItem>
            <MenuItem value="mostHelpful">Most Helpful</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Reviews List */}
      {loading ? (
        <Typography>Loading reviews...</Typography>
      ) : (
        <ReviewsList
          reviews={reviews}
          totalPages={totalPages}
          currentPage={page}
          onPageChange={setPage}
        />
      )}

      {/* Review Form Dialog */}
      {orderId && (
        <ReviewForm
          orderId={orderId}
          restaurantId={restaurantId}
          open={showReviewForm}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={() => setShowReviewForm(false)}
        />
      )}
    </Box>
  );
};

export default ReviewSection;
