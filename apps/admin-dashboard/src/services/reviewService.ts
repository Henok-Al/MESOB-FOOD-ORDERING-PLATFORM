import api from './api';

export interface Review {
    _id?: string;
    id?: string;
    customer: {
        _id: string;
        firstName: string;
        lastName: string;
    };
    restaurant: {
        _id: string;
        name: string;
    };
    order?: string;
    rating: {
        overall: number;
        food: number;
        service: number;
        delivery: number;
    };
    comment: string;
    images?: string[];
    response?: {
        text: string;
        respondedBy: string;
        respondedAt: Date;
    };
    helpful: number;
    helpfulBy: string[];
    createdAt: Date;
}

export interface GetReviewsResponse {
    status: string;
    data: {
        reviews: Review[];
    };
}

export interface GetReviewResponse {
    status: string;
    data: {
        review: Review;
    };
}

export const reviewService = {
    // Get all reviews (admin)
    getAllReviews: async (filters?: {
        restaurantId?: string;
        customerId?: string;
        minRating?: number;
        maxRating?: number;
    }): Promise<Review[]> => {
        const params = new URLSearchParams();
        if (filters?.restaurantId) params.append('restaurantId', filters.restaurantId);
        if (filters?.customerId) params.append('customerId', filters.customerId);
        if (filters?.minRating) params.append('minRating', filters.minRating.toString());
        if (filters?.maxRating) params.append('maxRating', filters.maxRating.toString());

        const response = await api.get<GetReviewsResponse>(
            `/reviews/admin/all?${params.toString()}`
        );
        return response.data.data.reviews;
    },

    // Get restaurant reviews
    getRestaurantReviews: async (restaurantId: string): Promise<Review[]> => {
        const response = await api.get<GetReviewsResponse>(
            `/reviews/restaurant/${restaurantId}`
        );
        return response.data.data.reviews;
    },

    // Get my reviews (customer)
    getMyReviews: async (): Promise<Review[]> => {
        const response = await api.get<GetReviewsResponse>('/reviews/my-reviews');
        return response.data.data.reviews;
    },

    // Create review
    createReview: async (reviewData: {
        restaurant: string;
        order?: string;
        rating: {
            overall: number;
            food: number;
            service: number;
            delivery: number;
        };
        comment: string;
        images?: string[];
    }): Promise<Review> => {
        const response = await api.post<GetReviewResponse>('/reviews', reviewData);
        return response.data.data.review;
    },

    // Update review
    updateReview: async (reviewId: string, data: Partial<Review>): Promise<Review> => {
        const response = await api.patch<GetReviewResponse>(`/reviews/${reviewId}`, data);
        return response.data.data.review;
    },

    // Delete review
    deleteReview: async (reviewId: string): Promise<void> => {
        await api.delete(`/reviews/${reviewId}`);
    },

    // Respond to review (restaurant owner/admin)
    respondToReview: async (reviewId: string, responseText: string): Promise<Review> => {
        const response = await api.post<GetReviewResponse>(`/reviews/${reviewId}/respond`, {
            response: responseText,
        });
        return response.data.data.review;
    },

    // Mark review as helpful
    markHelpful: async (reviewId: string): Promise<Review> => {
        const response = await api.post<GetReviewResponse>(`/reviews/${reviewId}/helpful`);
        return response.data.data.review;
    },
};
