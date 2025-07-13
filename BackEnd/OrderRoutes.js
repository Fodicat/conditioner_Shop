import express from 'express';
import db from './db.js';

const router = express.Router();

async function getOrderItems(orderId) {
  const [items] = await db.execute(
    'SELECT * FROM order_items WHERE order_id = ?',
    [orderId]
  );
  return items;
}

// ✅ Создание нового заказа - Обновление завершено
router.post('/orders', async (req, res) => {
  try {
    const {
      user_id,
      total_price,
      status = 'processing',
      items = [],
      shipping_address,
      contact_phone,
      comments
    } = req.body;

    if (!user_id || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Missing required fields or items is empty' });
    }

    const [orderResult] = await db.execute(
      `INSERT INTO orders 
       (user_id, total_price, status, shipping_address, contact_phone, comments, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [user_id, total_price, status, shipping_address, contact_phone, comments]
    );

    const orderId = orderResult.insertId;

    const itemInsertPromises = items.map(item =>
      db.execute(
        `INSERT INTO order_items 
         (order_id, product_id, quantity, price, name) 
         VALUES (?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price, item.name]
      )
    );

    await Promise.all(itemInsertPromises);

    res.status(201).json({ message: 'Order created successfully', orderId });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// ✅ Получение заказов пользователя - Обновление завершено
router.get('/orders/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [orders] = await db.execute(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const items = await getOrderItems(order.id);
        return { ...order, items };
      })
    );

    res.json(enrichedOrders);
  } catch (error) {
    console.error('❌ Error fetching user orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// ✅ Получение всех заказов (админ) - Обновление завершено
router.get('/orders/all', async (req, res) => {
  try {
    const [orders] = await db.execute(
      `SELECT o.*, u.name AS userName 
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id 
       ORDER BY o.created_at DESC`
    );

    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const items = await getOrderItems(order.id);
        return { ...order, items };
      })
    );

    res.json(enrichedOrders);
  } catch (error) {
    console.error('❌ Error fetching all orders:', error);
    res.status(500).json({ message: 'Failed to fetch all orders', error: error.message });
  }
});

// ✅ Обновление статуса заказа - Обновление завершено
router.put('/orders/:orderId/status', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled', 'completed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Invalid status: must be one of [${validStatuses.join(', ')}]`
      });
    }

    const [result] = await db.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `Order with ID ${orderId} not found` });
    }

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

// 🔍 Вывод всех маршрутов в лог
console.log('\n📦 OrderRoutes registered:');
router.stack.forEach((m) => {
  if (m.route) {
    const methods = Object.keys(m.route.methods).map(m => m.toUpperCase()).join(', ');
    console.log(`${methods.padEnd(10)} ${m.route.path}`);
  }
});

export default router;