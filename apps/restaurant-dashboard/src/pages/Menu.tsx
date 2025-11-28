import React, { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, Loader2 } from 'lucide-react';
// import { useSelector } from 'react-redux';
// import { type RootState } from '../store';
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
    // const { user } = useSelector((state: RootState) => state.auth);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        isAvailable: true,
    });

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
            setFormData({
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
            setFormData({
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
    };

    const handleSubmit = async () => {
        try {
            const restResponse = await api.get('/restaurants');
            const restaurantId = restResponse.data.data.restaurants[0]._id;

            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                restaurant: restaurantId,
            };

            if (editMode && selectedProduct) {
                await api.put(`/restaurants/${restaurantId}/products/${selectedProduct}`, payload);
                alert('Product updated successfully!');
            } else {
                await api.post(`/restaurants/${restaurantId}/products`, payload);
                alert('Product created successfully!');
            }

            fetchProducts();
            handleClose();
        } catch (error: any) {
            console.error('Failed to save product:', error);
            alert(error.response?.data?.message || 'Failed to save product');
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
            alert('Product deleted successfully!');
            fetchProducts();
        } catch (error: any) {
            console.error('Failed to delete product:', error);
            alert(error.response?.data?.message || 'Failed to delete product');
        }
    };

    return (
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
                    </CardContent>
                </Card>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>{editMode ? 'Edit Item' : 'Add New Item'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Product Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Burgers">Burgers</SelectItem>
                                        <SelectItem value="Pizza">Pizza</SelectItem>
                                        <SelectItem value="Sushi">Sushi</SelectItem>
                                        <SelectItem value="Sides">Sides</SelectItem>
                                        <SelectItem value="Drinks">Drinks</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="image">Image URL</Label>
                            <Input
                                id="image"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch
                                id="available"
                                checked={formData.isAvailable}
                                onCheckedChange={(checked) =>
                                    setFormData({ ...formData, isAvailable: checked })
                                }
                            />
                            <Label htmlFor="available">Available</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button onClick={handleSubmit}>
                            {editMode ? 'Update' : 'Create'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MenuPage;
