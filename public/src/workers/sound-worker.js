self.addEventListener('message', function(e) {
    if (e.data === 'start') {
        postMessage({ action: 'play' });
    } else if (e.data === 'stop') {
        postMessage({ action: 'stop' });
    }
});
