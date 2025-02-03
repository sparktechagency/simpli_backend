/* eslint-disable @typescript-eslint/no-explicit-any */
import { IProduct } from './product.interface';
import Product from './product.model';

const createProductIntoDB = async (
  profileId: string,
  payload: IProduct,
  files: any,
) => {
  const productImages = files?.product_image
    ? files.product_image.map((file: any) => file.path)
    : [];

  const variantImagesMap: { [key: string]: string[] } = {};
  if (files) {
    Object.keys(files).forEach((key) => {
      if (key.startsWith('variant_image_')) {
        const sku = key.replace('variant_image_', '');
        variantImagesMap[sku] = files[key].map((file: any) => file.path);
      }
    });
  }
  const updatedVariants = payload.variants.map((variant) => ({
    ...variant,
    images: variantImagesMap[variant.sku] || [],
  }));

  const result = await Product.create({
    ...payload,
    bussiness: profileId,
    images: productImages,
    variants: updatedVariants,
  });

  return result;
};

const ProductService = {
  createProductIntoDB,
};

export default ProductService;
