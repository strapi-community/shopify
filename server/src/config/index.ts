import { schemaConfig } from './schema';

export default {
  default: {
    host: '',
  },
  validator(config: unknown) {
    const result = schemaConfig.safeParse(config);
    if (result.error && result.error.issues.length > 0) {
      throw new Error(result.error.issues.map((issue) => `Path: ${issue.path} -> ${issue.message}`).join('\n'));
    }
  },
};
