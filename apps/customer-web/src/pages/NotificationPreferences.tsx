import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Switch,
  Button,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Notifications,
  Email,
  PhoneAndroid,
  LocalOffer,
  ShoppingCart,
  Loyalty,
} from '@mui/icons-material';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  requestNotificationPermission,
  areNotificationsEnabled,
} from '../services/notificationService';

interface UserNotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  loyaltyRewards: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
}

export default function NotificationPreferences() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserNotificationPreferences>({
    orderUpdates: true,
    promotions: true,
    loyaltyRewards: true,
    pushEnabled: false,
    emailEnabled: true,
  });
  const [notificationPermission, setNotificationPermission] = useState<string>('default');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPreferences();
    checkNotificationPermission();
  }, []);

  const checkNotificationPermission = async () => {
    try {
      const enabled = await areNotificationsEnabled();
      setNotificationPermission(enabled ? 'granted' : 'default');
    } catch {
      setNotificationPermission('denied');
    }
  };

  const loadPreferences = async () => {
    try {
      setLoading(true);
      const data = await getNotificationPreferences();
      setPreferences(data);
    } catch (err) {
      // Use default preferences on error
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: keyof UserNotificationPreferences) => {
    if (key === 'pushEnabled' && !preferences.pushEnabled) {
      // Request push notification permission when enabling
      const permission = await requestNotificationPermission();
      if (permission !== 'granted') {
        setError('Push notification permission was denied');
        return;
      }
      setNotificationPermission('granted');
    }
    
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);
    await savePreferences(newPreferences);
  };

  const savePreferences = async (newPreferences: UserNotificationPreferences) => {
    try {
      setSaving(true);
      setSuccess(false);
      setError(null);
      await updateNotificationPreferences(newPreferences);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Notification Settings
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Preferences saved successfully!
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Push Notifications */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <PhoneAndroid sx={{ mr: 2, color: '#f97316' }} />
            <Typography variant="h6">Push Notifications</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Receive instant notifications on your device
          </Typography>
          
          {notificationPermission === 'denied' && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Push notifications are blocked. Please enable them in your browser settings.
            </Alert>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Enable push notifications</Typography>
            <Switch
              checked={preferences.pushEnabled}
              onChange={() => handleToggle('pushEnabled')}
              disabled={saving}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#f97316',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#f97316',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Email Notifications */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Email sx={{ mr: 2, color: '#f97316' }} />
            <Typography variant="h6">Email Notifications</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Receive updates via email
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography>Enable email notifications</Typography>
            <Switch
              checked={preferences.emailEnabled}
              onChange={() => handleToggle('emailEnabled')}
              disabled={saving}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#f97316',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#f97316',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Notifications sx={{ mr: 2, color: '#f97316' }} />
            <Typography variant="h6">Notification Types</Typography>
          </Box>
          
          <Divider sx={{ my: 2 }} />

          {/* Order Updates */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ShoppingCart sx={{ mr: 2, color: '#3b82f6' }} />
              <Box>
                <Typography>Order Updates</Typography>
                <Typography variant="caption" color="text.secondary">
                  Get notified about order status changes
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={preferences.orderUpdates}
              onChange={() => handleToggle('orderUpdates')}
              disabled={saving}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#f97316',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#f97316',
                },
              }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Promotions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LocalOffer sx={{ mr: 2, color: '#22c55e' }} />
              <Box>
                <Typography>Promotions</Typography>
                <Typography variant="caption" color="text.secondary">
                  Receive promotional offers and discounts
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={preferences.promotions}
              onChange={() => handleToggle('promotions')}
              disabled={saving}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#f97316',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#f97316',
                },
              }}
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Loyalty Rewards */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Loyalty sx={{ mr: 2, color: '#f59e0b' }} />
              <Box>
                <Typography>Loyalty Rewards</Typography>
                <Typography variant="caption" color="text.secondary">
                  Get updates about points and rewards
                </Typography>
              </Box>
            </Box>
            <Switch
              checked={preferences.loyaltyRewards}
              onChange={() => handleToggle('loyaltyRewards')}
              disabled={saving}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#f97316',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#f97316',
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <Button
        variant="contained"
        onClick={() => savePreferences(preferences)}
        disabled={saving}
        sx={{
          bgcolor: '#f97316',
          '&:hover': { bgcolor: '#ea580c' },
          width: '100%',
        }}
      >
        {saving ? 'Saving...' : 'Save Preferences'}
      </Button>
    </Box>
  );
}
