import React from 'react';
import { useSearchParams } from 'react-router-dom';
import Browse from './Browse';

const ItemsLost = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Set the item type to 'lost' when component mounts
  React.useEffect(() => {
    if (!searchParams.has('type') || searchParams.get('type') !== 'lost') {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('type', 'lost');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return <Browse />;
};

export default ItemsLost; 