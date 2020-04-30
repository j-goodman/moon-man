window.addEventListener('load', () => {
    // Load canvas and images
    game.canvas = document.getElementById('canvas')
    game.ctx = game.canvas.getContext('2d')

    game.icons.rock = document.getElementById('rock')

    instantiateWorld()
})
