import { parseKfgYaml } from '@/lib/kfgYaml';

import seedYaml from './eagle-claw-punos-directos.kfg.yaml?raw';

export const seedDocument = parseKfgYaml(seedYaml);
