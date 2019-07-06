export function getSource(room: Room): Source {
    // if (Memory.sourceAllocatedCount == undefined) {
    //     Memory.sourceAllocatedCount = new Map<string, number>();
    // }
    // const sources = room.find(FIND_SOURCES);
    // let minID = -1, minCount = Number.MAX_SAFE_INTEGER;
    // for (let i = 0; i < sources.length; i++) {
    //     if (!Memory.sourceAllocatedCount.get(sources[i].id)) {
    //         Memory.sourceAllocatedCount.set(sources[i].id, 0);
    //     }
    //     if (Memory.sourceAllocatedCount.get(sources[i].id) as number < minCount) {
    //         minCount = Memory.sourceAllocatedCount.get(sources[i].id) as number;
    //         minID = i;
    //     }
    // }
    // Memory.sourceAllocatedCount.set(sources[minID].id, minCount + 1);
    // return sources[minID];
    return room.find(FIND_SOURCES)[Math.floor(Math.random() * 2)];
}

export function arriveAtSource(source: Source): void {
    // if (Memory.sourceAllocatedCount == undefined) {
    //     Memory.sourceAllocatedCount = new Map<string, number>();
    // }
    // Memory.sourceAllocatedCount.set(source.id, Memory.sourceAllocatedCount.get(source.id) as number - 1);
}
