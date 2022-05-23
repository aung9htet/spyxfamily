import * as idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

let db = NaN;

const STORY_DB_NAME= 'db_story';
const STORY_STORE_NAME= 'story_storage';


/**
 * It inits the database and creates an index for the chat field
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
 * It saves the story data in localStorage
 * @params roomId
 * @params chatObject consists of title, short text, author name, date of issue, images
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
 * it retrieves the story data that can be retrieved from the title
 * @param title     title related to the story
 * @returns consists of title, short text, author name, date of issue, images
 */
async function getStoryData(title) {
    // check if db exists or not
    if (!db)
        await initStoryDatabase();
    if (db) {
        // fetch database info
        try {
            console.log('fetching: ' + title);
            let tx = await db.transaction(STORY_STORE_NAME, 'readonly');
            let store = await tx.objectStore(STORY_STORE_NAME);
            // get selected item
            let index = await store.index('title');
            let storyList = await index.getAll(IDBKeyRange.only(title));
            await tx.complete;
            let msg = [];
            // processing and send chat message
            if (storyList && storyList.length > 0) {
                for (let elem of storyList) {
                    msg.push(elem);
                }
            }
            return msg
        } catch (error) {
            console.log(error);
        }
    }
}
window.getStoryData= getStoryData;

/**
 * it retrieves all the chat data for a chatroom from the database
 * @param roomId        title related to the story
 * @returns consists of title, short text, author name, date of issue, images
 */
async function getAllStoryData() {
    // check if db exists or not
    if (!db)
        await initStoryDatabase();
    if (db) {
        // fetch database info
        try {
            console.log('fetching: ');
            let tx = await db.transaction(STORY_STORE_NAME, 'readonly');
            let store = await tx.objectStore(STORY_STORE_NAME);
            // get all items
            let storyList = await store.getAll();
            await tx.complete;
            let msg = [];
            // processing and send chat message
            if (storyList && storyList.length > 0) {
                for (let elem of storyList) {
                    msg.push(elem);
                }
            }
            return msg
        } catch (error) {
            console.log(error);
        }
    }
}
window.getAllStoryData= getAllStoryData;