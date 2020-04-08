import { v4 as uuidv4 } from "uuid";

import {
  Peer,
  Transaction,
  utils,
  Block,
  CarrierRequest,
  FlightsRequest,
  Flight,
  CarrierData,
  RouteData,
  RouteRequest,
  UnhashedBlock,
  isValidBlock,
  createGenesisBlock,
  config,
} from "@speedy_blockchain/common";
import { IncomingPeer } from "@speedy_blockchain/common/src/Peer";

import Mutex from "./Mutex";
import SimpleAsyncMiner from "./SimpleAsyncMiner";
import WorkerAsyncMiner from "./WorkerAsyncMiner";
import * as db from "./db";
import * as NodeCommunication from "./NodeCommunication";

const miningTimeoutTime = 5000;
const commTimeoutTime = 5000;

// Manages the blockchain, mining and communication with peers
export default class Node {
  unconfirmedTransactions: Transaction[] = [];
  blocksCount: number = 0;
  transactionCount: number = 0;

  public peers: Peer[] = [];

  private miningTimeout: NodeJS.Timeout | null = null;
  private commTimeout: NodeJS.Timeout | null = null;

  miner = new SimpleAsyncMiner();

  private addMutex = new Mutex();

  public async initCommunication() {
    let retry = 0;

    while (retry < 3) {
      await NodeCommunication.announcement(this.peers);
      await this.refreshPeers();

      const done = await NodeCommunication.initialBlockDownload(this);
      const nTransactions = await this.checkChainValidity(this.blocksCount);
      if (nTransactions === false) {
        throw new Error("Downloaded chain invalid!");
      }

      this.transactionCount = nTransactions;

      if (!done) {
        console.warn("Retriyng...");
        retry += 1;
        await utils.sleep(1000);
      } else {
        return;
      }
    }

    console.warn(
      "No peer to perform IBD after several retries. Assuming master node..."
    );
  }

  public async rehydrateBlocksFromDB() {
    const meta = await db.getMeta();
    this.blocksCount = meta.blockLength;

    if (meta.blockLength > 0) {
      // Validate the chain
      const nTransactions = await this.checkChainValidity(meta.blockLength);

      if (nTransactions === false) {
        throw new Error("Invalid replacement chain!");
      }

      this.transactionCount = nTransactions;
    } else {
      console.log("Empty chain, adding genesis block");
      this.addBlock(createGenesisBlock());
    }
  }

  async checkChainValidity(blockLength: number) {
    let result = true;
    let previousHash = "0";

    let transactionCount = 0;

    for (let index = 0; index < blockLength; index++) {
      const block = await this.tryFindBlockById(index);
      if (
        !block ||
        !isValidBlock(block) ||
        previousHash !== block.previousHash
      ) {
        // result = false;

        // Early Exit
        return false;
      }

      transactionCount += block.transactions.length;

      previousHash = block.hash;
    }

    return result ? transactionCount : false;
  }

  public async getLastBlock() {
    if (this.blocksCount === 0) {
      return createGenesisBlock();
    }

    return this.tryFindBlockById(this.blocksCount - 1);
  }

  async findBlockById(blockId: Block["index"]) {
    if (blockId < 0) {
      throw new Error("Invalid index < 0");
    } else if (blockId > this.blocksCount) {
      throw new Error(
        `Invalid index ${blockId} > blocksCount (${this.blocksCount})`
      );
    }

    return db.getBlock(blockId);
  }

  async tryFindBlockById(blockId: Block["index"]) {
    if (blockId < 0 || blockId >= this.blocksCount) {
      return null;
    }

    try {
      return await db.getBlock(blockId);
    } catch (e) {
      return null;
    }
  }

  async getBlocksRange(startId: number, endId: number) {
    const startClamped = Math.max(0, startId);
    const endClamped = Math.min(this.blocksCount - 1, endId);

    return Promise.all(
      new Array(endClamped - startClamped + 1)
        .fill(0)
        .map((e, i) => this.findBlockById(i + startClamped))
    );
  }

