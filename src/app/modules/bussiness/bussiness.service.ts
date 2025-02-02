import { IBussiness } from './bussiness.interface';
import Bussiness from './bussiness.model';

const addBussinessInformation = async (
  profileId: string,
  payload: Partial<IBussiness>,
) => {
  const result = await Bussiness.findByIdAndUpdate(profileId, payload, {
    new: true,
    runValidators: true,
  });
  return result;
};

const BussinessService = {
  addBussinessInformation,
};

export default BussinessService;
