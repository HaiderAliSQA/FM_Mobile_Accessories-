// backend/src/routes/products.ts
import { Router, Request, Response } from 'express';
import slugify from 'slugify';
import Product, { IProduct } from '../models/Product';
import authMiddleware from '../middleware/authMiddleware';
import { cloudinary } from '../config/cloudinary';

const router = Router();

// Helper: build public query (visible and not discontinued)
const publicQuery = {
  isVisible: true,
  isDiscontinued: false,
};

// GET /api/products - PUBLIC with filters and pagination
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      size,
      color,
      minPrice,
      maxPrice,
      search,
      featured,
      newArrival,
      page = '1',
      limit = '12',
      sortBy = 'newest',
    } = req.query as Record<string, string | undefined>;

    const filter: Record<string, any> = { ...publicQuery };

    // Category filter must be exact match, case-insensitive
    if (category) {
      filter.category = category.toLowerCase().trim();
    }

    // Also ensure isVisible filter is applied
    filter.isVisible = true;
    filter.isDiscontinued = { $ne: true };

    if (size) {
      const sizeNum = parseInt(size, 10);
      if (!isNaN(sizeNum)) {
        filter['sizes'] = {
          $elemMatch: { size: sizeNum, isBlocked: false },
        };
      }
    }

    if (color) {
      filter['colors'] = { $in: [new RegExp(color, 'i')] };
    }

    if (minPrice || maxPrice) {
      const priceQuery: Record<string, number> = {};
      if (minPrice) priceQuery['$gte'] = parseFloat(minPrice);
      if (maxPrice) priceQuery['$lte'] = parseFloat(maxPrice);
      filter['price'] = priceQuery;
    }

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { compatibleModels: { $in: [searchRegex] } },
        { tags: { $in: [searchRegex] } },
      ];
    }

    if (featured === 'true') {
      filter['isFeatured'] = true;
    }

    if (newArrival === 'true') {
      filter['isNewArrival'] = true;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(48, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
    };
    const sortQuery = sortMap[sortBy] ?? sortMap['newest']!;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortQuery).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(filter),
    ]);

    const pages = Math.ceil(total / limitNum);

    res.status(200).json({
      success: true,
      data: {
        products,
        total,
        pages,
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch products',
      error: (error as Error).message,
    });
  }
});

// GET /api/products/featured - PUBLIC
router.get('/featured', async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({
      ...publicQuery,
      isFeatured: true,
    })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured products',
      error: (error as Error).message,
    });
  }
});

// GET /api/products/new-arrivals - PUBLIC
router.get('/new-arrivals', async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({
      ...publicQuery,
      isNewArrival: true,
    })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch new arrivals',
      error: (error as Error).message,
    });
  }
});

// GET /api/products/admin/all - ADMIN ONLY
router.get('/admin/all', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      search,
      category,
    } = req.query as Record<string, string | undefined>;

    const query: Record<string, unknown> = {};

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { compatibleModels: { $in: [searchRegex] } },
        { tags: { $in: [searchRegex] } },
      ];
    }

    if (category) {
      query['category'] = category;
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum).lean(),
      Product.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        products,
        total,
        pages: Math.ceil(total / limitNum),
        currentPage: pageNum,
        limit: limitNum,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin products',
      error: (error as Error).message,
    });
  }
});

// GET /api/products/admin/low-stock - ADMIN ONLY
router.get('/admin/low-stock', authMiddleware, async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await Product.find({ stock: { $lte: 10 } })
      .sort({ stock: 1 })
      .lean();

    res.status(200).json({
      success: true,
      data: products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch low stock products',
      error: (error as Error).message,
    });
  }
});

// GET /api/products/admin/:id - ADMIN ONLY — single product by MongoDB _id
router.get('/admin/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const product = await Product.findById(id).lean();

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: (error as Error).message,
    });
  }
});

// GET /api/products/:slug - PUBLIC — single product by slug
router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params as { slug: string };

    const product = await Product.findOne({
      slug,
      isDiscontinued: false,
    }).lean();

    if (!product) {
      res.status(404).json({
        success: false,
        message: 'Product not found',
      });
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch product',
      error: (error as Error).message,
    });
  }
});

