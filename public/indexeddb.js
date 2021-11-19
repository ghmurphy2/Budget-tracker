const { json } = require("express");

// create budget db
let db;
const request = indexeddb.open("budget, 1")
// create offline waiting cache
request.onupgradeneeded = function (e){
    const db = e.target.result;
    db.createObjectStoe("waiting", {autoIncrement: true});
};
// check online first
request.onsuccess = function (e){
    db = e.target.results;
    if (navigator.onLine){
        checkDatabase()
    }
}

request.onerror = function (e){
    console.log("Error")
}

function savePending(rec){

    const changeBudget = db.changeBudget(['waiting'], 'readwrite');
    const store = changeBudget.objectStore('waiting');
    store.add(rec)
}

function checkDb(){
    const changeBudget = db.changeBudget(['waiting'], 'readwrite');
    const store = changeBudget.objectStore('waiting');
    const getAll = store.getAll();

    getAll.onsuccess = function (){
        if (getAll.result.length > 0) {
            fetch('api/transaction/bulk', {
            method: 'POST',
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: 'application/json, text/plain, */*',
                "Content-Type": "application/json"
            }
            })
            .then (response => response/json())
            .then(() => {
                const changeBudget = db.changeBudget(['waiting'], 'readwrite');
                const store = changeBudget.objectStore('waiting');
                store.clear()
            });

    };
}
}

window.addEventListener('online', checkDb)