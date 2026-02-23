import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  MenuItem,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Headphones,
  Email,
  Phone,
  Send,
} from '@mui/icons-material';

interface SupportTicket {
  id?: string;
  subject: string;
  category: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  email: string;
  orderId?: string;
}

const categories = [
  { value: 'order', label: 'Order Issues' },
  { value: 'payment', label: 'Payment Problems' },
  { value: 'delivery', label: 'Delivery Issues' },
  { value: 'account', label: 'Account Help' },
  { value: 'restaurant', label: 'Restaurant Inquiry' },
  { value: 'other', label: 'Other' },
];

const priorities = [
  { value: 'low', label: 'Low - General Question' },
  { value: 'medium', label: 'Medium - Issue Affecting Experience' },
  { value: 'high', label: 'High - Urgent Issue' },
];

export default function Support() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState<SupportTicket>({
    subject: '',
    category: '',
    description: '',
    priority: 'medium',
    email: '',
    orderId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(false);
    setSuccess(true);
    setFormData({
      subject: '',
      category: '',
      description: '',
      priority: 'medium',
      email: '',
      orderId: '',
    });
    
    setTimeout(() => setSuccess(false), 5000);
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700 }}>
        <Headphones sx={{ mr: 2, verticalAlign: 'middle', color: '#f97316' }} />
        Help & Support
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        We're here to help! Submit a support ticket and we'll get back to you as soon as possible.
      </Typography>

      {/* Contact Options */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Phone sx={{ fontSize: 40, color: '#22c55e', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Call Us
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mon-Fri: 8am - 10pm
              </Typography>
              <Typography variant="body2" color="text.secondary">
                +251 912 345 678
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Email sx={{ fontSize: 40, color: '#3b82f6', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Email
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We'll respond within 24 hours
              </Typography>
              <Typography variant="body2" color="text.secondary">
                support@mesob.com
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Headphones sx={{ fontSize: 40, color: '#f97316', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Live Chat
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available 24/7
              </Typography>
              <Button
                variant="contained"
                sx={{ mt: 1, bgcolor: '#f97316', '&:hover': { bgcolor: '#ea580c' } }}
              >
                Start Chat
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Support Form */}
      <Card>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Submit a Ticket
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              Your support ticket has been submitted successfully! We'll get back to you soon.
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  label="Your Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Order ID (Optional)"
                  value={formData.orderId}
                  onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                  placeholder="e.g., ORD-12345"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  required
                  select
                  label="Priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                >
                  {priorities.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  label="Subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief summary of your issue"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  required
                  multiline
                  rows={5}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Please describe your issue in detail. Include any relevant information that might help us assist you better."
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <Send />}
                  sx={{
                    bgcolor: '#f97316',
                    '&:hover': { bgcolor: '#ea580c' },
                    py: 1.5,
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
            Frequently Asked Questions
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              How do I track my order?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Go to Orders and click on "Track" next to your order. You'll see real-time updates on your delivery status.
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              How do I get a refund?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contact our support team with your order ID. Refunds are typically processed within 5-7 business days.
            </Typography>
          </Box>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Can I change my order after placing it?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Once an order is confirmed, changes may not be possible. Contact the restaurant directly for assistance.
            </Typography>
          </Box>
          
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              How do I apply a coupon code?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter your coupon code in the "Apply Coupon" field on the checkout page before completing your payment.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
