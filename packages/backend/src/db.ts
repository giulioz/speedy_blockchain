import fs from "fs";
import path from "path";
import level from "level";
import { Block } from "@speedy_blockchain/common";

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
}

export async function insert(block: Block): Promise<void> {
  return db.put(block.index, JSON.stringify(block));
}

export async function getBlock(index: number): Promise<Block> {
  return db.get(index);
}

export async function fetchAll(): Promise<{ key: string; value: Block }[]> {
  return new Promise((resolve, reject) => {
    const blocks: { key: string; value: Block }[] = [];

    db.createReadStream()
      .on("data", ({ key, value }: { key: string; value: string }) => {
        blocks.push({ key, value: JSON.parse(value) });
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
  // close db.
  await db.close();

  await new Promise(resolve =>
    // delete file.
    fs.rmdir(db.minerDataPath, resolve)
  );

  await initDB(db.minerName);
}

export async function rebase(blocks: Block[]) {
  await deleteAll();
  await insertAll(blocks);
}
