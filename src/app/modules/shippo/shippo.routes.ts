import express from 'express';
import ShippoController from './shippo.controller';

const router = express.Router();

router.post('/get-shipping-methods', ShippoController.getShippingMethods);

export const shippoRoutes = router;