  async findTransactionById(
    transactionId: Transaction["id"],
    blockId: Block["index"] | null = null
  ): Promise<Transaction | null> {
    // We already have the block id (overload)
    if (blockId !== null) {
      const block = await this.findBlockById(blockId);

      if (block) {
        const transaction = block.transactions.find(
          t => t.id === transactionId
        );
        return transaction || null;
      }

      return null;
    }

    // We don't have the block id, search on anything
    const transaction = await Promise.race(
      new Array(this.blocksCount).map(async (trash, i) => {
        const block = await this.findBlockById(i);
        const transaction = block.transactions.find(
          t => t.id === transactionId
        );

        if (transaction) {
          return transaction;
        }

        Promise.reject();
      })
    );

    return transaction || null;
  }

  public async addBlock(block: Block, unchecked = false) {
    console.log(`Adding new block #${block.index}:${block.hash}`);

    let unlock = await this.addMutex.lock();

    if (!isValidBlock(block)) {
      console.warn(`Trying to add an invalid block, aborting`);
      unlock();
      return false;
    }

    const alreadyExistsBlock = await this.tryFindBlockById(block.index);

    if (
      !unchecked &&
      alreadyExistsBlock &&
      alreadyExistsBlock.timestamp >= block.timestamp
    ) {
      console.warn(`Adding block older than existing, aborting`);
      unlock();
      return false;
    }

    // remove from unconfirmedTransactions the transactions of the block
    this.unconfirmedTransactions = this.unconfirmedTransactions.filter(
      tr => !block.transactions.find(t => t.id === tr.id)
    );

    // ...and remove also from the miner
    this.miner.notifyTransactionsRemoved(block.transactions);

    // update transactionCount
    if (alreadyExistsBlock) {
      this.transactionCount -= alreadyExistsBlock.transactions.length;
    }
    this.transactionCount += block.transactions.length;

    await db.insert(block);

    if (!alreadyExistsBlock) {
      this.blocksCount = block.index + 1;
      await db.saveMeta({ blockLength: block.index + 1 });
    }

    unlock();

    return true;
  }

  public async pushTransaction(transaction: Transaction) {
    const insertedInMining = this.miner.notifyNewTransaction(transaction);
    if (insertedInMining) {
      // PERF: consider not awaiting
      await NodeCommunication.announceTransaction(this.peers, transaction);

      return true;
    }

    const notPresentInUnconfirmed = !this.unconfirmedTransactions.find(
      t => t.id === transaction.id
    );
    if (notPresentInUnconfirmed) {
      this.unconfirmedTransactions.push(transaction);

      // PERF: consider not awaiting
      await NodeCommunication.announceTransaction(this.peers, transaction);

      return true;
    }

    return false;
  }

  public async pushTransactionContent(content: Transaction["content"]) {
    const transaction: Transaction = {
      id: uuidv4(),
      timestamp: utils.getTimestamp(),
      content,
    };

    const inserted = await this.pushTransaction(transaction);

    if (inserted) {
      await NodeCommunication.announceTransaction(this.peers, transaction);
    }
  }

