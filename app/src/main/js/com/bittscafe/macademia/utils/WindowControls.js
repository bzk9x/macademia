const { ipcRenderer } = require('electron')

// Minimize button
document.getElementById('utilWindowControlMinimize').addEventListener('click', () => {
    ipcRenderer.send('minimize-window')
})

// Maximize/Restore button
document.getElementById('utilWindowControlMaxmimize').addEventListener('click', () => {
    ipcRenderer.send('maximize-window')
})

// Close button
document.getElementById('utilWindowControlClose').addEventListener('click', () => {
    ipcRenderer.send('close-window')
})