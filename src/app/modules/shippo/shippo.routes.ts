import express from 'express';
import ShippoController from './shippo.controller';

const router = express.Router();

router.post('/get-shipping-methods', ShippoController.getShippingMethods);
router.post(
  '/get-shipping-rates',
  ShippoController.getShippingRatesForCheckout,
);

export const shippoRoutes = router;
