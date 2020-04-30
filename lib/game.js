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
    let i = 0
    while (i < 7) {
        let rock = new Barrier (1, 2 + i)
        rock.icon = game.icons.rock
        i++
    }
    i = 0
    let rock = new Barrier (2, 2)
    rock.icon = game.icons.rock
    while (i < 4) {
        let rock = new Barrier (4 + i, 2)
        rock.icon = game.icons.rock
        i++
    }
    game.player.name = 'player'
    game.player.icon = game.icons.statue
    game.center = {
        x: game.player.pos.x + 4,
        y: game.player.pos.y + 4
    }
    game.drawGrid(game.center)
    let gameInterval = window.setInterval(() => {
        let movement = {
            x: 0,
            y: 0,
        }
        if (keyboard.left) { movement.x -= 1 }
        if (keyboard.up) { movement.y -= 1 }
        if (keyboard.right) { movement.x += 1 }
        if (keyboard.down) { movement.y += 1 }
        if (movement.x || movement.y || game.player.moving) {
            game.player.move(movement.x, movement.y)
        }
        game.drawGrid(game.center)
    }, 30)
}

let keyboard = {}

window.addEventListener('keydown', event => {
    if (['ArrowLeft', 'a'].includes(event.key)) {
        keyboard.left = true
    } else if (['ArrowDown', 's'].includes(event.key)) {
        keyboard.down = true
    } else if (['ArrowRight', 'd'].includes(event.key)) {
        keyboard.right = true
    } else if (['ArrowUp', 'w'].includes(event.key)) {
        keyboard.up = true
    }
})

window.addEventListener('keyup', event => {
    if (['ArrowLeft', 'a'].includes(event.key)) {
        keyboard.left = false
    } else if (['ArrowDown', 's'].includes(event.key)) {
        keyboard.down = false
    } else if (['ArrowRight', 'd'].includes(event.key)) {
        keyboard.right = false
    } else if (['ArrowUp', 'w'].includes(event.key)) {
        keyboard.up = false
    }
})

let Entity = function (x, y) {
    this.instantiate(x, y)
    this.moving = false
    this.betweenness = 0
    this.speed = 1
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
    if (this.moving) {
        this.betweenness += 1
        if (this.betweenness < 9) {
            return false
        } else {
            this.betweenness = 0
            this.moving = false
        }
    }
    this.direction = {
        x: xMove,
        y: yMove
    }
    let dir = this.direction

    let x = this.pos.x
    let y = this.pos.y

    game.check(x + dir.x, y + dir.y)
    game.check(x, y + dir.y)
    game.check(x + dir.x, y)

    if (game.grid[x][y + dir.y].entity) {
        dir.y = 0
    }

    if (game.grid[x + dir.x][y].entity) {
        dir.x = 0
    }

    if (dir.x && dir.y && game.grid[x + dir.x][y + dir.y].entity) {
        dir.x = 0
    }

    if (dir.x == 0 && dir.y == 0) {
        return false
    }

    this.moving = true
    game.grid[x][y].entity = null
    game.grid[x + dir.x][y + dir.y].entity = this
    this.pos = {
        x: x + dir.x,
        y: y + dir.y
    }
    return true
}

let Person = function (x, y) {
    this.instantiate(x, y)
    this.moving = false
    this.betweenness = 0
    this.speed = 1
    this.name = 'person'
}
wheels.inherits(Person, Entity)

let Barrier = function (x, y) {
    this.instantiate(x, y)
    this.moving = false
    this.betweenness = 0
    this.speed = 1
    this.name = 'barrier'
}
wheels.inherits(Barrier, Entity)

let Player = function (x, y) {
    this.instantiate(x, y)
    this.moving = false
    this.betweenness = 0
    this.speed = 1
    this.name = 'player'
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
    let entities = []
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
            let entity = game.grid[x][y].entity
            if (entity) {
                entity.relX = relX
                entity.relY = relY
                entities.push(entity)
            }
            relY++
            y++
        }
        relX++
        x++
    }
    entities.forEach(entity => {
        let relX = entity.relX
        let relY = entity.relY
        if (entity.moving) {
            game.ctx.drawImage(
                entity.icon,
                (relX * 100) - (entity.direction.x * 100 * (1 - entity.betweenness / 9)),
                (relY * 100) - (entity.direction.y * 100 * (1 - entity.betweenness / 9)),
                100,
                100)
        } else {
            game.ctx.drawImage(entity.icon, relX * 100, relY * 100, 100, 100)
        }
    })
}
