// cart.model.ts
import { model, Schema } from 'mongoose';
import { ICart } from './cart.interface';

const CartSchema = new Schema<ICart>(
  {
    reviewer: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Reviewer',
    },
    bussiness: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Bussiness',
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        variant: {
          type: Schema.Types.ObjectId,
          ref: 'Variant',
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
        referral: {
          reviewerId: {
            type: Schema.Types.ObjectId,
            ref: 'Reviewer',
          },
          reviewId: {
            type: Schema.Types.ObjectId,
            ref: 'Review',
          },
          amount: {
            type: Number,
          },
        },
      },
    ],
    totalQuantity: {
      type: Number,
      default: 0,
    },
    subTotal: {
      type: Number,
      default: 0,
    },
    deliveryFee: {
      type: Number,
      default: 0,
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to calculate totalQuantity and totalPrice
CartSchema.pre<ICart>('save', function (next) {
  this.totalQuantity = this.items.reduce((acc, item) => acc + item.quantity, 0);
  this.subTotal = this.items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  this.deliveryFee = 0;
  this.totalPrice = Number((this.subTotal + deliveryFee).toFixed(2));
  next();
});

const Cart = model<ICart>('Cart', CartSchema);
export default Cart;
