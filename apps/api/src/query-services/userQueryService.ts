import { userRepository } from '../repositories/userRepository';

export const userQueryService = {
  upsertUserByClerkId: userRepository.upsertByClerkId,
  deleteUserByClerkId: userRepository.deleteByClerkId,
};
