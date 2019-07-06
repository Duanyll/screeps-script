// example declaration file - remove these and add your own custom typings

declare enum CreepRole {
  Harvest,
  Build,
  Upgarde
}

interface CreepMemory {
  role: CreepRole;
  room: string;
  working: boolean;
}

interface Memory {
  uuid: number;
  log: any;
}

// `global` extension samples
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}
