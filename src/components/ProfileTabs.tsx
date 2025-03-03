
import React from 'react';

interface ProfileTabsProps {
  userProducts: any[];
  userPosts: any[];
  isLoading: boolean;
}

const ProfileTabs = ({ userProducts, userPosts, isLoading }: ProfileTabsProps) => {
  return (
    <div>
      <p>Profile Tabs Placeholder</p>
    </div>
  );
};

export default ProfileTabs;
