// example declaration file - remove these and add your own custom typings

interface CreepMemory {
  role: string;
  room: string;
  working: boolean;
  targetSource: string | undefined;
  workType: any
}

interface Memory {
  uuid: number;
  log: any;
  status: any;
  hervesterForSource: any;
  [str: string]: any;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}
