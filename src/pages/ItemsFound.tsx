import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Browse from './Browse';

const ItemsFound = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Set the item type to 'found' when component mounts
  React.useEffect(() => {
    if (!searchParams.has('type') || searchParams.get('type') !== 'found') {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('type', 'found');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return <Browse />;
};

export default ItemsFound; 