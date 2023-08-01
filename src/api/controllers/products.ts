import { ProductCreateRequest } from "@pizza/dto/product";
import { Request, Response } from "express";
import { ProductService } from "@pizza/api/services";

export const createProduct = async (req: Request, resp: Response) => {
  const { name, sku, variants = [] } = req.body as ProductCreateRequest;
  if (variants.length === 0) {
    resp.status(400);
    resp.send({ message: "NO_VARIANTS" });
    return;
  }
  try {
    const createdProduct = await ProductService.createProduct({
      name,
      sku,
      variants,
    });
    resp.json({ message: "PRODUCT_CREATED", product: createdProduct });
  } catch (err) {
    resp.status(409);
    resp.json({ message: err?.message || "The product already exists" });
  }
};

export const getProducts = async (req: Request, resp: Response) => {
  const { nextKey } = req.body;
  const { products, nextKey: newNextKey } = await ProductService.getAllProducts(
    nextKey
  );
  resp.json({ products, nextKey: newNextKey });
};

export const patchProductById = async (req: Request, resp: Response) => {
  const {
    baseSku,
    isVariantUpdate = false,
    variantSku,
    updatedAttributes,
  } = req.body;

  if (isVariantUpdate) {
    try {
      // Perform the update for the specific variant
      await ProductService.updateVariantAttributes(
        baseSku,
        variantSku,
        updatedAttributes
      );
      resp.json({ message: "Variant updated successfully." });
    } catch (err) {
      resp.status(500).json({
        error: err?.message || "An error occurred while updating the variant.",
      });
    }
  } else {
    // Product update logic
    try {
      // Perform the update for the base product
      await ProductService.updateProductAttributes(baseSku, updatedAttributes);
      resp.json({ message: "Product updated successfully." });
    } catch (err) {
      resp.status(500).json({
        error: err?.message || "An error occurred while updating the product.",
      });
    }
  }
};

export const deleteProductByBaseSku = async (req: Request, resp: Response) => {
  const { productId } = req.body;
  try {
    await ProductService.deleteProductBySku(productId);
    resp.json({ message: "PRODUCT_DELETED" });
  } catch (err) {
    resp.status(500);
    resp.json({ message: err?.message || "Failed to remove product" });
  }
};
