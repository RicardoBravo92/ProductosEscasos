import mongoose from 'mongoose';

const productPriceSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  storeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  }
});

// Índice compuesto para evitar duplicados de producto-tienda
productPriceSchema.index({ productId: 1, storeId: 1 }, { unique: true });

// Actualizar lastUpdated automáticamente
productPriceSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

export default mongoose.models.ProductPrice || mongoose.model('ProductPrice', productPriceSchema); 