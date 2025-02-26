import { Request, Response } from 'express';
import { Order } from '../modules/order/order.model';
import { ENUM_PAYMENT_STATUS } from '../utilities/enum';
import config from '../config';

const handleOrderPaymentSuccess = async (
  req: Request,
  res: Response,
  orderId: string,
  transactionId: string,
  amount: number,
) => {
  await Order.findByIdAndUpdate(orderId, {
    paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
  });

  // TODO: create transaction

  // then rediract
  return res.redirect(
    `${config.stripe.stripe_order_payment_success_url}?orderId=${orderId}&transaction_id=${transactionId}&amount=${amount}`,
  );
};

export default handleOrderPaymentSuccess;
