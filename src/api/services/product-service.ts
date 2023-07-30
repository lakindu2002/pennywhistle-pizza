import Database from "@pizza/database";
import { ProductCreateRequest } from "@pizza/dto/product";
import { Product, ProductVariant } from "@pizza/entities";
import { ProductUtil } from "@pizza/utils";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { groupBy } from "lodash";

export class ProductService {
  static async getAllProducts(nextKey?: any) {
    const database = new Database();
    const { LastEvaluatedKey, Items } = await database.db
      .scan({
        TableName: database.productsTable,
        Limit: 15,
        ExclusiveStartKey: nextKey,
      })
      .promise();

    if (Items.length === 0) {
      return { products: [], nextKey: undefined };
    }

    const groupedProducts = groupBy(Items, "baseSku");

    // Convert the groupedProducts object back to an array of product objects
    const products = Object.values(groupedProducts).map((variants: any[]) => {
      const baseProduct = variants[0]; // Use the first variant to represent the base product
      const variantsWithoutBase = variants.slice(1); // Remove the first variant (base product)

      return {
        name: baseProduct.name,
        baseSku: baseProduct.baseSku,
        variants: variantsWithoutBase.map((variant) => ({
          sku: variant.sku,
          price: variant.price,
          size: variant.size,
          type: variant.type,
        })),
      };
    });
    return { products, nextKey: LastEvaluatedKey };
  }

  static async deleteProductBySku(sku: string) {
    const database = new Database();
    let nextKey: any;
    const items: (Product | ProductVariant)[] = [];
    do {
      const { Items, LastEvaluatedKey } = await database.db
        .query({
          TableName: database.productsTable,
          KeyConditionExpression: "#baseSku = :sku",
          ExpressionAttributeNames: {
            "#baseSku": "baseSku",
          },
          ExpressionAttributeValues: {
            ":sku": sku,
          },
          ExclusiveStartKey: nextKey,
        })
        .promise();
      items.push(...(Items as (Product | ProductVariant)[]));
      nextKey = LastEvaluatedKey;
    } while (nextKey !== undefined);

    if (items.length === 0) {
      throw new Error("Product does not exist");
    }

    const transactItems: DocumentClient.TransactWriteItemList = [];
    items.forEach((item) => {
      transactItems.push({
        Delete: {
          Key: { baseSku: item.baseSku, variantSku: item.variantSku },
          TableName: database.productsTable,
        },
      });
    });

    await database.db
      .transactWrite({
        TransactItems: transactItems,
      })
      .promise();
  }

  static async createProduct(createRequest: ProductCreateRequest) {
    const { name, sku, variants = [] } = createRequest;

    if (variants.length > 99) {
      throw new Error("Cannot add more than 99 variants ");
    }

    const product: Product = {
      baseSku: sku.toUpperCase().trim(),
      name,
      variantSku: sku.toUpperCase().trim(),
    };

    const productVariants: ProductVariant[] = variants.map((variant) => ({
      price: variant.price,
      size: variant.size,
      type: variant.type,
      variantSku: ProductUtil.generateVariantSku(product.baseSku, variant.size),
      baseSku: product.baseSku,
    }));

    const database = new Database();

    const transactItems: DocumentClient.TransactWriteItemList = [];

    transactItems.push({
      Put: {
        Item: product,
        TableName: database.productsTable,
        ConditionExpression: "attribute_not_exists(baseSku)",
      },
    });

    transactItems.push(
      ...productVariants.map((productVariant) => ({
        Put: {
          Item: productVariant,
          TableName: database.productsTable,
        },
      }))
    );
    try {
      await database.db
        .transactWrite({
          TransactItems: transactItems,
        })
        .promise();

      return {
        product: {
          ...product,
          variants: productVariants,
        },
      };
    } catch (err) {
      throw new Error("The product already exists.");
    }
  }

  static async updateVariantAttributes(
    productId: string,
    variantSku: string,
    updatedAttributes: any
  ) {
    if (updatedAttributes.size) {
      throw new Error("Cannot update size");
    }

    const database = new Database();
    const params: DocumentClient.UpdateItemInput = {
      TableName: database.productsTable,
      Key: {
        baseSku: productId,
        variantSku: variantSku,
      },
      UpdateExpression:
        "SET " +
        Object.keys(updatedAttributes)
          .map((attr) => `#${attr} = :${attr}`)
          .join(","),
      ExpressionAttributeNames: Object.keys(updatedAttributes).reduce(
        (acc, attr) => ({
          ...acc,
          [`#${attr}`]: attr,
        }),
        {}
      ),
      ExpressionAttributeValues: Object.keys(updatedAttributes).reduce(
        (acc, attr) => ({
          ...acc,
          [`:${attr}`]: updatedAttributes[attr],
        }),
        {}
      ),
    };

    await database.db.update(params).promise();
  }

  static async updateProductAttributes(
    productId: string,
    updatedAttributes: any
  ) {
    const database = new Database();
    const params: DocumentClient.UpdateItemInput = {
      TableName: database.productsTable,
      Key: {
        baseSku: productId,
        variantSku: productId, // the variantSku is the same as the baseSku
      },
      UpdateExpression:
        "SET " +
        Object.keys(updatedAttributes)
          .map((attr) => `#${attr} = :${attr}`)
          .join(","),
      ExpressionAttributeNames: Object.keys(updatedAttributes).reduce(
        (acc, attr) => ({
          ...acc,
          [`#${attr}`]: attr,
        }),
        {}
      ),
      ExpressionAttributeValues: Object.keys(updatedAttributes).reduce(
        (acc, attr) => ({
          ...acc,
          [`:${attr}`]: updatedAttributes[attr],
        }),
        {}
      ),
    };

    await database.db.update(params).promise();
  }
}
