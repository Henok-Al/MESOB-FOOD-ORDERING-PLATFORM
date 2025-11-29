import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import type { Product } from '@food-ordering/types';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Modal from '../components/Modal';
import MenuForm from '../components/MenuForm';

const RestaurantMenu = () => {
    const { id: restaurantId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

    const { data: products, isLoading, error } = useQuery({
        queryKey: ['products', restaurantId],
        queryFn: async () => {
            const response = await axios.get(`/api/restaurants/${restaurantId}/products/admin/all`);
            return response.data.data.products as Product[];
        },
        enabled: !!restaurantId,
    });

    const createMutation = useMutation({
        mutationFn: async (newProduct: Partial<Product>) => {
            await axios.post(`/api/restaurants/${restaurantId}/products`, {
                ...newProduct,
                restaurant: restaurantId,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', restaurantId] });
            setIsModalOpen(false);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<Product> }) => {
            await axios.patch(`/api/restaurants/${restaurantId}/products/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', restaurantId] });
            setIsModalOpen(false);
            setSelectedProduct(undefined);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`/api/restaurants/${restaurantId}/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', restaurantId] });
        },
    });

    const handleCreate = () => {
        setSelectedProduct(undefined);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            deleteMutation.mutate(id);
        }
    };

    const handleSubmit = (data: Partial<Product>) => {
        if (selectedProduct) {
            const id = selectedProduct._id || selectedProduct.id;
            if (id) {
                updateMutation.mutate({ id, data });
            }
        } else {
            createMutation.mutate(data);
        }
    };

    if (isLoading) return <div className="p-6">Loading menu...</div>;
    if (error) return <div className="p-6 text-red-600">Error loading menu</div>;

    return (
        <div>
            <div className="flex items-center mb-6">
                <button
                    onClick={() => navigate('/restaurants')}
                    className="mr-4 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">Menu Management</h1>
                <div className="ml-auto">
                    <button
                        onClick={handleCreate}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Add Item
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products?.map((product) => (
                    <div key={product._id || product.id} className="bg-white overflow-hidden shadow rounded-lg flex flex-col">
                        <div className="relative h-48">
                            <img
                                className="w-full h-full object-cover"
                                src={product.image || 'https://via.placeholder.com/400x300'}
                                alt={product.name}
                            />
                            <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md shadow-sm">
                                <span className="text-sm font-bold text-gray-900">${product.price}</span>
                            </div>
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                            <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                            <p className="text-sm text-gray-600 mb-4 flex-1">{product.description}</p>

                            <div className="mt-auto flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {product.isAvailable ? 'Available' : 'Unavailable'}
                                </span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(product)}
                                        className="text-blue-600 hover:text-blue-900 p-1"
                                        title="Edit"
                                    >
                                        <Edit className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            const id = product._id || product.id;
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
                title={selectedProduct ? 'Edit Item' : 'Add Item'}
            >
                <MenuForm
                    initialData={selectedProduct}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={createMutation.isPending || updateMutation.isPending}
                />
            </Modal>
        </div>
    );
};

export default RestaurantMenu;
