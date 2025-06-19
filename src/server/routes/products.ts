import { Router } from "express";
import { ProductsController } from "../controllers/products.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

router.get("/", ProductsController.getProducts);

// Tags routes (must come before /:id route)
router.get("/tags/all", ProductsController.getUserTags);

router.get("/:id", ProductsController.getProductById);

router.post("/", ProductsController.createProduct);

router.put("/:id", ProductsController.updateProduct);

router.delete("/:id", ProductsController.deleteProduct);

export default router;
