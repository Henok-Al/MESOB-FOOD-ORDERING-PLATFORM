import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Product } from '@food-ordering/types';
import { Plus, Edit, Trash2, ArrowLeft } from 'lucide-react';
import Modal from '../components/Modal';
import MenuForm from '../components/MenuForm';
import api from '../services/api';

const RestaurantMenu = () => {
    const { id: restaurantId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | undefined>(undefined);

    const { data: products, isLoading, error } = useQuery({
        queryKey: ['products', restaurantId],
        queryFn: async () => {
            const response = await api.get(`/restaurants/${restaurantId}/products/admin/all`);
            return response.data.data.products as Product[];
        },
        enabled: !!restaurantId,
    });

    const { data: categories } = useQuery({
        queryKey: ['categories', restaurantId],
        queryFn: async () => {
            const response = await api.get(`/restaurants/${restaurantId}/categories`);
            return (response.data.data.categories as { name: string }[]).map(c => c.name);
        },
        enabled: !!restaurantId,
    });

    const createMutation = useMutation({
        mutationFn: async (newProduct: Partial<Product>) => {
            await api.post(`/restaurants/${restaurantId}/products`, {
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
            await api.patch(`/restaurants/${restaurantId}/products/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', restaurantId] });
            setIsModalOpen(false);
            setSelectedProduct(undefined);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/restaurants/${restaurantId}/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', restaurantId] });
        },
    });

    const bulkUpdateMutation = useMutation({
        mutationFn: async (payload: any) => {
            await api.patch(`/restaurants/${restaurantId}/products/bulk`, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', restaurantId] });
            setIsBulkOpen(false);
        },
    });

    const [isBulkOpen, setIsBulkOpen] = useState(false);
    const [bulkData, setBulkData] = useState<{ category?: string; pricePercent?: number; priceSet?: number; isAvailable?: boolean; isVeg?: boolean; isFeatured?: boolean }>({});
    const [newCategory, setNewCategory] = useState('');
    const createCategoryMutation = useMutation({
        mutationFn: async (name: string) => {
            await api.post(`/restaurants/${restaurantId}/categories`, { name });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories', restaurantId] });
            setNewCategory('');
        },
    });
    const deleteCategoryMutation = useMutation({
        mutationFn: async (name: string) => {
            // Find category by name then delete; simple helper endpoint not available, so we refetch categories list and cannot delete by name directly.
            // For simplicity, backend expects id for deletion; provide a minimal fetch+delete flow inside mutation if needed.
            const res = await api.get(`/restaurants/${restaurantId}/categories`);
            const found = (res.data.data.categories as any[]).find((c) => c.name === name);
            if (found?._id) {
                await api.delete(`/restaurants/${restaurantId}/categories/${found._id}`);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories', restaurantId] });
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
                    <button
                        onClick={() => setIsBulkOpen(true)}
                        className="ml-2 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                    >
                        Bulk Update
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
                                <div className="flex gap-2 items-center">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {product.isAvailable ? 'Available' : 'Out of stock'}
                                    </span>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.isVeg ? 'bg-emerald-100 text-emerald-800' : 'bg-orange-100 text-orange-800'}`}>
                                        {product.isVeg ? 'Veg' : 'Non-veg'}
                                    </span>
                                    {product.isFeatured && (
                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Featured</span>
                                    )}
                                </div>
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

            <div className="mt-8 bg-white shadow rounded-lg p-5">
                <h2 className="text-lg font-medium mb-4">Manage Categories</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                    {(categories || []).map((c) => (
                        <span key={c} className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                            {c}
                            <button
                                onClick={() => deleteCategoryMutation.mutate(c)}
                                className="text-gray-600 hover:text-gray-800"
                                title="Delete category"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Add new category"
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                    />
                    <button
                        onClick={() => newCategory.trim() && createCategoryMutation.mutate(newCategory.trim())}
                        className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 text-sm font-medium"
                    >
                        Add
                    </button>
                </div>
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
                    categories={categories}
                />
            </Modal>

            <Modal
                isOpen={isBulkOpen}
                onClose={() => setIsBulkOpen(false)}
                title={'Bulk Update'}
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category filter</label>
                        <select
                            value={bulkData.category || ''}
                            onChange={(e) => setBulkData(prev => ({ ...prev, category: e.target.value || undefined }))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                        >
                            <option value="">All categories</option>
                            {(categories || []).map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Set price to</label>
                            <input type="number" min="0" step="0.01" value={bulkData.priceSet ?? ''} onChange={(e) => setBulkData(prev => ({ ...prev, priceSet: e.target.value ? parseFloat(e.target.value) : undefined }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Adjust price (%)</label>
                            <input type="number" step="0.01" value={bulkData.pricePercent ?? ''} onChange={(e) => setBulkData(prev => ({ ...prev, pricePercent: e.target.value ? parseFloat(e.target.value) : undefined }))} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2" />
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center">
                            <input type="checkbox" checked={bulkData.isAvailable ?? false} onChange={(e) => setBulkData(prev => ({ ...prev, isAvailable: e.target.checked }))} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <label className="ml-2 block text-sm text-gray-900">Set Available</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" checked={bulkData.isVeg ?? false} onChange={(e) => setBulkData(prev => ({ ...prev, isVeg: e.target.checked }))} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <label className="ml-2 block text-sm text-gray-900">Set Veg</label>
                        </div>
                        <div className="flex items-center">
                            <input type="checkbox" checked={bulkData.isFeatured ?? false} onChange={(e) => setBulkData(prev => ({ ...prev, isFeatured: e.target.checked }))} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                            <label className="ml-2 block text-sm text-gray-900">Set Featured</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button onClick={() => setIsBulkOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
                        <button onClick={() => bulkUpdateMutation.mutate(bulkData)} className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800">Apply</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default RestaurantMenu;
