import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';
import type { Restaurant } from '@food-ordering/types';
import { Search, MapPin, Star, Plus, Edit, Trash2, Menu as MenuIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import RestaurantForm from '../components/RestaurantForm';

const Restaurants = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | undefined>(undefined);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: restaurants, isLoading, error } = useQuery({
        queryKey: ['restaurants'],
        queryFn: async () => {
            const response = await api.get('/restaurants/admin/all');
            return response.data.data.restaurants as Restaurant[];
        },
    });

    const createMutation = useMutation({
        mutationFn: async (newRestaurant: Partial<Restaurant>) => {
            await api.post('/restaurants', newRestaurant);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurants'] });
            setIsModalOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Restaurant> }) => {
            await api.patch(`/restaurants/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurants'] });
            setIsModalOpen(false);
            setSelectedRestaurant(undefined);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/restaurants/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['restaurants'] });
        },
    });

    const handleCreate = () => {
        setSelectedRestaurant(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (restaurant: Restaurant) => {
        setSelectedRestaurant(restaurant);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this restaurant?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSubmit = (data: Partial<Restaurant>) => {
        if (selectedRestaurant) {
            const id = selectedRestaurant._id || selectedRestaurant.id;
            if (id) {
                updateMutation.mutate({ id, data });
            }
        } else {
            createMutation.mutate(data);
        }
    };

    const filteredRestaurants = restaurants?.filter(restaurant => {
        const nameMatch = restaurant.name?.toLowerCase()?.includes(searchTerm.toLowerCase());
        const cuisineMatch = restaurant.cuisine?.toLowerCase()?.includes(searchTerm.toLowerCase());
        return nameMatch || cuisineMatch;
    });

    if (isLoading) return <div className="p-6">Loading restaurants...</div>;
    if (error) return <div className="p-6 text-red-600">Error loading restaurants</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Restaurant Management</h1>
                <button
                    onClick={handleCreate}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Add Restaurant
                </button>
            </div>

            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search restaurants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRestaurants?.map((restaurant) => (
                    <div key={restaurant._id || restaurant.id} className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
                        <div className="relative h-48">
                            <img
                                className="w-full h-full object-cover"
                                src={restaurant.imageUrl || 'https://via.placeholder.com/400x300'}
                                alt={restaurant.name}
                            />
                            <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md shadow-sm flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 mr-1" />
                                <span className="text-sm font-medium">{restaurant.rating}</span>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-lg font-medium text-gray-900">{restaurant.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{restaurant.cuisine}</p>
                            <div className="flex items-center text-sm text-gray-500 mb-4">
                                <MapPin className="h-4 w-4 mr-1" />
                                {restaurant.address}
                            </div>
                            <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${restaurant.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {restaurant.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => navigate(`/restaurants/${restaurant._id || restaurant.id}/menu`)}
                                        className="text-gray-600 hover:text-gray-900 p-1"
                                        title="Manage Menu"
                                    >
                                        <MenuIcon className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(restaurant)}
                                        className="text-blue-600 hover:text-blue-900 p-1"
                                        title="Edit"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const id = restaurant._id || restaurant.id;
                                            if (id) handleDelete(id);
                                        }}
                                        className="text-red-600 hover:text-red-900 p-1"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedRestaurant ? 'Edit Restaurant' : 'Add Restaurant'}
            >
                <RestaurantForm
                    initialData={selectedRestaurant}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                />
            </Modal>
        </div>
    );
};

export default Restaurants;
