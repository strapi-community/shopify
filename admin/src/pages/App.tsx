import { usePluginTheme } from '@sensinum/strapi-utils';
import { DesignSystemProvider } from '@strapi/design-system';
import { Page } from '@strapi/strapi/admin';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Routes } from 'react-router-dom';

import { EditPage } from './Edit/Edit.page';
import { HomePage } from './Home/Home.page';
import { NewPage } from './New/New.page';

const queryClient = new QueryClient();

const App = () => {
  const theme = usePluginTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <DesignSystemProvider theme={theme}>
        <Routes>
          <Route index element={<HomePage />} />
          <Route path="/new" element={<NewPage />} />
          <Route path="/:id/edit" element={<EditPage />} />
          <Route path="*" element={<Page.Error />} />
        </Routes>
      </DesignSystemProvider>
    </QueryClientProvider>
  );
};

export { App };
