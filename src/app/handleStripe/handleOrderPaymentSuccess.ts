/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Order } from '../modules/order/order.model';
import { ENUM_PAYMENT_STATUS } from '../utilities/enum';
const handleOrderPaymentSuccess = async (
  orderId: string,
  transactionId: string,
  amount: number,
) => {
  await Order.findByIdAndUpdate(orderId, {
    paymentStatus: ENUM_PAYMENT_STATUS.SUCCESS,
  });

  // TODO: create transaction
};

export default handleOrderPaymentSuccess;
