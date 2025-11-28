// Payment Status
const PAYMENT_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
};

// Payment Methods
const PAYMENT_METHODS = {
    CARD: 'card',
    WALLET: 'wallet',
    CASH: 'cash',
};

module.exports = {
    PAYMENT_STATUS,
    PAYMENT_METHODS,
};
