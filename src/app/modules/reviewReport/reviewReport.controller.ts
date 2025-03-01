import httpStatus from 'http-status';
import sendResponse from '../../utilities/sendResponse';
import ReviewReportService from './reviewReport.service';
import catchAsync from '../../utilities/catchasync';

const createReviewReport = catchAsync(async (req, res) => {
  const result = await ReviewReportService.createReviewReport(
    req.user.profileId,
    req.body,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Report submited',
    data: result,
  });
});

const ReviewReportController = {
  createReviewReport,
};

export default ReviewReportController;
