import { PremiereAdapter } from './PremiereAdapter';
import type { HostAdapter } from './HostAdapter';

export const hostAdapter: HostAdapter = new PremiereAdapter();
