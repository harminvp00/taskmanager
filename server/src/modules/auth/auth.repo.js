
// User Model 
import User from "./auth.model.js";

/**
 * @param {string} email 
 * @returns a user if it is exits into the database otherwise null
 */
export const findByEmail = async (email) => {
  return await User.findOne({ email });
};

/**
 * @param {Object} payload 
 * @returns create a user document and save it into the database
 */
export const createUser = async (payload) => {
  return await User.create(payload);
};


/**
 * @param {ObjectId} id 
 * @param {Object} updates 
 * @returns return a updated user after finding it through id and updated the records
 */
export const updateUserById = async (id, updates) => {
  return await User.findByIdAndUpdate(id, updates, { new: true });
};

/** 
 * @param {string} tokenHash 
 * @returns user whihch token hash match, also date is not expired and refreshtoken is false.
 */
export const findUserByToken = async (tokenHash) => {
  return await User.findOne({
    resetToken: tokenHash,
    resetTokenExpiresAt: { $gt: Date.now() },
    resetTokenUsed: false,
  });
};

/**
 * @param {string} provider 
 * @param {number} providerId 
 * @returns return user if there is a user with providerID and provideName
 * @harminvp00 commented because this query is not useful for yet, but still here until we sure to remove this from entire project.
 */
// export const findOAuthUser = async (provider, providerId) => {
//   return await User.findOne({
//     provider,
//     providerId,
//   });
// };
