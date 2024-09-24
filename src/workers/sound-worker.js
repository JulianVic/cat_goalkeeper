self.addEventListener('message', function(e) {
    console.log("si");
    
    if (e.data === 'start') {
        postMessage({ action: 'play' });
    } else if (e.data === 'stop') {
        postMessage({ action: 'stop' });
    }
});
