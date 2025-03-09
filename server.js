// Import required modules
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors()); // Ensures cross-origin requests work

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB Atlas connected successfully!');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Define Order Schema
const OrderSchema = new mongoose.Schema({
  customerId: String,
  restaurantId: String,
  driverId: String,
  items: Array,
  status: String, // placed, preparing, picked up, delivered
  location: { lat: Number, lng: Number }
});
const Order = mongoose.model('Order', OrderSchema);

// Create new order route
app.post('/order', async (req, res) => {
  try {
    const newOrder = new Order({ ...req.body, status: 'placed' });
    await newOrder.save();
    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to create order", details: error.message });
  }
});


// Fetch all orders
app.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders", details: error.message });
  }
});


app.put('/order/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.delete('/order/:id', async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete order' });
  }
});

// Root Route (For testing)
app.get('/', (req, res) => {
  res.send('🚀 Server is running successfully!');
});




// Update order status with validation
app.put('/order/:id', async (req, res) => {
  try {
    // Validate if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "Invalid order ID format" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order", details: error.message });
  }
});


// Delete an order
app.delete('/order/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    
    if (!deletedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete order", details: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

