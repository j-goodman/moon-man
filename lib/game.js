window.game = {}
game.grid = {}
game.check = (x, y) => {
    game.grid[x] = game.grid[x] ? game.grid[x] : {}
    game.grid[x][y] = game.grid[x][y] ? game.grid[x][y] : new Square ()
}
game.worldbuilder = {}
game.worldbuilder.clear = (x, y) => {
    game.grid[x][y].entity = null
}
game.icons = {}
game.intervals = []
instantiateWorld = () => {
    game.player = new Player (0, 0)
    game.player.name = 'player'
    game.player.icon = document.getElementById('rock')
    game.drawGrid(game.player.pos)
}

window.addEventListener('keydown', event => {
    if (['ArrowLeft', 'a'].includes(event.key)) {
        game.player.move(-1, 0)
    } else if (['ArrowDown', 's'].includes(event.key)) {
        game.player.move(0, 1)
    } else if (['ArrowRight', 'd'].includes(event.key)) {
        game.player.move(1, 0)
    } else if (['ArrowUp', 'w'].includes(event.key)) {
        game.player.move(0, -1)
    } else if (['Enter', 'f'].includes(event.key)) {
        let button = document.getElementsByClassName('button')[0]
        if (button) {
            button.click()
        }
    }
})

let Entity = function (x, y) {
    this.instantiate(x, y)
    this.info = ''
}

let Item = function (x, y) {
    this.instantiate(x, y)
    this.value = 0
}
wheels.inherits(Item, Entity)

Entity.prototype.instantiate = function (x, y) {
    this.pos = {
        x: x,
        y: y
    }
    game.check(x, y)
    game.grid[x][y].entity = this
}

Entity.prototype.move = function (xMove, yMove) {
    let dir = {x: xMove, y: yMove}
    if (this.moveDelay) {
        this.mostRecentMove = dir
        return false
    }

    let x = this.pos.x
    let y = this.pos.y

    game.grid[x + dir.x] = game.grid[x + dir.x] ? game.grid[x + dir.x] : {}
    game.grid[x + dir.x][y + dir.y] = game.grid[x + dir.x][y + dir.y] ? game.grid[x + dir.x][y + dir.y] : new `Square` ()
    let entity = game.grid[x + dir.x][y + dir.y].entity
    if (entity) {
        if (entity.walkover) {
            entity[entity.walkover](this)
        }
        if (this.bump) {
            this.bump()
        }
    } else {
        game.grid[x][y].entity = null
        game.grid[x + dir.x][y + dir.y].entity = this
        this.pos = {
            x: x + dir.x,
            y: y + dir.y
        }
    }
    game.drawGrid(game.player.pos)
    if (this === game.player) {
        this.moveDelay = true
        setTimeout(function () {
            this.moveDelay = false
            if (this.mostRecentMove) {
                this.move(this.mostRecentMove.x, this.mostRecentMove.y)
                this.mostRecentMove = null
            }
        }.bind(this), this.speed * 20)
    }
    return true
}

let Person = function (x, y) {
    this.instantiate(x, y)
    this.name = 'person'
    this.moveDelay = false
    this.inventory = []
    this.inventory.length = 8
    this.inventory.fill(null)
    this.money = Math.floor(Math.random() * 7) + 2
}
wheels.inherits(Person, Entity)

let Player = function (x, y) {
    this.instantiate(x, y)
    this.name = 'person'
    this.actions = ['get']
    this.inventory = []
    this.inventory.length = 8
    this.inventory.fill(null)
    this.speed = 6
}
wheels.inherits(Player, Person)

let Square = function () {
    this.entity = null
    this.moisture = Math.random() / 10
}

game.drawGrid = center => {
    game.ctx.clearRect(0, 0, canvas.width, canvas.height)
    let x = center.x - 6
    let relX = 0
    while (x <= center.x + 6) {
        let y = center.y - 5
        let relY = 0
        while (y <= center.y + 5) {
            game.check(x, y)
            let moist = game.grid[x][y].moisture
            game.ctx.fillStyle = `rgba(${
                wheels.spectrum(moist, 250, 125)} ${
                wheels.spectrum(moist, 240, 115)} ${
                wheels.spectrum(moist, 200, 60)
            })`
            game.ctx.fillRect(relX * 100, relY * 100, 100, 100);
            if (game.grid[x][y].entity) {
                game.ctx.drawImage(game.grid[x][y].entity.icon, relX * 100, relY * 100, 100, 100)
            }
            relY++
            y++
        }
        relX++
        x++
    }
}
