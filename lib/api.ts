//API functions
export const setTeacherProfile = async (userId: string, profileData: any) => {
  console.log(`Setting teacher profile for user ${userId}`, profileData);
  return { success: true, message: 'Profile updated successfully' };
};

export const setRole = async (userId: string, roleData: { role: string }) => {
  console.log(`Setting role for user ${userId}`, roleData);
  return { success: true, redirectUrl: null };
};