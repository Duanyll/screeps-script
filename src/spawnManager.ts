import * as Config from "config";

function getWorkerCreepPart(energy: number): boolean | BodyPartConstant[] {
    if (energy < 300) return false;
    let ret: BodyPartConstant[] = [];
    let groupOfPart = Math.floor((energy - 50) / 250);
    for (let i = 0; i < groupOfPart; i++) {
        ret.push(WORK);
    }
    ret.push(CARRY);
    for (let i = 0; i < groupOfPart; i++) {
        ret.push(CARRY);
    }
    for (let i = 0; i < groupOfPart; i++) {
        ret.push(MOVE);
        ret.push(MOVE);
    }
    return ret;
}

function getLowCapicityWorkerCreepPart(energy: number): boolean | BodyPartConstant[] {
    if (energy < 500) return false;
    let ret: BodyPartConstant[] = [];
    let groupOfPart = Math.floor((energy - 50) / 150);
    for (let i = 0; i < groupOfPart; i++) {
        ret.push(WORK);
    }
    ret.push(CARRY);
    for (let i = 0; i < groupOfPart; i++) {
        ret.push(MOVE);
    }
    return ret;
}

function spawnHarvest(source: Source, spawn: StructureSpawn, energy: number, hasLink: boolean): boolean {
    if (spawn.spawning) return false;
    const bodyPart = hasLink ? getLowCapicityWorkerCreepPart(energy) : getWorkerCreepPart(energy);
    if (bodyPart != false) {
        const creepName = `harv-${Game.time}-${source.id}`;
        const creepMemory: CreepMemory = {
            role: 'harvest', working: true, targetSource: source.id, room: spawn.room.name, workType: undefined
        };
        spawn.spawnCreep(bodyPart as BodyPartConstant[], creepName, { memory: creepMemory });
        Memory.hervesterForSource[source.id] = creepName;
        console.log(`Spawning creep ${creepName}`);
        return true;
    }
    return false;
}

function spawnWorker(spawn: StructureSpawn, energy: number): boolean {
    if (spawn.spawning) return false;
    const bodyPart = getWorkerCreepPart(energy);
    if (bodyPart != false) {
        const creepName = `work-${Game.time}-${spawn.id}`;
        const creepMemory: CreepMemory = {
            role: 'worker', working: false, targetSource: undefined, room: spawn.room.name, workType: undefined
        };
        spawn.spawnCreep(bodyPart as BodyPartConstant[], creepName, { memory: creepMemory });
        console.log(`Spawning creep ${creepName}`);
        return true;
    }
    return false;
}

function spawnUpgrader(spawn: StructureSpawn, energy: number): boolean {
    if (spawn.spawning) return false;
    const bodyPart = getLowCapicityWorkerCreepPart(energy);
    if (bodyPart != false) {
        const creepName = `upgr-${Game.time}-${spawn.id}`;
        const creepMemory: CreepMemory = {
            role: 'upgrader', working: false, targetSource: undefined, room: spawn.room.name, workType: undefined
        };
        spawn.spawnCreep(bodyPart as BodyPartConstant[], creepName, { memory: creepMemory });
        console.log(`Spawning creep ${creepName}`);
        return true;
    }
    return false;
}

export function spawnCreep(): void {
    if (Memory.hervesterForSource == undefined) {
        Memory.hervesterForSource = new Object();
    }
    for (const roomName in Game.rooms) {
        const room = Game.rooms[roomName];
        const spawns = room.find(FIND_MY_SPAWNS);
        const energy = room.energyAvailable;
        if (spawns.length > 0) {
            // 暂时只考虑1个spawn的情况
            const spawn = spawns[0];
            if (spawn.spawning) continue;
            let spawnedThisTick = false;

            // 补充harvest
            const sources = room.find(FIND_SOURCES);
            sources.forEach((source: Source) => {
                let hasLink = source.pos.findInRange(FIND_MY_STRUCTURES, 5, { filter: (structure: Structure) => { return structure.structureType == STRUCTURE_LINK; } }).length > 0;
                const harvID: string | undefined = Memory.hervesterForSource[source.id];
                if (harvID == undefined) {
                    if (spawnHarvest(source, spawn, energy, hasLink)) { spawnedThisTick = true; return; }
                } else {
                    const creep = Game.creeps[harvID];
                    if (creep == undefined || (creep.ticksToLive != undefined && creep.ticksToLive < 50)) {
                        // need to spawn a new creep
                        if (spawnHarvest(source, spawn, energy, hasLink)) { spawnedThisTick = true; return; }
                    } else {
                        console.log(`No need to spawn creep.`);
                    }
                }
            });

            if (spawnedThisTick) continue;
            // 补充upgrader
            const upgraders = room.find(FIND_MY_CREEPS, {
                filter: (creep: Creep) => { return creep.memory.role == 'upgrader' }
            });
            if (upgraders.length < 2) {
                if (spawnUpgrader(spawn, energy)) return;
            }
            // 补充worker
            const workers = room.find(FIND_MY_CREEPS, {
                filter: (creep: Creep) => { return creep.memory.role == 'worker' }
            });
            if (workers.length < 6) {
                spawnWorker(spawn, energy);
                return;
            }
        }
    }
}
