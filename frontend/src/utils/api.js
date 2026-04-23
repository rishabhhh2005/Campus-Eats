export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api';

export const saveOrder = async (orderData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
      },
      body: JSON.stringify(orderData),
    });
    return await response.json();
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/orders`, {
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    const data = await response.json();
    return data.orders || data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getAllOrders = async () => {
  try {
    const response = await fetch(`${API_URL}/orders/all`);
    const data = await response.json();
    return data.orders || data;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

export const getPickupCode = async (orderId) => {
  try {
    const res = await fetch(`${API_URL}/orders/${orderId}/pickup-code`);
    if (!res.ok) throw new Error('Failed to fetch pickup code');
    return await res.json();
  } catch (error) {
    console.error('Error getting pickup code:', error);
    throw error;
  }
};

export const markPickedUp = async (orderId, code) => {
  try {
    const res = await fetch(`${API_URL}/orders/${orderId}/pickup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!res.ok) throw new Error('Failed to mark pickup');
    return await res.json();
  } catch (error) {
    console.error('Error marking pickup:', error);
    throw error;
  }
};

export const pickupByCode = async (code) => {
  try {
    const res = await fetch(`${API_URL}/pickup/by-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!res.ok) throw new Error('Failed to pick by code');
    return await res.json();
  } catch (error) {
    console.error('Error picking by code:', error);
    throw error;
  }
};

export const acceptOrder = async (orderId) => {
  try {
    const res = await fetch(`${API_URL}/orders/${orderId}/accept`, {
      method: 'POST'
    });
    if (!res.ok) throw new Error('Failed to accept order');
    return await res.json();
  } catch (error) {
    console.error('Error accepting order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const res = await fetch(`${API_URL}/orders/${orderId}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update status');
    return await res.json();
  } catch (error) {
    console.error('Error updating status:', error);
    throw error;
  }
};

export const acceptByCode = async (code) => {
  try {
    const res = await fetch(`${API_URL}/accept/by-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });
    if (!res.ok) throw new Error('Failed to accept by code');
    return await res.json();
  } catch (error) {
    console.error('Error accepting by code:', error);
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
      }
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || 'Failed to delete order');
    }
    return await res.json();
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};