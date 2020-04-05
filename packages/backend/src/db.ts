import fs from "fs";
import path from "path";
import level from "level";
import { Block } from "@speedy_blockchain/common";

export interface MetaInfo {
  blockLength: number;
}
const META_KEY = "META";

let _meta = {blockLength: 0};
let db: any = null;
function createFolder(folder: string) {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
}

export async function initDB(minerName: string) {
  const globalDataPath = path.resolve(__dirname, "blockchain_data");
  createFolder(globalDataPath);
  const minerDataPath = path.resolve(globalDataPath, minerName);
  createFolder(minerDataPath);

  db = level(minerDataPath);
  db.minerDataPath = minerDataPath;
  await upgradeProcess();
}

async function upgradeProcess() {
  // check if there is already a meta block
  if (await tryGetMeta()) {
    return;
  }

  console.log("No meta block! Adding a new one");
  const allBlocks = await fetchAllBlocks();
  const blockLength = allBlocks.length;
  const meta = { blockLength };
  await saveMeta(meta);
}

export async function insert(block: Block): Promise<void> {
  return db.put(block.index, JSON.stringify(block));
}

export async function getBlock(index: number): Promise<Block> {
  return JSON.parse(await db.get(index));
}

export async function getMeta(): Promise<MetaInfo> {
  try {
    return await JSON.parse(await db.get(META_KEY));
  } catch (e) {
    throw new Error("No meta block! " + e);
  }
}

export async function tryGetMeta(): Promise<MetaInfo | null> {
  try {
    const meta = await getMeta();
    _meta = meta;
    return await getMeta();
  } catch (e) {
    return null;
  }
}

export async function saveMeta(meta: MetaInfo): Promise<MetaInfo> {
  _meta = meta;
  return db.put(META_KEY, JSON.stringify(meta));
}

export async function fetchAllBlocks(): Promise<
  { key: string; value: Block }[]
> {
  return new Promise((resolve, reject) => {
    const blocks: { key: string; value: Block }[] = [];

    db.createReadStream()
      .on("data", ({ key, value }: { key: string; value: string }) => {
        if (key !== META_KEY) {
          blocks.push({ key, value: JSON.parse(value) });
        }
      })
      .on("end", () => {
        // key is the same as value.index.
        // sort the block in ascending order.

        // log only for test
        console.log(`[DB] read ${blocks.length} blocks.`);
        let count = 0;
        blocks.forEach(block => {
          count += block.value.transactions.length;
        });
        console.log(`[DB] Total transactions: ${count}`);

        blocks.sort(
          (block1, block2) => block1.value.index - block2.value.index
        );
        resolve(blocks);
      })
      .on("error", (err: any) => {
        reject(err);
      });
  });
}

export async function insertAll(blocks: Block[]): Promise<void> {
  for (let index = 0; index < blocks.length; index++) {
    await insert(blocks[index]);
  }
}

export async function deleteAll() {
  // close db
  await db.close();

  await new Promise(resolve =>
    // delete file
    fs.rmdir(db.minerDataPath, resolve)
  );

  await initDB(db.minerName);
}

export async function rebase(blocks: Block[]) {
  await deleteAll();
  await insertAll(blocks);
}

export class blockchainIterator {
  [Symbol.iterator](){
    let blockIndex = 0;
    let dummyBlock: Block;
    const iterator = {
        next() {
            blockIndex ++;
            if (blockIndex < _meta.blockLength) {
              let block = getBlock(blockIndex); 
              return {value: block, done: false};
            } else {
              return {value: dummyBlock, done: true};
            }
        }
    };
    return iterator;
  }
 }
