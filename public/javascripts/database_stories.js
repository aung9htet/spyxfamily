import * as idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

let db = NaN;

const STORY_DB_NAME= 'db_story';
const STORY_STORE_NAME= 'story_storage';

/**
 * it inits the database and creates an index for the chat field
 */
async function initStoryDatabase(){
    if (!db) {
        db = await idb.openDB(STORY_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion) {
                if (!upgradeDb.objectStoreNames.contains(STORY_STORE_NAME)) {
                    let chatDB = upgradeDb.createObjectStore(STORY_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    chatDB.createIndex('title', 'title', {unique: false, multiEntry: true});
                }
            }
        });
        console.log('db created');
    }
}
window.initStoryDatabase= initStoryDatabase;

/**
 * It saves the texts for a chatroom in localStorage
 * @params roomId
 * @params chatObject = [name, text]
 */
async function storeStoryData(title, storyObject) {
    // check if database exists
    if (!db)
        // initialise database
        await initStoryDatabase();
    if (db) {
        // try storing in index db
        try{
            const tx = db.transaction(STORY_STORE_NAME, 'readwrite');
            await Promise.all ([
                tx.store.add(storyObject),
                tx.complete
            ]);
            console.log('added item to the store! '+ JSON.stringify(storyObject));
            // set in local storage if index db doesn't work
        } catch(error) {
            localStorage.setItem(title, JSON.stringify(storyObject));
            console.log('Error message:'+ error);
        };
    }
    else localStorage.setItem(title, JSON.stringify(storyObject));
}
window.storeStoryData= storeStoryData;

/**
 * it retrieves all the chat data for a chatroom from the database
 * @param roomId
 * @returns objects like {name, text}
 */
async function getStoryData() {
    // check if db exists or not
    if (!db)
        await initStoryDatabase();
    if (db) {
        // fetch database info
        try {
            console.log('fetching: ');
            let tx = await db.transaction(STORY_STORE_NAME, 'readonly');
            let store = await tx.objectStore(STORY_STORE_NAME);
            // set specific item to get from
            let storyList = await store.getAll();
            await tx.complete;
            let msg = [];
            // processing and send chat message
            if (storyList && storyList.length > 0) {
                for (let elem of storyList) {
                    msg.push(elem);
                }
                return msg;
            } else {
                // if the database is not supported, we use localstorage
                const value = localStorage.getAll();
                if (value == null)
                    return msg;
                else msg.push(value);
                return msg;
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        const value = localStorage.getAll();
        let msg = []
        if (value == null)
            return msg;
        else msg.push(value);
        return msg;
    }
}
window.getStoryData= getStoryData;