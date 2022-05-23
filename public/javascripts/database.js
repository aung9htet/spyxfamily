import * as idb from 'https://cdn.jsdelivr.net/npm/idb@7/+esm';

let db = NaN;
let db_draw = NaN;
let db_annotation = NaN;

const CHAT_DB_NAME= 'db_chat';
const CHAT_STORE_NAME= 'chat_storage';
const IMG_STORE_NAME = 'image_storage';
const DRAW_DB_NAME= 'db_draw';
const DRAW_STORE_NAME= 'draw_storage';
const ANNOTATION_DB_NAME = 'db_annotation';
const ANNOTATION_STORE_NAME = 'annotation_draw';

/**
 * The function initialises the database that will consist of the chat, drawings and knowledge graph
 * The function creates the table for image and chat separately in the chat database
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
        db_draw = await idb.openDB(DRAW_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion){
                if (!upgradeDb.objectStoreNames.contains(DRAW_STORE_NAME)){
                    let drawDB = upgradeDb.createObjectStore(DRAW_STORE_NAME,{
                        keyPath: 'id',
                        autoIncrement: true
                    })
                    drawDB.createIndex('roomId', 'roomId', {unique: false, multiEntry: true});
                }
            }
        });
        db_annotation = await idb.openDB(ANNOTATION_DB_NAME, 2, {
            upgrade(upgradeDb, oldVersion, newVersion){
                if (!upgradeDb.objectStoreNames.contains(ANNOTATION_STORE_NAME)){
                    let annotationDB = upgradeDb.createObjectStore(ANNOTATION_STORE_NAME,{
                        keyPath: 'id',
                        autoIncrement: true
                    })
                    annotationDB.createIndex('roomId', 'roomId', {unique: false, multiEntry: true});
                }
            }
        });
        console.log('db created');
    }
}
window.initDatabase= initDatabase;

/**
 * The function adds images to the database for the image table
 * @param roomId                roomId related to the image
 * @param imageObject           the image link
 * @returns {Promise<void>}
 */
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

/**
 * The function retrieves the image related to the roomId
 * @param roomId The roomId for retrieving the image
 * @returns {Promise<string|*|*[]|any>}
 */
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
 * It saves the texts for a chatroom in the database
 * @params roomId           The roomId related to the chat object
 * @params chatObject       consists of the roomId, username, chat message
 */
async function storeChatData(roomId, chatObject) {
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
        }
    }
    else localStorage.setItem(roomId, JSON.stringify(chatObject));
}
window.storeChatData= storeChatData;

/**
 * it retrieves all the chat data for a chatroom from the database
 * @param roomId The roomId related to the chat object
 * @returns consists of the roomId, username, chat message
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

/**
 * It saves the location for the draw room in local storage
 * @params roomId The roomId related to the drawing object
 * @params consists of the room, userId, x, y, x_1, y_1, x_2, y_2, painting, color, line, mode
 */
async function storeDrawData(roomId, drawObject) {
    // check if database exists
    if (!db_draw)
        // initialise database
        await initDatabase();
    if (db_draw) {
        // try storing in index db
        try{
            const tx = db_draw.transaction(DRAW_STORE_NAME, 'readwrite');
            await Promise.all ([
                tx.store.add(drawObject),
                tx.complete
            ]);
            console.log('added item to the store! '+ JSON.stringify(drawObject));
            // set in local storage if index db doesn't work
        } catch(error) {
            localStorage.setItem(roomId, JSON.stringify(drawObject));
            console.log('Error message:'+ error);
        }
    }
    else localStorage.setItem(roomId, JSON.stringify(drawObject));
}
window.storeDrawData= storeDrawData;

/**
 * it retrieves all the drawing data for a draw room from the database
 * @param roomId    The roomId related to the drawing object
 * @returns         consists of the room, userId, x, y, x_1, y_1, x_2, y_2, painting, color, line, mode
 */
async function getDrawData(roomId) {
    // check if db exists or not
    if (!db_draw)
        await initDatabase();
    if (db_draw) {
        // fetch database info
        try {
            console.log('fetching for drawing data: ' + roomId);
            let tx = await db_draw.transaction(DRAW_STORE_NAME, 'readonly');
            let store = await tx.objectStore(DRAW_STORE_NAME);
            // set specific item to get from
            let index = await store.index('roomId');
            let drawList = await index.getAll(IDBKeyRange.only(roomId));
            await tx.complete;
            let drawing = [];
            // processing and send chat message
            if (drawList && drawList.length > 0) {
                for (let elem of drawList) {
                    drawing.push(elem);
                }
                return drawing;
            } else {
                // if the database is not supported, we use localstorage
                const value = localStorage.getItem(roomId);
                if (value == null)
                    return drawing;
                else drawing.push(value);
                return drawing;
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        const value = localStorage.getItem(roomId);
        let drawing = []
        if (value == null)
            return drawing;
        else drawing.push(value);
        return drawing;
    }
}
window.getDrawData= getDrawData;

/**
 * It saves the location for the annotation data in localStorage
 * @params roomId           The roomId related to the annotation object
 * @params chatObject       consists of the resultId, resultName, resultDescription, resultUrl, resultColor
 */
async function storeAnnotationData(roomId, annotationObject) {
    // check if database exists
    if (!db_annotation)
        // initialise database
        await initDatabase();
    if (db_annotation) {
        // try storing in index db
        try{
            const tx = db_annotation.transaction(ANNOTATION_STORE_NAME, 'readwrite');
            await Promise.all ([
                tx.store.add(annotationObject),
                tx.complete
            ]);
            console.log('added item to the store! '+ JSON.stringify(annotationObject));
            // set in local storage if index db doesn't work
        } catch(error) {
            localStorage.setItem(roomId, JSON.stringify(annotationObject));
            console.log('Error message:'+ error);
        }
    }
    else localStorage.setItem(roomId, JSON.stringify(annotationObject));
}
window.storeAnnotationData= storeAnnotationData;

/**
 * it retrieves all the annotation data for an annotation from the database
 * @param roomId        The roomId related to the annotation object
 * @returns             consists of the resultId, resultName, resultDescription, resultUrl, resultColor
 */
async function getAnnotationData(roomId) {
    // check if db exists or not
    if (!db_annotation)
        await initDatabase();
    if (db_annotation) {
        // fetch database info
        try {
            console.log('fetching for drawing data: ' + roomId);
            let tx = await db_annotation.transaction(ANNOTATION_STORE_NAME, 'readonly');
            let store = await tx.objectStore(ANNOTATION_STORE_NAME);
            // set specific item to get from
            let index = await store.index('roomId');
            let annotationList = await index.getAll(IDBKeyRange.only(roomId));
            await tx.complete;
            let annotations = [];
            // processing and send chat message
            if (annotationList && annotationList.length > 0) {
                for (let elem of annotationList) {
                    annotations.push(elem);
                }
                return annotations;
            } else {
                // if the database is not supported, we use localstorage
                const value = localStorage.getItem(roomId);
                if (value == null)
                    return annotations;
                else annotations.push(value);
                return annotations;
            }
        } catch (error) {
            console.log(error);
        }
    } else {
        const value = localStorage.getItem(roomId);
        let annotations = []
        if (value == null)
            return annotations;
        else annotations.push(value);
        return annotations;
    }
}
window.getAnnotationData= getAnnotationData;