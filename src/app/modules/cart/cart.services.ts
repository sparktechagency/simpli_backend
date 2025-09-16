/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../error/appError';
import Product from '../product/product.model';
import Variant from '../variant/variant.model';
import Cart from './cart.model';

interface addToCartProps {
  reviewerId: string;
  bussinessId: string;
  productId: any;
  variantId: Types.ObjectId | null;
  price: number;
  referral?: {
    reviewerId: Types.ObjectId;
    reviewId: Types.ObjectId;
    amount: Types.ObjectId;
  } | null;
}

const addToCart = async ({
  reviewerId,
  bussinessId,
  productId,
  variantId,
  referral,
}: addToCartProps) => {
  let cart = await Cart.findOne({ reviewer: reviewerId });

  if (cart) {
    if (cart?.bussiness?.toString() !== bussinessId) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        'You already add item in cart for a different shop , you need to order those or clear cart then you can add to cart for this item',
      );
    }
  }

  if (!cart) {
    cart = new Cart({
      reviewer: reviewerId,
      bussiness: bussinessId,
      variant: variantId,
      items: [],
    });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() == productId && item.variant == variantId,
  );

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    let price;
    if (variantId) {
      const variant = await Variant.findById(variantId).select('price');
      price = variant?.price;
    } else {
      const product = await Product.findById(productId).select('price');
      price = product?.price;
    }
    // Add new item to the cart
    cart.items.push({
      product: productId,
      variant: variantId,
      quantity: 1,
      price: price as number,
      referral: referral ? referral : null,
    });
  }

  await cart.save();
  return cart;
};

// remove cart item

export const removeCartItem = async (
  reviewerId: string,
  productId: string,
  variantId: string | null,
) => {
  const cart = await Cart.findOne({ reviewer: reviewerId });

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  // cart.items = cart.items.filter(
  //   (item) => item.product.toString() != productId && item.variant != variantId,
  // );
  cart.items = cart.items.filter(
    (item) =>
      !(item.product.toString() == productId && item.variant == variantId),
  );

  if (cart.items.length == 0) {
    await Cart.findOneAndDelete({ reviewer: reviewerId });
    return null;
  } else {
    await cart.save();
    return cart;
  }
};

// view cart

const viewCart = async (reviewerId: string) => {
  const cart = await Cart.findOne({ reviewer: reviewerId })
    .populate('items.product', 'name images')
    .populate('items.variant');

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  return cart;
};

// increase quantity

const increaseCartItemQuantity = async (
  reviewerId: string,
  productId: string,
  variantId: string | null,
) => {
  const cart = await Cart.findOne({ reviewer: reviewerId });

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  const item = cart.items.find(
    (item) => item.product.toString() == productId && item.variant == variantId,
  );

  if (!item) {
    throw new AppError(httpStatus.NOT_FOUND, 'Item not found');
  }

  item.quantity += 1;

  await cart.save();
  return cart;
};

// decrease quantity---------------

export const decreaseCartItemQuantity = async (
  reviewerId: string,
  productId: string,
  variantId: string | null,
) => {
  const cart = await Cart.findOne({ reviewer: reviewerId });

  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, 'Cart not found');
  }

  const item = cart.items.find(
    (item) => item.product.toString() == productId && item.variant == variantId,
  );

  if (!item) {
    throw new AppError(httpStatus.NOT_FOUND, 'Item not found');
  }

  if (item.quantity > 1) {
    item.quantity -= 1;
  } else {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'Quantity cannot be less than 1',
    );
  }

  await cart.save();
  return cart;
};

const clearCartFromDB = async (reviewerId: string) => {
  const cart = await Cart.findOne({ reviewer: reviewerId });
  if (!cart) {
    throw new AppError(httpStatus.NOT_FOUND, "You don't have any cart");
  }
  const result = await Cart.findOneAndDelete({ reviewer: reviewerId });

  return result;
};

const cartServices = {
  addToCart,
  removeCartItem,
  viewCart,
  increaseCartItemQuantity,
  decreaseCartItemQuantity,
  clearCartFromDB,
};

export default cartServices;
