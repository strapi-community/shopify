import { MemoryEngine, PluginConfig, RedisEngine } from '../config/schema';

export const isRedisEngine = (config: PluginConfig): config is RedisEngine => {
  return config.engine === 'redis';
};
export const isMemoryEngine = (config: PluginConfig): config is MemoryEngine => {
  return config.engine === 'memory';
};