// POST /api/products - ADMIN ONLY
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      description,
      price,
      compareAtPrice,
      category,
      sizes,
      colors,
      images,
      stock,
      isFeatured,
      isNewArrival,
      isVisible,
      tags,
      brand,
      compatibleModels,
    } = req.body as Partial<IProduct>;

    if (!name || !description || price === undefined || !category) {
      res.status(400).json({
        success: false,
        message: 'Name, description, price, and category are required',
      });
      return;
    }

    // Generate unique slug
    const baseSlug = slugify(name, { lower: true, strict: true, trim: true });
    let slug = baseSlug;
    let counter = 1;
    while (await Product.exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const product = new Product({
      name,
      slug,
      description,
      price,
      compareAtPrice: compareAtPrice ?? undefined,
      category,
      sizes: sizes ?? [],
      colors: colors ?? [],
      images: images ?? [],
      stock: stock ?? 0,
      isFeatured: isFeatured ?? false,
      isNewArrival: isNewArrival ?? false,
      isVisible: isVisible !== undefined ? isVisible : true,
      tags: tags ?? [],
      brand: brand ?? '',
      compatibleModels: compatibleModels ?? [],
    });

    await product.save();

    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create product',
      error: (error as Error).message,
    });
  }
});

// PUT /api/products/:id - ADMIN ONLY
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const updateData = req.body as Partial<IProduct>;

    // If name is being updated, regenerate slug
    if (updateData.name) {
      const baseSlug = slugify(updateData.name, { lower: true, strict: true, trim: true });
      let slug = baseSlug;
      let counter = 1;
      while (await Product.exists({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.slug = slug;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update product',
      error: (error as Error).message,
    });
  }
});

// PATCH /api/products/:id/visibility - ADMIN ONLY
router.patch('/:id/visibility', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    product.isVisible = !product.isVisible;
    await product.save();

    res.status(200).json({
      success: true,
      data: { id: product._id.toString(), isVisible: product.isVisible },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle visibility',
      error: (error as Error).message,
    });
  }
});

// PATCH /api/products/:id/discontinue - ADMIN ONLY
router.patch('/:id/discontinue', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    product.isDiscontinued = !product.isDiscontinued;
    if (product.isDiscontinued) {
      product.isVisible = false;
    }
    await product.save();

    res.status(200).json({
      success: true,
      data: {
        id: product._id.toString(),
        isDiscontinued: product.isDiscontinued,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle discontinued status',
      error: (error as Error).message,
    });
  }
});

// PATCH /api/products/:id/featured - ADMIN ONLY
router.patch('/:id/featured', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    product.isFeatured = !product.isFeatured;
    await product.save();

    res.status(200).json({
      success: true,
      data: { id: product._id.toString(), isFeatured: product.isFeatured },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle featured status',
      error: (error as Error).message,
    });
  }
});

// PATCH /api/products/:id/sizes/:sizeValue/block - ADMIN ONLY
router.patch('/:id/sizes/:sizeValue/block', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, sizeValue } = req.params as { id: string; sizeValue: string };
    const sizeNum = parseInt(sizeValue, 10);

    if (isNaN(sizeNum)) {
      res.status(400).json({ success: false, message: 'Invalid size value' });
      return;
    }

    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    const sizeEntry = product.sizes.find((s) => s.size === sizeNum);

    if (!sizeEntry) {
      res.status(404).json({ success: false, message: 'Size not found on this product' });
      return;
    }

    sizeEntry.isBlocked = !sizeEntry.isBlocked;
    await product.save();

    res.status(200).json({
      success: true,
      data: { id: product._id.toString(), sizes: product.sizes },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to toggle size block',
      error: (error as Error).message,
    });
  }
});

// PATCH /api/products/:id/stock - ADMIN ONLY — update stock quantity
router.patch('/:id/stock', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { stock } = req.body as { stock: number };

    if (stock === undefined || stock === null) {
      res.status(400).json({ success: false, message: 'stock field is required' });
      return;
    }

    const stockNum = Number(stock);
    if (isNaN(stockNum) || stockNum < 0) {
      res.status(400).json({ success: false, message: 'Stock must be a non-negative number' });
      return;
    }

    const product = await Product.findByIdAndUpdate(
      id,
      { $set: { stock: stockNum } },
      { new: true, runValidators: true }
    );

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: { id: product._id.toString(), stock: product.stock },
      message: `Stock updated to ${stockNum}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update stock',
      error: (error as Error).message,
    });
  }
});

// DELETE /api/products/:id - ADMIN ONLY
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const product = await Product.findById(id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Delete all associated Cloudinary images
    const deletePromises = product.images.map(async (imageUrl) => {
      try {
        // Extract publicId from Cloudinary URL
        const urlParts = imageUrl.split('/');
        const folderIndex = urlParts.findIndex((p) => p === 'fmmobile');
        if (folderIndex !== -1) {
          const publicIdParts = urlParts.slice(folderIndex);
          const lastPart = publicIdParts[publicIdParts.length - 1] ?? '';
          const publicId = publicIdParts.slice(0, -1).join('/') + '/' + lastPart.split('.')[0];
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (imgErr) {
        console.warn('Failed to delete Cloudinary image:', (imgErr as Error).message);
      }
    });

    await Promise.allSettled(deletePromises);
    await Product.findByIdAndDelete(id);

    res.status(200).json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete product',
      error: (error as Error).message,
    });
  }
});

export default router;
