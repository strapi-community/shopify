import { Main } from '@strapi/design-system';

import { useEffect } from 'react';
import { useShops } from '../../hooks/listShops.hook';
import { useAdminNavigation } from '../../hooks/navigation.hook';

const HomePage = () => {
  const { data: shops } = useShops();
  const { goToEdit, goToNew } = useAdminNavigation();

  useEffect(() => {
    if (shops) {
      const id = shops[0]?.id;

      if (id) {
        goToEdit(id);
      } else {
        goToNew();
      }
    }
  }, [shops]);

  return <Main></Main>;
};

export { HomePage };
