import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService, type Review } from '../services/reviewService';
import { Star, Trash2, MessageSquare, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

const Reviews = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRating, setFilterRating] = useState<number | undefined>();
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [responseText, setResponseText] = useState('');
    const queryClient = useQueryClient();

    const { data: reviews, isLoading } = useQuery({
        queryKey: ['admin-reviews', filterRating],
        queryFn: () =>
            reviewService.getAllReviews(
                filterRating ? { minRating: filterRating, maxRating: filterRating } : undefined
            ),
    });

    const deleteMutation = useMutation({
        mutationFn: reviewService.deleteReview,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
        },
    });

    const respondMutation = useMutation({
        mutationFn: ({ reviewId, response }: { reviewId: string; response: string }) =>
            reviewService.respondToReview(reviewId, response),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
            setSelectedReview(null);
            setResponseText('');
        },
    });

    const handleDelete = (reviewId: string) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            deleteMutation.mutate(reviewId);
        }
    };

    const handleRespond = (review: Review) => {
        setSelectedReview(review);
        setResponseText(review.response?.text || '');
    };

    const submitResponse = () => {
        if (selectedReview && responseText.trim()) {
            const reviewId = selectedReview._id || selectedReview.id;
            if (reviewId) {
                respondMutation.mutate({ reviewId, response: responseText });
            }
        }
    };

    const filteredReviews = reviews?.filter(
        (review) =>
            review.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.comment.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`h-4 w-4 ${
                            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    if (isLoading) return <div className="p-6">Loading reviews...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Review Management</h1>
            </div>

            {/* Filters */}
            <div className="mb-6 flex gap-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Search reviews..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <select
                        value={filterRating || ''}
                        onChange={(e) =>
                            setFilterRating(e.target.value ? Number(e.target.value) : undefined)
                        }
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    >
                        <option value="">All Ratings</option>
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                    </select>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {filteredReviews?.map((review) => (
                    <div
                        key={review._id || review.id}
                        className="bg-white shadow rounded-lg p-6"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {review.customer.firstName} {review.customer.lastName}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {review.restaurant.name}
                                        </p>
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {format(new Date(review.createdAt), 'MMM dd, yyyy')}
                                    </span>
                                </div>

                                <div className="flex gap-4 mb-3">
                                    <div>
                                        <span className="text-xs text-gray-500">Overall</span>
                                        {renderStars(review.rating.overall)}
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Food</span>
                                        {renderStars(review.rating.food)}
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Service</span>
                                        {renderStars(review.rating.service)}
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500">Delivery</span>
                                        {renderStars(review.rating.delivery)}
                                    </div>
                                </div>

                                <p className="text-gray-700 mb-3">{review.comment}</p>

                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-2 mb-3">
                                        {review.images.map((img, idx) => (
                                            <img
                                                key={idx}
                                                src={img}
                                                alt={`Review ${idx + 1}`}
                                                className="w-20 h-20 object-cover rounded"
                                            />
                                        ))}
                                    </div>
                                )}

                                {review.response && (
                                    <div className="mt-3 p-3 bg-blue-50 rounded-md">
                                        <p className="text-sm font-medium text-blue-900 mb-1">
                                            Restaurant Response
                                        </p>
                                        <p className="text-sm text-gray-700">{review.response.text}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {format(new Date(review.response.respondedAt), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-2 ml-4">
                                <button
                                    onClick={() => handleRespond(review)}
                                    className="text-blue-600 hover:text-blue-900 p-2"
                                    title="Respond"
                                >
                                    <MessageSquare className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={() => {
                                        const reviewId = review._id || review.id;
                                        if (reviewId) handleDelete(reviewId);
                                    }}
                                    className="text-red-600 hover:text-red-900 p-2"
                                    title="Delete"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Response Modal */}
            {selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h3 className="text-lg font-semibold mb-4">Respond to Review</h3>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500 mb-2">
                                Review by {selectedReview.customer.firstName}{' '}
                                {selectedReview.customer.lastName}
                            </p>
                            <p className="text-gray-700 italic">&quot;{selectedReview.comment}&quot;</p>
                        </div>
                        <textarea
                            value={responseText}
                            onChange={(e) => setResponseText(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows={4}
                            placeholder="Type your response..."
                        />
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => {
                                    setSelectedReview(null);
                                    setResponseText('');
                                }}
                                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitResponse}
                                disabled={!responseText.trim() || respondMutation.isPending}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {respondMutation.isPending ? 'Submitting...' : 'Submit Response'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reviews;
