import express from 'express';
import db from './db.js';

const router = express.Router();

// ✅ **Создание нового заказа**
router.post('/orders', async (req, res) => {
  try {
    const { 
      user_id, 
      total_price, 
      status, 
      items, 
      shipping_address, 
      contact_phone, 
      comments 
    } = req.body;

    // Insert the order into the orders table
    const [orderResult] = await db.promise().query(
      'INSERT INTO orders (user_id, total_price, status, shipping_address, contact_phone, comments, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [user_id, total_price, status, shipping_address, contact_phone, comments]
    );

    const orderId = orderResult.insertId;

    // Insert each order item
    for (const item of items) {
      await db.promise().query(
        'INSERT INTO order_items (order_id, product_id, quantity, price, name) VALUES (?, ?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, item.price, item.name]
      );
    }

    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// ✅ **Получение заказов для конкретного пользователя**
router.get('/orders/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;

    // Get all orders for this user
    const [orders] = await db.promise().query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    // For each order, get its items
    for (let i = 0; i < orders.length; i++) {
      const [items] = await db.promise().query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orders[i].id]
      );
      orders[i].items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// ✅ **Получение всех заказов (для администратора)**
router.get('/orders/all', async (req, res) => {
  try {
    // Get all orders sorted by most recent first
    const [orders] = await db.promise().query(
      'SELECT o.*, u.name as userName FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC'
    );

    // For each order, get its items
    for (let i = 0; i < orders.length; i++) {
      const [items] = await db.promise().query(
        'SELECT * FROM order_items WHERE order_id = ?',
        [orders[i].id]
      );
      orders[i].items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching all orders:', error);
    res.status(500).json({ message: 'Failed to fetch all orders', error: error.message });
  }
});

// ✅ **Обновление статуса заказа (для администратора)**
router.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // Validate status
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status. Must be one of: processing, shipped, delivered, cancelled, completed' });
    }

    // Update the order status
    const result = await db.promise().query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );
    
    if (result[0].affectedRows === 0) {
      return res.status(404).json({ message: `Order with ID ${orderId} not found` });
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

console.log('Маршруты в OrderRoutes:');
router.stack.forEach(m => {
  if (m.route) {
    console.log(Object.keys(m.route.methods).join(', ').toUpperCase(), m.route.path);
  }
});

export default router;
