/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';
import { deleteFileFromS3 } from '../../aws/deleteFromS2';
import QueryBuilder from '../../builder/QueryBuilder';
import AppError from '../../error/appError';
import { ENUM_PRODUCT_STATUS } from '../../utilities/enum';
import Bookmark from '../bookmark/bookmark.mode';
import Category from '../category/category.model';
import { Store } from '../store/store.model';
import { IProduct } from './product.interface';
import Product from './product.model';

const createProduct = async (bussinessId: string, payload: IProduct) => {
  const store = await Store.findOne({ bussiness: bussinessId });
  if (!store) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      'Before creating any product you need to add your store details',
    );
  }
  const category = await Category.findById(payload.category);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  const result = await Product.create({ ...payload, bussiness: bussinessId });
  return result;
};
const saveAsDraft = async (bussinessId: string, payload: IProduct) => {
  const category = await Category.findById(payload.category);
  if (!category) {
    throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
  }
  const result = await Product.create({
    ...payload,
    bussiness: bussinessId,
    status: ENUM_PRODUCT_STATUS.DRAFT,
  });
  return result;
};

const publishProductFromDraft = async (
  profileId: string,
  id: string,
  payload: IProduct,
) => {
  const product = await Product.findOne({
    bussiness: profileId,
    _id: id,
    status: ENUM_PRODUCT_STATUS.DRAFT,
  });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  payload.status = ENUM_PRODUCT_STATUS.ACTIVE;
  const result = await Product.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });

  const imagesToDelete = product.images?.filter(
    (img) => !payload.images?.includes(img),
  );

  if (imagesToDelete && imagesToDelete.length > 0) {
    for (const imageUrl of imagesToDelete) {
      await deleteFileFromS3(imageUrl);
    }
  }
  return result;
};

const deleteSingleProduct = async (profileId: string, id: string) => {
  const product = await Product.findOneAndUpdate(
    { bussiness: profileId, _id: id },
    { isDeleted: true },
    { new: true, runValidators: true },
  );

  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return product;
};
const softDeleteSingleProduct = async (profileId: string, id: string) => {
  const product = await Product.findOneAndUpdate(
    { bussiness: profileId, _id: id },
    { status: ENUM_PRODUCT_STATUS.ARCHIVED },
    { new: true, runValidators: true },
  );
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return product;
};
// change product status -------------

const changeProductStatus = async (
  profileId: string,
  id: string,
  status: string,
) => {
  const product = await Product.findOne({ bussiness: profileId, _id: id });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }
  const result = await Product.findByIdAndUpdate(
    id,
    { status: status },
    { new: true, runValidators: true },
  );
  return result;
};

