import level from 'level';
import levelup from 'level';
// import Block from '@speedy_blockchain/common';
/**
 * LevelDB: Wrapper class for level db 
 */
export default class LevelDB {
    private static instance: LevelDB;
    public db: levelup;

    private constructor () {
        this.db = level('blockchain_data/data'); //TODO: callback ? 
    }
    /**
     * getInstance: get the instance of LevelDB
     * @return{LevelDB} the instance of this singleton.
     */
    public static getInstance () {
        if (!LevelDB.instance) {
            LevelDB.instance = new LevelDB();
        } else {
            return LevelDB.instance;
        }
    }

    public async insert (block) {
        return await this.db.put(block.index, JSON.stringify(block));
    }

    public async getBlock (index) {
        return await this.db.get(index);
    }
    
    /**
     * fetchAll: get all blocks from database.
     * @return{Block[]} List of blocks stored in database.
     */
    public async fetchAll () {
        const blocks = [];
        await this.db.createValueStream()
            .on('data', function (data) {
                blocks.push(JSON.parse(data));
            }).then(function() { return blocks; });
    }
}