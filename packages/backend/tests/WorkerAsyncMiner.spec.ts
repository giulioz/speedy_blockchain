import { isValidBlock } from "@speedy_blockchain/common/dist/Blockchain";
import { utils } from "@speedy_blockchain/common";
import WorkerAsyncMiner from "../src/WorkerAsyncMiner";

const transactions: any = [
  {
    id: "AAAAAA",
    timestamp: 42,
    content: { a: "AAAAAA", b: "AAAAAA", c: "AAAAAA" },
  },
  {
    id: "BBBBBB",
    timestamp: 42,
    content: { a: "BBBBBB", b: "BBBBBB", c: "BBBBBB" },
  },
  {
    id: "CCCCCC",
    timestamp: 42,
    content: { a: "CCCCCC", b: "CCCCCC", c: "CCCCCC" },
  },
  {
    id: "DDDDDD",
    timestamp: 42,
    content: { a: "DDDDDD", b: "DDDDDD", c: "DDDDDD" },
  },
  {
    id: "EEEEEE",
    timestamp: 42,
    content: { a: "EEEEEE", b: "EEEEEE", c: "EEEEEE" },
  },
  {
    id: "FFFFFF",
    timestamp: 42,
    content: { a: "FFFFFF", b: "FFFFFF", c: "FFFFFF" },
  },
];

test("mining", async () => {
  const miner = new WorkerAsyncMiner();

  const mined = await miner.mine({
    index: 42,
    transactions: transactions,
    timestamp: 42,
    previousHash: "AAAAAA",
    nonce: 0,
  });

  const isMinedValid = isValidBlock(mined);
  expect(isMinedValid).toBe(true);

  miner.dispose();
});

test("mining difficulty 5", async () => {
  const difficulty = 5;

  const miner = new WorkerAsyncMiner(difficulty);

  const mined = await miner.mine({
    index: 42,
    transactions: transactions,
    timestamp: 42,
    previousHash: "AAAAAA",
    nonce: 0,
  });

  const isMinedValid = isValidBlock(mined, difficulty);
  expect(isMinedValid).toBe(true);

  miner.dispose();
}, 10000);

test("mining difficulty 4 busy", async () => {
  const difficulty = 4;

  const miner = new WorkerAsyncMiner(difficulty);

  const minedAPromise = miner.mine({
    index: 42,
    transactions: transactions,
    timestamp: 42,
    previousHash: "A",
    nonce: 0,
  });
  const minedBPromise = miner.mine({
    index: 42,
    transactions: transactions,
    timestamp: 42,
    previousHash: "B",
    nonce: 0,
  });

  expect(minedBPromise).rejects.toThrowError("WorkerAsyncMiner currently busy");

  const minedA = await minedAPromise;
  const isMinedValidA = isValidBlock(minedA, difficulty);
  expect(isMinedValidA).toBe(true);
  expect(minedA.previousHash).toBe("A");

  miner.dispose();
}, 15000);

test("mining difficulty 8 with abort after 100 ms", async () => {
  const difficulty = 8;

  const miner = new WorkerAsyncMiner(difficulty);

  const abortPromise = miner.mine({
    index: 42,
    transactions: transactions,
    timestamp: 42,
    previousHash: "A",
    nonce: 0,
  });

  await utils.sleep(100);

  miner.abort();
  expect(abortPromise).rejects.toThrowError("Aborted");

  miner.dispose();
}, 300);

test("mining difficulty 4 with new transactions", async () => {
  const difficulty = 4;

  const miner = new WorkerAsyncMiner(difficulty);

  const minedPromise = miner.mine({
    index: 42,
    transactions: transactions,
    timestamp: 42,
    previousHash: "AAAAAA",
    nonce: 0,
  });

  await utils.sleep(10);

  miner.notifyNewTransaction({
    id: "GGGGGG",
    timestamp: 42,
    content: { a: "GGGGGG", b: "GGGGGG", c: "GGGGGG" },
  } as any);

  const mined = await minedPromise;

  const isMinedValid = isValidBlock(mined, difficulty);
  expect(isMinedValid).toBe(true);
  expect(mined.transactions.length).toBe(transactions.length);
  expect(mined.transactions[mined.transactions.length - 1].id).toBe("GGGGGG");

  miner.dispose();
}, 10000);

test("mining difficulty 4 with new transactions after finished", async () => {
  const difficulty = 4;

  const miner = new WorkerAsyncMiner(difficulty);

  const minedPromise = miner.mine({
    index: 42,
    transactions: transactions,
    timestamp: 42,
    previousHash: "AAAAAA",
    nonce: 0,
  });

  await utils.sleep(10);
  miner.notifyNewTransaction({
    id: "GGGGGG",
    timestamp: 42,
    content: { a: "GGGGGG", b: "GGGGGG", c: "GGGGGG" },
  } as any);

  await utils.sleep(1000);
  const added2 = miner.notifyNewTransaction({
    id: "HHHHHH",
    timestamp: 42,
    content: { a: "HHHHHH", b: "HHHHHH", c: "HHHHHH" },
  } as any);

  const mined = await minedPromise;

  const isMinedValid = isValidBlock(mined, difficulty);
  expect(isMinedValid).toBe(true);
  expect(mined.transactions.length).toBe(transactions.length);
  expect(mined.transactions[mined.transactions.length - 1].id).toBe("GGGGGG");
  expect(added2).toBe(false);

  miner.dispose();
}, 20000);
