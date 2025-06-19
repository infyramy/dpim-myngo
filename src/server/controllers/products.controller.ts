import { Request, Response } from "express";
import { db } from "../config/database";
import { sendSuccess, sendError } from "../utils/response";

// Types
interface Tag {
  id: number;
  name: string;
  slug: string;
}

export class ProductsController {
  /**
   * Get all products with their tags
   */
  static async getProducts(req: Request, res: Response) {
    try {
      // Get user ID from request
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 401, "User authentication required");
      }

      const products = await db("products")
        .select(
          "p_id as id",
          "p_name as name",
          "p_description as description",
          "p_category as category",
          "p_image_url as image",
          "p_status as status",
          "p_featured as featured",
          "p_slug as slug",
          "p_business_id as businessId",
          "p_created_at as createdAt",
          "p_modified_at as modifiedAt"
        )
        .where("p_user_id", userId)
        .orderBy("p_created_at", "desc");

      // Get tags for all products
      const productIds = products.map(p => p.id);
      const productTags = productIds.length > 0 ? await db("product_tags")
        .join("tags", "product_tags.pt_tag_id", "tags.t_id")
        .select(
          "product_tags.pt_product_id as productId",
          "tags.t_id as id",
          "tags.t_name as name",
          "tags.t_slug as slug"
        )
        .whereIn("product_tags.pt_product_id", productIds) : [];

      // Group tags by product ID
      const tagsByProduct = productTags.reduce((acc, tag) => {
        if (!acc[tag.productId]) {
          acc[tag.productId] = [];
        }
        acc[tag.productId].push({
          id: tag.id,
          name: tag.name,
          slug: tag.slug
        });
        return acc;
      }, {} as Record<number, any[]>);

      // Convert status and featured to proper format and add tags
      const formattedProducts = products.map((product) => ({
        ...product,
        status: product.status === 1 ? "active" : "inactive",
        featured: product.featured === 1,
        image: product.image || "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image",
        tags: tagsByProduct[product.id] || []
      }));