  public async queryCarrier(query: CarrierRequest): Promise<CarrierData> {
    const returnObj: CarrierData = {
      OP_CARRIER_AIRLINE_ID: query.OP_CARRIER_AIRLINE_ID,
      AVERAGE_DELAY: 0,
      MAX_DELAY: -99999999,
      MIN_DELAY: 99999999,
      TOTAL_NUMBER_OF_FLIGHTS: 0,
      DELAYED_FLIGHTS: 0,
      FLIGHTS_IN_ADVANCE: 0, // TOTAL_NUMBER_OF_FLIGHTS - DELAYED_FLIGHTS - FLIGHTS THAT HAS ARRIVED RIGHT
    };

    const dateTo = query.DATE_TO;
    const dateFrom = query.DATE_FROM;
    let delaySum = 0;
    await Promise.all(
      Array.from(new db.BlockchainIterator(this.blocksCount))
    ).then(blocks =>
      blocks.forEach(block =>
        block.transactions.forEach(transaction => {
          const insideTime =
            transaction.content.FL_DATE >= dateFrom &&
            transaction.content.FL_DATE <= dateTo;

          const sameAirline =
            transaction.content.OP_CARRIER_AIRLINE_ID ===
            query.OP_CARRIER_AIRLINE_ID;

          if (insideTime && sameAirline) {
            returnObj.TOTAL_NUMBER_OF_FLIGHTS += 1;

            const delay = Number(transaction.content.ARR_DELAY);
            delaySum += delay;
            if (delay > returnObj.MAX_DELAY) {
              returnObj.MAX_DELAY = delay;
            }
            if (delay < returnObj.MIN_DELAY) {
              returnObj.MIN_DELAY = delay;
            }

            if (delay > 0) {
              returnObj.DELAYED_FLIGHTS += 1;
            } else if (delay < 0) {
              returnObj.FLIGHTS_IN_ADVANCE += 1;
            }
          }
        })
      )
    );
    returnObj.AVERAGE_DELAY = delaySum / returnObj.TOTAL_NUMBER_OF_FLIGHTS;
    return returnObj;
  }

  public async queryFlights(query: FlightsRequest): Promise<Flight[]> {
    const queryResult: Flight[] = [];
    await Promise.all(
      Array.from(new db.BlockchainIterator(this.blocksCount))
    ).then(blocks =>
      blocks.forEach(block =>
        block.transactions.forEach(transaction => {
          if (
            query.OP_CARRIER_FL_NUM === transaction.content.OP_CARRIER_FL_NUM &&
            query.FL_DATE === transaction.content.FL_DATE
          ) {
            queryResult.push(transaction.content);
          }
        })
      )
    );
    return queryResult;
  }

  public async queryRoute(query: RouteRequest): Promise<RouteData> {
    // QUERY: DATE_TO, DATE_FROM, CITY_A, CITY_B
    // DATE_TO and DATE_FROM could be  not mandatory.
    const queryResult: Flight[] = [];
    const dateTo = query["DATE_TO"];
    const dateFrom = query["DATE_FROM"];
    const cityA = query["CITY_A"];
    const cityB = query["CITY_B"];
    const returnObj: any = {
      TOTAL_NUMBER_OF_FLIGHTS: 0,
      DELAYED_FLIGHTS: 0,
      FLIGHTS_IN_ADVANCE: 0, // TOTAL_NUMBER_OF_FLIGHTS - DELAYED_FLIGHTS - FLIGHTS THAT HAS ARRIVED RIGHT
      CITY_A: cityA,
      CITY_B: cityB,
      MAX_DELAY: -99999999,
      MIN_DELAY: 99999999,
      FLIGHTS: [],
    };
    let delaySum = 0;
    await Promise.all(
      Array.from(new db.BlockchainIterator(this.blocksCount))
    ).then(blocks =>
      blocks.forEach(block =>
        block.transactions.forEach(transaction => {
          // check carrier name
          const insideTime =
            (!dateFrom || transaction.content["FL_DATE"] >= dateFrom) &&
            (!dateTo || transaction.content["FL_DATE"] <= dateTo);

          const sameRoute =
            (!cityA ||
              transaction.content["ORIGIN_CITY_NAME"] === cityA ||
              transaction.content["DEST_CITY_NAME"] === cityA) &&
            (!cityB ||
              transaction.content["ORIGIN_CITY_NAME"] === cityB ||
              transaction.content["DEST_CITY_NAME"] === cityB);
          if (insideTime && sameRoute) {
            queryResult.push(transaction.content);
            returnObj["TOTAL_NUMBER_OF_FLIGHTS"] += 1;
            const delay = Number(transaction.content["ARR_DELAY"]);
            delaySum += delay;
            if (delay > returnObj["MAX_DELAY"]) {
              returnObj["MAX_DELAY"] = delay;
            }
            if (delay < returnObj["MIN_DELAY"]) {
              returnObj["MIN_DELAY"] = delay;
            }

            if (delay > 0) {
              returnObj["DELAYED_FLIGHTS"] += 1;
            } else if (delay < 0) {
              returnObj["FLIGHTS_IN_ADVANCE"] += 1;
            }
          }
        })
      )
    );
    returnObj["AVERAGE_DELAY"] =
      delaySum / returnObj["TOTAL_NUMBER_OF_FLIGHTS"];
    returnObj["FLIGHTS"] = queryResult;
    return returnObj;
  }

