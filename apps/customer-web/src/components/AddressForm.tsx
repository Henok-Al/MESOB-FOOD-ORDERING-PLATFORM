import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    FormControlLabel,
    Checkbox,
    Grid,
} from '@mui/material';

interface AddressData {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    isDefault: boolean;
}

interface AddressFormProps {
    onSubmit: (data: AddressData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const AddressForm: React.FC<AddressFormProps> = ({ onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState<AddressData>({
        street: '',
        city: '',
        state: '',
        zipCode: '',
        isDefault: false,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, checked, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Street Address"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="City"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="State"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Zip Code"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                name="isDefault"
                                checked={formData.isDefault}
                                onChange={handleChange}
                            />
                        }
                        label="Set as default address"
                    />
                </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={onCancel} disabled={isLoading}>
                    Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Address'}
                </Button>
            </Box>
        </Box>
    );
};

export default AddressForm;
