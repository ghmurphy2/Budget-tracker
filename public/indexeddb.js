

// create budget db
let db;
const request = indexedDB.open("budget", 1)
// create offline waiting cache
request.onupgradeneeded = function (e){
    const db = e.target.result;
    db.createObjectStore("waiting", {autoIncrement: true});
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

function saveRecord(rec){

    const transaction = db.transaction(['waiting'], 'readwrite');
    const store = transaction.objectStore('waiting');
    store.add(rec)
}

function checkDatabase(){
    const transaction = db.transaction(['waiting'], 'readwrite');
    const store = transaction.objectStore('waiting');
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
                const transaction = db.transaction(['waiting'], 'readwrite');
                const store = transaction.objectStore('waiting');
                store.clear()
            });

    };
}
}

window.addEventListener('online', checkDatabase)