  public startLoop() {
    this.miningUpdate();
    this.commUpdate();
  }

  public stopLoop() {
    if (this.miningTimeout) {
      clearTimeout(this.miningTimeout);
    }
    if (this.commTimeout) {
      clearTimeout(this.commTimeout);
    }
  }

  public addPeer(peer: IncomingPeer) {
    const found = this.peers.find(
      p => p.hostname === peer.hostname && p.port === peer.port
    );

    if (!found) {
      const newPeers: Peer = { ...peer, active: true, checkedAt: Date.now() };
      this.peers = [...this.peers, newPeers];
    } else {
      this.peers = this.peers.map(p =>
        p.hostname === peer.hostname && p.port === peer.port
          ? { ...p, active: true, checkedAt: Date.now() }
          : p
      );
    }
  }

  public async refreshPeers() {
    if (!NodeCommunication.isSuperBlock && this.peers.length === 0) {
      this.peers = [NodeCommunication.getDiscoveryPeer()];
    }

    const myself = NodeCommunication.getSelfPeer();
    const remotePeers = await NodeCommunication.fetchRemotePeers(this.peers);
    const excludedMyself = remotePeers.filter(
      p => p.hostname !== myself.hostname || p.port !== myself.port
    );

    this.peers = excludedMyself.map(p => ({
      ...p,
      checkedAt: Date.now(),
      active: true,
    }));
  }

  private async miningUpdate() {
    try {
      const hasTransactions =
        this.unconfirmedTransactions && this.unconfirmedTransactions.length > 0;

      if (hasTransactions) {
        const lastBlock = await this.getLastBlock();

        if (!lastBlock) {
          throw new Error("No last block in Mining Update!");
        }

        const transactionsToValidate: Transaction[] = [];
        for (
          let i = 0;
          i < config.MAX_TRANSACTIONS &&
          this.unconfirmedTransactions.length > 0;
          i++
        ) {
          transactionsToValidate.push(
            this.unconfirmedTransactions.pop() as any
          );
        }

        const unhashedBlock: UnhashedBlock = {
          index: this.blocksCount,
          transactions: transactionsToValidate,
          timestamp: utils.getTimestamp(),
          previousHash: lastBlock.hash,
          nonce: 0,
          minedBy: NodeCommunication.getSelfPeer().name,
        };

        const block = await this.miner.mine(unhashedBlock);

        if (
          // block exists
          block &&
          // it has transactions
          block.transactions.length > 0 &&
          // it has correct id
          block.index === this.blocksCount
        ) {
          console.log(`MINED NEW BLOCK ${block.index}`);
          await NodeCommunication.announceBlock(this.peers, block);
          console.log(`ANNOUNCED MINED ${block.index}`);

          const added = await this.addBlock(block);
          if (added) {
            console.log(`ADDED MINED ${block.index}`);
          }
        } else {
          console.log(`MINED INVALID!`);
        }
      }
    } catch (e) {
      console.error(`Error in miningUpdate:`, e);
    }

    this.miningTimeout = setTimeout(
      () => this.miningUpdate(),
      miningTimeoutTime
    );
  }

  private async commUpdate() {
    try {
      await this.refreshPeers();
      await NodeCommunication.announcement(this.peers);
    } catch (e) {
      console.error(`Error in commUpdate:`, e);
    }

    this.commTimeout = setTimeout(() => this.commUpdate(), commTimeoutTime);
  }
}