      return sendSuccess(
        res,
        { products: formattedProducts },
        "Products fetched successfully"
      );
    } catch (error) {
      console.error("Get products error:", error);
      return sendError(res, 500, "Internal server error");
    }
  }

  /**
   * Helper method to create or get tags
   */
  static async createOrGetTags(tagNames: string[], userId: number): Promise<Tag[]> {
    const tags: Tag[] = [];
    
    for (const tagName of tagNames) {
      const cleanTagName = tagName.trim().toLowerCase();
      if (!cleanTagName) continue;

      // Generate slug
      const slug = cleanTagName
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-+|-+$/g, "");

      // Check if tag exists for this user
      let existingTag = await db("tags")
        .where("t_name", cleanTagName)
        .where("t_user_id", userId)
        .first();

      if (!existingTag) {
        // Create new tag
        const [tagId] = await db("tags").insert({
          t_name: cleanTagName,
          t_slug: slug,
          t_user_id: userId
        });

        existingTag = {
          t_id: tagId,
          t_name: cleanTagName,
          t_slug: slug
        };
      }

      tags.push({
        id: existingTag.t_id,
        name: existingTag.t_name,
        slug: existingTag.t_slug
      });
    }

    return tags;
  }

  /**
   * Helper method to associate tags with a product
   */
  static async associateProductTags(productId: number, tagIds: number[]) {
    // Remove existing associations
    await db("product_tags").where("pt_product_id", productId).del();

    // Add new associations
    if (tagIds.length > 0) {
      const productTagData = tagIds.map(tagId => ({
        pt_product_id: productId,
        pt_tag_id: tagId
      }));

      await db("product_tags").insert(productTagData);
    }
  }

  /**
   * Create a new product with tags
   */
  static async createProduct(req: Request, res: Response) {
    try {
      const {
        name,
        description,
        category,
        image,
        status,
        featured,
        businessId,
        tags: tagNames = []
      } = req.body;

      // Basic validation
      if (!name || !description || !category) {
        return sendError(res, 400, "Name, description, and category are required");
      }

      // Get user ID from request
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 401, "User authentication required");
      }

      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim("-");

      // Check if slug already exists for this user
      let finalSlug = slug;
      let counter = 1;
      while (true) {
        const existingProduct = await db("products")
          .where("p_slug", finalSlug)
          .where("p_user_id", userId)
          .first();
        
        if (!existingProduct) break;
        
        finalSlug = `${slug}-${counter}`;
        counter++;
      }

      // Prepare product data for database insertion
      const productData = {
        p_name: name.trim(),
        p_description: description.trim(),
        p_category: category,
        p_image_url: image?.trim() || null,
        p_status: status === "active" ? 1 : 0,
        p_featured: featured ? 1 : 0,
        p_slug: finalSlug,
        p_business_id: businessId || null,
        p_user_id: userId,
      };

      // Insert the product
      const [productId] = await db("products").insert(productData);

      // Handle tags
      let productTags: Tag[] = [];
      if (Array.isArray(tagNames) && tagNames.length > 0) {
        productTags = await ProductsController.createOrGetTags(tagNames, userId);
        const tagIds = productTags.map(tag => tag.id);
        await ProductsController.associateProductTags(productId, tagIds);
      }

      // Fetch the created product with proper field mapping
      const createdProduct = await db("products")
        .select(
          "p_id as id",
          "p_name as name",
          "p_description as description",
          "p_category as category",
          "p_image_url as image",
          "p_status as status",
          "p_featured as featured",
          "p_slug as slug",
          "p_business_id as businessId",
          "p_created_at as createdAt",
          "p_modified_at as modifiedAt"
        )
        .where("p_id", productId)
        .first();

      // Format the response
      const formattedProduct = {
        ...createdProduct,
        status: createdProduct.status === 1 ? "active" : "inactive",
        featured: createdProduct.featured === 1,
        image: createdProduct.image || "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image",
        tags: productTags
      };

      return sendSuccess(
        res,
        { product: formattedProduct },
        "Product created successfully"
      );
    } catch (error) {
      console.error("Create product error:", error);
      return sendError(res, 500, "Internal server error");
    }
  }

  /**
   * Update an existing product with tags
   */
  static async updateProduct(req: Request, res: Response) {
    try {
      const productId = req.params.id;
      const {
        name,
        description,
        category,
        image,
        status,
        featured,
        businessId,
        tags: tagNames = []
      } = req.body;

      // Validate product ID
      if (!productId || isNaN(Number(productId))) {
        return sendError(res, 400, "Invalid product ID");
      }

      // Get user ID from request
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 401, "User authentication required");
      }

      // Check if product exists and belongs to user
      const existingProduct = await db("products")
        .where("p_id", productId)
        .where("p_user_id", userId)
        .first();

      if (!existingProduct) {
        return sendError(res, 404, "Product not found or access denied");
      }

      // Basic validation
      if (!name || !description || !category) {
        return sendError(res, 400, "Name, description, and category are required");
      }

      // Generate slug from name if name changed
      let finalSlug = existingProduct.p_slug;
      if (name.trim() !== existingProduct.p_name) {
        const slug = name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim("-");

        // Check if new slug already exists for other products
        let counter = 1;
        finalSlug = slug;
        while (true) {
          const duplicateSlug = await db("products")
            .where("p_slug", finalSlug)
            .where("p_user_id", userId)
            .where("p_id", "!=", productId)
            .first();
          
          if (!duplicateSlug) break;
          
          finalSlug = `${slug}-${counter}`;
          counter++;
        }
      }

      // Prepare product data for update
      const productData = {
        p_name: name.trim(),
        p_description: description.trim(),
        p_category: category,
        p_image_url: image?.trim() || null,
        p_status: status === "active" ? 1 : 0,
        p_featured: featured ? 1 : 0,
        p_slug: finalSlug,
        p_business_id: businessId || null,
        p_modified_at: new Date(),
      };

      // Update the product
      await db("products")
        .where("p_id", productId)
        .where("p_user_id", userId)
        .update(productData);

      // Handle tags
      let productTags: Tag[] = [];
      if (Array.isArray(tagNames) && tagNames.length > 0) {
        productTags = await ProductsController.createOrGetTags(tagNames, userId);
        const tagIds = productTags.map(tag => tag.id);
        await ProductsController.associateProductTags(Number(productId), tagIds);
      } else {
        // Remove all tags if no tags provided
        await ProductsController.associateProductTags(Number(productId), []);
      }

      // Fetch the updated product with proper field mapping
      const updatedProduct = await db("products")
        .select(
          "p_id as id",
          "p_name as name",
          "p_description as description",
          "p_category as category",
          "p_image_url as image",
          "p_status as status",
          "p_featured as featured",
          "p_slug as slug",
          "p_business_id as businessId",
          "p_created_at as createdAt",
          "p_modified_at as modifiedAt"
        )
        .where("p_id", productId)
        .first();

      // Format the response
      const formattedProduct = {
        ...updatedProduct,
        status: updatedProduct.status === 1 ? "active" : "inactive",
        featured: updatedProduct.featured === 1,
        image: updatedProduct.image || "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image",
        tags: productTags
      };

      return sendSuccess(
        res,
        { product: formattedProduct },
        "Product updated successfully"
      );
    } catch (error) {
      console.error("Update product error:", error);
      return sendError(res, 500, "Internal server error");
    }
  }

  /**
   * Delete a product (and its associated tags)
   */
  static async deleteProduct(req: Request, res: Response) {
    try {
      const productId = req.params.id;

      // Validate product ID
      if (!productId || isNaN(Number(productId))) {
        return sendError(res, 400, "Invalid product ID");
      }

      // Get user ID from request
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 401, "User authentication required");
      }

      // Check if product exists and belongs to user
      const existingProduct = await db("products")
        .where("p_id", productId)
        .where("p_user_id", userId)
        .first();

      if (!existingProduct) {
        return sendError(res, 404, "Product not found or access denied");
      }

      // Delete the product (cascade will handle product_tags deletion)
      await db("products")
        .where("p_id", productId)
        .where("p_user_id", userId)
        .del();

      return sendSuccess(
        res,
        { productId: Number(productId) },
        "Product deleted successfully"
      );
    } catch (error) {
      console.error("Delete product error:", error);
      return sendError(res, 500, "Internal server error");
    }
  }

  /**
   * Get a single product by ID with tags
   */
  static async getProductById(req: Request, res: Response) {
    try {
      const productId = req.params.id;

      // Validate product ID
      if (!productId || isNaN(Number(productId))) {
        return sendError(res, 400, "Invalid product ID");
      }

      // Get user ID from request
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 401, "User authentication required");
      }

      // Fetch the product
      const product = await db("products")
        .select(
          "p_id as id",
          "p_name as name",
          "p_description as description",
          "p_category as category",
          "p_image_url as image",
          "p_status as status",
          "p_featured as featured",
          "p_slug as slug",
          "p_business_id as businessId",
          "p_created_at as createdAt",
          "p_modified_at as modifiedAt"
        )
        .where("p_id", productId)
        .where("p_user_id", userId)
        .first();

      if (!product) {
        return sendError(res, 404, "Product not found or access denied");
      }

      // Get tags for this product
      const tags = await db("product_tags")
        .join("tags", "product_tags.pt_tag_id", "tags.t_id")
        .select(
          "tags.t_id as id",
          "tags.t_name as name",
          "tags.t_slug as slug"
        )
        .where("product_tags.pt_product_id", productId);

      // Format the response
      const formattedProduct = {
        ...product,
        status: product.status === 1 ? "active" : "inactive",
        featured: product.featured === 1,
        image: product.image || "https://placehold.co/600x400/e2e8f0/64748b?text=No+Image",
        tags: tags
      };

      return sendSuccess(
        res,
        { product: formattedProduct },
        "Product fetched successfully"
      );
    } catch (error) {
      console.error("Get product by ID error:", error);
      return sendError(res, 500, "Internal server error");
    }
  }

  /**
   * Get all user's tags
   */
  static async getUserTags(req: Request, res: Response) {
    try {
      // Get user ID from request
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 401, "User authentication required");
      }

      const tags = await db("tags")
        .select(
          "t_id as id",
          "t_name as name",
          "t_slug as slug",
          "t_created_at as createdAt"
        )
        .where("t_user_id", userId)
        .orderBy("t_name", "asc");

      return sendSuccess(
        res,
        { tags },
        "Tags fetched successfully"
      );
    } catch (error) {
      console.error("Get user tags error:", error);
      return sendError(res, 500, "Internal server error");
    }
  }
}
