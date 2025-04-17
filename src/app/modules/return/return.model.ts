import mongoose, { Schema, Document } from 'mongoose';
import { IReturn } from './return.interface'; // Import the interface
import { ENUM_RETURN_METHOD, ENUM_RETURN_STATUS } from './return.enum'; // Enum imports
import { ENUM_REF_TYPE } from '../../utilities/enum';
import { OrderItemSchema } from '../order/order.model';

// Define the schema for IReturn model
const returnSchema: Schema = new Schema<IReturn>(
  {
    bussiness: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ENUM_REF_TYPE.BUSSINESS,
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ENUM_REF_TYPE.REVIEWER,
      required: true,
    },
    items: { type: [OrderItemSchema], required: true },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ENUM_REF_TYPE.ORDER,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    totalReturnAmount: {
      type: Number,
    },
    returnMethod: {
      type: String,
      enum: Object.values(ENUM_RETURN_METHOD),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ENUM_RETURN_STATUS),
      required: true,
    },
    refundTransactionId: {
      type: String,
      default: null,
    },
    refundDate: {
      type: Date,
      default: null,
    },
    returnReason: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

const Return = mongoose.model<IReturn & Document>('Return', returnSchema);

export default Return;
