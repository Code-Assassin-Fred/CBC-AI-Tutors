import React from 'react';
import { useRouter } from 'next/navigation';

const BackToRoleSelection = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push('/onboarding/choose-role');
  };

  return (
    <button
      onClick={handleBack}
      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Back to Role Selection
    </button>
  );
};

export default BackToRoleSelection;