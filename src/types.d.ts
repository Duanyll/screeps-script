// example declaration file - remove these and add your own custom typings

interface CreepMemory {
  role: string;
  room: string;
  working: boolean;
  targetSource: string | undefined;
}

interface Memory {
  uuid: number;
  log: any;
  sourceAllocatedCount: Map<string, number>;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}
