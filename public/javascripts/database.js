import * as idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

let db = NaN;

const CHAT_DB_NAME= 'db_chat';
const CHAT_STORE_NAME= 'chat_storage';
const IMG_STORE_NAME = 'image_storage';

/**
 * it inits the database and creates an index for the chat field
 */
async function initDatabase(){
    if (!db) {
        db = await idb.openDB(CHAT_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(CHAT_STORE_NAME)) {
                    let chatDB = upgradeDb.createObjectStore(CHAT_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    chatDB.createIndex('roomId', 'roomId', {unique: false, multiEntry: true});
                }
                if (!upgradeDb.objectStoreNames.contains(IMG_STORE_NAME)) {
                    let imageDB = upgradeDb.createObjectStore(IMG_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    imageDB.createIndex('roomId', 'roomId', {unique: false, multiEntry: true});
                }
            }
        });
        console.log('db created');
    }
}
window.initDatabase= initDatabase;

async function storeImageData(roomId, imageObject) {
    if (!db)
        await initDatabase();
    if (db) {
        try {
            const tx = db.transaction(IMG_STORE_NAME, 'readwrite');
            await Promise.all([
                tx.store.add(imageObject),
                tx.complete
            ]);
            console.log('added item to the store! ' + JSON.stringify(imageObject));
        } catch(error) {
            localStorage.setItem(roomId, JSON.stringify(imageObject));
        };
    }
    else localStorage.setItem(roomId, JSON.stringify(imageObject));
}
window.storeImageData = storeImageData;

async function getImageData(roomId) {
    // check if db exists or not
    if (!db)
        await initDatabase();
    if (db) {
        // fetch database info
        try {
            console.log('fetching: ' + roomId);
            let tx = await db.transaction(IMG_STORE_NAME, 'readonly');
            let store = await tx.objectStore(IMG_STORE_NAME);
            // set specific item to get from
            let index = await store.index('roomId');
            let imgList = await index.getAll(IDBKeyRange.only(roomId));
            await tx.complete;
            var img;
            // processing and send chat message
            if (imgList && imgList.length > 0) {
                for (let elem of imgList) {
                    img = elem;
                }
                return img;
            } else {
                // if the database is not supported, we use localstorage
                const value = localStorage.getItem(roomId);
                if (value == null)
                    return img;
                else img = value;
                return img;
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        const value = localStorage.getItem(roomId);
        let img = []
        if (value == null)
            return img;
        else img.push(value);
        return img;
    }
}
window.getImageData= getImageData;
/**
 * It saves the texts for a chatroom in localStorage
 * @params roomId
 * @params chatObject = [name, text]
 */
async function storeChatData(roomId, chatObject) {
    console.log(chatObject);
    // check if database exists
    if (!db)
        // initialise database
        await initDatabase();
    if (db) {
        // try storing in index db
        try{
            const tx = db.transaction(CHAT_STORE_NAME, 'readwrite');
            await Promise.all ([
                tx.store.add(chatObject),
                tx.complete
            ]);
            console.log('added item to the store! '+ JSON.stringify(chatObject));
            // set in local storage if index db doesn't work
        } catch(error) {
            localStorage.setItem(roomId, JSON.stringify(chatObject));
            console.log('Error message:'+ error);
        };
    }
    else localStorage.setItem(roomId, JSON.stringify(chatObject));
}
window.storeChatData= storeChatData;

/**
 * it retrieves all the chat data for a chatroom from the database
 * @param roomId
 * @returns objects like {name, text}
 */
async function getChatData(roomId) {
    // check if db exists or not
    if (!db)
        await initDatabase();
    if (db) {
        // fetch database info
        try {
            console.log('fetching: ' + roomId);
            let tx = await db.transaction(CHAT_STORE_NAME, 'readonly');
            let store = await tx.objectStore(CHAT_STORE_NAME);
            // set specific item to get from
            let index = await store.index('roomId');
            let chatList = await index.getAll(IDBKeyRange.only(roomId));
            await tx.complete;
            let msg = [];
            // processing and send chat message
            if (chatList && chatList.length > 0) {
                for (let elem of chatList) {
                    msg.push(elem);
                }
                return msg;
            } else {
                // if the database is not supported, we use localstorage
                const value = localStorage.getItem(roomId);
                if (value == null)
                    return msg;
                else msg.push(value);
                return msg;
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        const value = localStorage.getItem(roomId);
        let msg = []
        if (value == null)
            return msg;
        else msg.push(value);
        return msg;
    }
}
window.getChatData= getChatData;