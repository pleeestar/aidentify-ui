'use client';

import React from 'react';

const CustomButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button onClick={onClick}>
      <img src="/customButton.svg" />
    </button>
  );
};

export default CustomButton;