# speedy_blockchain

This project uses Lerna. There are two packages:

- `frontend`: the web interface for the blockchain, written with React and TypeScript,
- `backend`: the blockchain single-node backend, written with Node.JS, Express and TypeScript.

## Scripts

Please use [`yarn`](https://classic.yarnpkg.com/en/docs/getting-started) to manage packages and dependencies.

- `yarn dev`: runs the backend and the frontend concurrently, in development live-reload mode,
- `yarn dev-frontend`: runs the frontend, in development live-reload mode,
- `yarn dev-backend`: runs the backend, in development live-reload mode.

You can find package specific scripts in the packages readme.

## Docker

Use `docker-compose up` to run 3 istances of nodes that can comunicate to each other.

They will create a local folder in the project called: _blockchain_data/_, and inside that folder every node will store it's data.

### Running single istances

- `yarn docker-build`: builds the docker image

To run an instace of the application use:

```docker
docker run -d
    -p DESIRED_BACKEND_PORT:8080
    -p DESIRED_FRONTEND_PORT:3000
    -v ./blockchain_data/NODE_FOLDER_NAME:/data 
    speedy_blockchain
```

- `DESIRED_PORT` is the choosen destination port of the deamon
- `NODE_FOLDER_NAME` is the name of the subfolder that the node will create to store it's data

## Assignment
### Blockchain Application

Blockchain is a rising technology to store unmodifiable data without the need of a centralized authority. The main concept behind this distributed technology is the proof of work. In this assignment, you will develop your own web application based on the blockchain technology. It consists in a non-modifiable database of flying statistics. 

#### First steps

Our first steps begin with the tutorial provided by IBM that you can follow at the webpage:

[IBM Tutorial](https://developer.ibm.com/technologies/blockchain/tutorials/develop-a-blockchain-application-from-scratch-in-python/)

The code can be downloaded from GitHub here: 

[IBM Tutorial GitHub Page](https://github.com/satwikkansal/python_blockchain_app/tree/ibm_blockchain_post)

#### Extensions

The tutorial provided by IBM must be extended in several way. The group can choose if it prefers to work on a single node (easier solution) or multiple nodes (harder solution, but more interesting). The following list contains the modifications of the IBM work that must be implemented:
Modification 1: records

At the moment the IBM application works as a trivial message board. In our case we want to implement anì non-modifiable database of the statistics of US flights. This is useful for insurance refunding.  Each flight must be described by the following fields:

    TRANSACTION ID: id of the transaction
    YEAR: year the flight took place
    DAY_OF_WEEK: 1..7, 1=Sunday
    FLIGHT_DATE: yyyymmaa
    OP_CARRIER_FL_NUM: flight number
    OP_CARRIER_AIRLINE_ID: unique id of the carrier line
    ORIGIN_AIRPORT_ID: unique id of the origin airport
    ORIGIN: origin airport name
    ORIGIN_CITY_NAME: origin city
    ORIGIN_STATE_NM: origin state
    DEST_AIRPORT_ID: unique id of the destination airport
    DEST: destination airport name
    DEST_CITY_NAME: destination city,
    DEST_STATE_NM: destination state
    DEP_TIME: local departure time
    DEP_DELAY: departure delay
    ARR_TIME: arrival time
    ARR_DELAY: arrival delay
    CANCELLED: 1=Yes, 0=No
    AIR_TIME: length of the flight

We want to design a blockchain whose transactions are records of the above described type.

#### Modification 2: operations defined

The operations that must be allowed in the blockchain are:

    add a new transactions
    retrieve a transaction based on the transaction id
    retrieve all the transactions of a block

#### Modification 3: mining and storage

The mining operation must be invoked automatically every minute. In realty the mining process must be constantly carried on to make the chain more robust to attacks. However, for our purposes, this is possible only if you have a computer dedicated to the mining process. Blocks must contain at least one transaction (with the exception of the first block) and at most 1,000 transactions. Blocks must be stored in the disk as separate files. If you plan to have multiple miners in your implementation (this is optional) please pay attention that the joining phase must take into account the transfer of the entire chain. When the system is started, the blockchain must be recreated from the files: therefore, modifications must be persistent. 
#### Modification 4: the application

The web application must allow the following operations:

    Adding a new record to the chain
     Query the status of a flight given OP_CARRIER_AIRLINE_ID and the DATE
    Query the average delay of a flight carrier in a certain interval of time
    Given a pair of cities A and B, and a time interval, count the number of flights connecting city A to city B


#### Running application

Populate your blockchain with the data whose CSV  can be found [here](https://www.dropbox.com/s/v3azu6xigk63bfu/656211699_T_ONTIME_REPORTING.csv?dl=0). Data is retrieved from the [Bureau of Transportation Statistics](https://www.transtats.bts.gov/DL_SelectFields.asp?Table_ID=236&DB_Short_Name=On-Time). Set a low difficulty for the hash so that you can populate your blockchain quickly. 
