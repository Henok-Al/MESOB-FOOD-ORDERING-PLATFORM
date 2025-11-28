import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import { toast, Toaster } from 'sonner';
import api from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { productFormSchema, type ProductFormData } from '../validators/productSchemas';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    isAvailable: boolean;
}

const MenuPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

    const {
        register,
        handleSubmit: handleFormSubmit,
        formState: { errors },
        reset,
        setValue,
        watch,
    } = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: '',
            description: '',
            price: '',
            category: '',
            image: '',
            isAvailable: true,
        },
    });

    const isAvailable = watch('isAvailable');
    const category = watch('category');

    // Fetch Products
    const fetchProducts = async () => {
        try {
            const restResponse = await api.get('/restaurants');
            if (restResponse.data.data.restaurants.length > 0) {
                const restaurantId = restResponse.data.data.restaurants[0]._id;
                const prodResponse = await api.get(`/restaurants/${restaurantId}/products`);
                setProducts(prodResponse.data.data.products);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleOpen = (product?: Product) => {
        if (product) {
            setEditMode(true);
            setSelectedProduct(product._id);
            reset({
                name: product.name,
                description: product.description || '',
                price: product.price.toString(),
                category: product.category,
                image: product.image,
                isAvailable: product.isAvailable,
            });
        } else {
            setEditMode(false);
            setSelectedProduct(null);
            reset({
                name: '',
                description: '',
                price: '',
                category: '',
                image: '',
                isAvailable: true,
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        reset();
    };

    const onSubmit = async (data: ProductFormData) => {
        setSubmitting(true);
        try {
            const restResponse = await api.get('/restaurants');
            const restaurantId = restResponse.data.data.restaurants[0]._id;

            const payload = {
                ...data,
                price: parseFloat(data.price),
                restaurant: restaurantId,
            };

            if (editMode && selectedProduct) {
                await api.put(`/restaurants/${restaurantId}/products/${selectedProduct}`, payload);
                toast.success('Product updated successfully!');
            } else {
                await api.post(`/restaurants/${restaurantId}/products`, payload);
                toast.success('Product created successfully!');
            }

            fetchProducts();
            handleClose();
        } catch (error: any) {
            console.error('Failed to save product:', error);
            toast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (productId: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const restResponse = await api.get('/restaurants');
            const restaurantId = restResponse.data.data.restaurants[0]._id;

            await api.delete(`/restaurants/${restaurantId}/products/${productId}`);
            toast.success('Product deleted successfully!');
            fetchProducts();
        } catch (error: any) {
            console.error('Failed to delete product:', error);
            toast.error(error.response?.data?.message || 'Failed to delete product');
        }
    };

    return (
        <>
            <Toaster position="top-right" richColors />
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-3xl font-bold tracking-tight">Menu Management</h2>
                    <Button onClick={() => handleOpen()}>
                        <Plus className="mr-2 h-4 w-4" /> Add Item
                    </Button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Menu Items</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {products.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-muted-foreground mb-4">No menu items yet</p>
                                    <Button onClick={() => handleOpen()} variant="outline">
                                        <Plus className="mr-2 h-4 w-4" /> Add Your First Item
                                    </Button>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Image</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Price</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {products.map((product) => (
                                            <TableRow key={product._id}>
                                                <TableCell>
                                                    <img
                                                        src={product.image}
                                                        alt={product.name}
                                                        className="w-12 h-12 rounded-md object-cover"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div className="font-medium">{product.name}</div>
                                                    <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                                        {product.description}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{product.category}</TableCell>
                                                <TableCell>${product.price.toFixed(2)}</TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.isAvailable
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                            }`}
                                                    >
                                                        {product.isAvailable ? 'Available' : 'Unavailable'}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpen(product)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(product._id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                )}

                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editMode ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleFormSubmit(onSubmit)}>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">Product Name *</Label>
                                    <Input
                                        id="name"
                                        {...register('name')}
                                        placeholder="e.g., Cheeseburger"
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-destructive">{errors.name.message}</p>
                                    )}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="description">Description *</Label>
                                    <Input
                                        id="description"
                                        {...register('description')}
                                        placeholder="Describe your product..."
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-destructive">{errors.description.message}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="price">Price *</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            {...register('price')}
                                            placeholder="19.99"
                                        />
                                        {errors.price && (
                                            <p className="text-sm text-destructive">{errors.price.message}</p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">Category *</Label>
                                        <Select
                                            value={category}
                                            onValueChange={(value) => setValue('category', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Main Course">Main Course</SelectItem>
                                                <SelectItem value="Burgers">Burgers</SelectItem>
                                                <SelectItem value="Pizza">Pizza</SelectItem>
                                                <SelectItem value="Sushi">Sushi</SelectItem>
                                                <SelectItem value="Sides">Sides</SelectItem>
                                                <SelectItem value="Drinks">Drinks</SelectItem>
                                                <SelectItem value="Desserts">Desserts</SelectItem>
                                                <SelectItem value="Bread">Bread</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.category && (
                                            <p className="text-sm text-destructive">{errors.category.message}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="image">Image URL</Label>
                                    <Input
                                        id="image"
                                        {...register('image')}
                                        placeholder="https://example.com/image.jpg"
                                    />
                                    {errors.image && (
                                        <p className="text-sm text-destructive">{errors.image.message}</p>
                                    )}
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="available"
                                        checked={isAvailable}
                                        onCheckedChange={(checked) => setValue('isAvailable', checked)}
                                    />
                                    <Label htmlFor="available">Available for order</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" type="button" onClick={handleClose} disabled={submitting}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={submitting}>
                                    {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {editMode ? 'Update' : 'Create'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default MenuPage;
