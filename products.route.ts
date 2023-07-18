import { Router } from 'express';
import BrandController from './products.controller'
const router = Router();

const middleware = (req: any, res: any, next: any) => {
    req.url = "https://www.gsmarena.com/";
    next()
}

router.get('/v1/brandname', middleware, BrandController.getAllBrandNames);
router.post('/v1/getdevicebybrand', middleware, BrandController.getProductsByBrand);
router.get('/v1/getdetails', middleware, BrandController.getProductsDetails);

export default router;