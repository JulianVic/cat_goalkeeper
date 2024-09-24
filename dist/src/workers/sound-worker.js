self.addEventListener('message', function(e) {
    console.log(e.data);
    
    if (e.data === 'start') {
        postMessage({ action: 'play' });
    } else if (e.data === 'stop') {
        postMessage({ action: 'stop' });
    }
});
