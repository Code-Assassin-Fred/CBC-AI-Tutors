import React from 'react';
import Link from 'next/link';

const BackToRoleSelection = () => {
  return (
    <Link
      href="/onboarding/choose-role"
      className="text-blue-500 hover:underline"
    >
      Back to Role Selection
    </Link>
  );
};

export default BackToRoleSelection;