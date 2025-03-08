import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import { PLUGIN_ID } from '../pluginId';

const paramsSchema = z.object({
  id: z
    .string()
    .optional()
    .transform((id) => (id ? Number(id) : undefined)),
});

export const useAdminNavigation = () => {
  const navigate = useNavigate();
  const params = paramsSchema.parse(useParams());

  return useMemo(
    () => ({
      goToNew() {
        navigate(`/plugins/${PLUGIN_ID}/new`);
      },

      goToEdit(id: number) {
        navigate(`/plugins/${PLUGIN_ID}/${id}/edit`);
      },

      params,
    }),
    [navigate]
  );
};