const getAllProduct = async (
  query: Record<string, unknown>,
  userData: JwtPayload,
) => {
  if (userData.role === 'bussinessOwner') {
    const productQuery = new QueryBuilder(
      Product.find({ isDeleted: false }).populate({
        path: 'category',
        select: 'name category_image',
      }),
      query,
    )
      .search(['name', 'description'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const result = await productQuery.modelQuery;
    const meta = await productQuery.countTotal();

    return {
      meta,
      result,
    };
  } else {
    const reviewerId = userData.profileId;
    const productQuery = new QueryBuilder(
      Product.find({
        isDeleted: false,
        status: ENUM_PRODUCT_STATUS.ACTIVE,
      }).populate({
        path: 'category',
        select: 'name category_image',
      }),
      query,
    )
      .search(['name', 'description'])
      .filter()
      .sort()
      .paginate()
      .fields();

    const result = await productQuery.modelQuery;
    const meta = await productQuery.countTotal();

    const productIds = result.map((product: any) => product._id);

    const bookmarks = await Bookmark.find({
      reviewer: reviewerId,
      product: { $in: productIds },
    }).select('product');

    const bookmarkedProductIds = new Set(
      bookmarks.map((bookmark) => bookmark.product.toString()),
    );

    const productsWithBookmarkStatus = result.map((product: any) => ({
      ...product.toObject(),
      isBookmark: bookmarkedProductIds.has(product._id.toString()),
    }));

    return {
      meta,
      result: productsWithBookmarkStatus,
    };
  }
};

const getSingleProductFromDB = async (id: string, reviewerId?: string) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Invalid product id');
  }
  const objectId = new mongoose.Types.ObjectId(id);

  let reviewerObjectId: mongoose.Types.ObjectId | null = null;
  if (reviewerId && mongoose.Types.ObjectId.isValid(reviewerId)) {
    reviewerObjectId = new mongoose.Types.ObjectId(reviewerId);
  }

  const pipeline: any[] = [
    { $match: { _id: objectId, isDeleted: false } },

    {
      $lookup: {
        from: 'bussinesses',
        let: { bussinessId: '$bussiness' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$bussinessId'] } } },
          {
            $project: {
              _id: 1,
              bussinessName: 1,
              coverImage: 1,
              logo: 1,
              phoneNumber: 1,
            },
          },
        ],
        as: 'bussiness',
      },
    },
    { $unwind: { path: '$bussiness', preserveNullAndEmptyArrays: true } },

    // Lookup category
    {
      $lookup: {
        from: 'categories',
        let: { categoryId: '$category' },
        pipeline: [
          { $match: { $expr: { $eq: ['$_id', '$$categoryId'] } } },
          { $project: { _id: 1, name: 1 } },
        ],
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },

    // Lookup reviews and calculate avg rating
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'product',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        avgRating: { $ifNull: [{ $avg: '$reviews.rating' }, 0] },
      },
    },
  ];

  // If reviewer provided and valid -> lookup bookmark
  if (reviewerObjectId) {
    pipeline.push(
      {
        $lookup: {
          from: 'bookmarks',
          let: { productId: '$_id', reviewerId: reviewerObjectId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$product', '$$productId'] },
                    { $eq: ['$reviewer', '$$reviewerId'] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: 'bookmark',
        },
      },
      {
        $addFields: {
          isBookmark: {
            $cond: {
              if: { $gt: [{ $size: { $ifNull: ['$bookmark', []] } }, 0] },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $project: {
          reviews: 0,
          bookmark: 0,
        },
      },
    );
  } else {
    // no reviewer -> always false
    pipeline.push(
      {
        $addFields: { isBookmark: false },
      },
      {
        $project: { reviews: 0 },
      },
    );
  }

  const result = await Product.aggregate(pipeline);

  if (!result || result.length === 0) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  return result[0];
};

// update product

const updateProductIntoDB = async (
  bussinessId: string,
  productId: string,
  payload: Partial<IProduct>,
) => {
  if (payload.category) {
    const category = await Category.exists({ _id: payload.category });
    if (!category) {
      throw new AppError(httpStatus.NOT_FOUND, 'Category not found');
    }
  }
  const product: any = await Product.findOne({
    bussiness: bussinessId,
    _id: productId,
  });
  if (!product) {
    throw new AppError(httpStatus.NOT_FOUND, 'Product not found');
  }

  if (payload.newImages) {
    payload.images = [...payload.newImages, ...product.images];
  } else {
    payload.images = [...product.images];
  }
  if (payload?.deletedImages) {
    payload.images = payload.images.filter(
      (url) => !payload?.deletedImages?.includes(url),
    );
  }

  const result = await Product.findByIdAndUpdate(productId, payload, {
    new: true,
    runValidators: true,
  });

  if (payload.deletedImages?.length) {
    await Promise.all(payload.deletedImages.map(deleteFileFromS3));
  }

  return result;
};

const ProductService = {
  createProduct,
  // createProductIntoDB,
  // saveProductAsDraftIntoDB,
  publishProductFromDraft,
  deleteSingleProduct,
  softDeleteSingleProduct,
  changeProductStatus,
  getAllProduct,
  getSingleProductFromDB,
  updateProductIntoDB,
  saveAsDraft,
};

export default ProductService;
