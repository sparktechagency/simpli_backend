import httpStatus from 'http-status';
import catchAsync from '../../utilities/catchasync';
import sendResponse from '../../utilities/sendResponse';
import StoreService from './store.service';

const createStore = catchAsync(async (req, res) => {
  const result = await StoreService.createStore(req.user.profileId, req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Store created successfully',
    data: result,
  });
});
const updateStore = catchAsync(async (req, res) => {
  const result = await StoreService.updateStoreIntoDB(
    req.user.profileId,
    req.params.id,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Store updated successfully',
    data: result,
  });
});

const StoreController = {
  createStore,
  updateStore,
};

export default StoreController;
