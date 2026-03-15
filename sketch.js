let img;
let tiles;
let GRID_SIZE = 50;
let w;
let grid;
const TILE_SIZE = 3;
const MAX_DEPTH = 20;

function preload(){
    img = loadImage('images/city.png');
}

function setup(){
    createCanvas(400, 400);
    tiles = extractTiles(img);
    w = width / GRID_SIZE;
    // calculate adjacency rules of each tile
    for(let tile of tiles){
       tile.calculateAdjacencies(tiles);
    }

    initializeGrid();

    // perform initial wave function collapse step
    wfc();
}

function initializeGrid(){
    grid = [];
    // Initialize the grid with cells
    for(let row = 0; row < GRID_SIZE; row++){
        for(let col = 0; col < GRID_SIZE; col++){
            let index = col + row * GRID_SIZE;
            grid.push(new Cell(tiles, col * w, row * w, w, index));
        }
    }
}

function draw9by9(width){
    let x = 0;
    let y = 0;
    let gap = 5; // pixels between tiles

    for(let i = 0; i < tiles.length; i++){
        renderImage(tiles[i].img, x, y, width);
        x += w * TILE_SIZE + gap; // every time, increment by tileSize and add a bit of a gap
        if(x > 8 * (w * TILE_SIZE + gap)){ // w counts as one tile. we need 9 before it wraps around to the next row. we have 3 "pixel blocks", so multiply width (which is the scaled version of the pixel) by 3.
            x = 0;
            y += w * TILE_SIZE + gap;
        }
    }
}

function draw(){
    background(0); // sets the background color to black
    // draw9by9(w);

    // visualization purposes
    for(let i = 0; i < grid.length; i++){
        grid[i].show();
        grid[i].checked = false;
    }

    wfc();
    // noLoop();
}

// WAVE FUNCTION COLLAPSE
function wfc(){
    // Calculate entropy for each cell
    for(let cell of grid){
        cell.calculateEntropy();
    }

    // Find cells with the lowest entropy
    // This refactored method avoids sorting
    let minEntropy = Infinity;
    let lowestEntropyCells = [];

    for(let cell of grid){
        if(!cell.collapsed){
            // If there is a cell with smaller entropy than the current counter, replace
            // lowestEntropyCells with a new array containing just that cell
            if(cell.entropy < minEntropy){
                minEntropy = cell.entropy;
                lowestEntropyCells = [cell];
            }else if(cell.entropy === minEntropy){
                lowestEntropyCells.push(cell);
            }
        }
    }

    // We're done if all cells are collapsed
    if(lowestEntropyCells.length === 0){
        return;
    }

    // Collapse a cell
    const cell = random(lowestEntropyCells); // random() is a p5.js-specific function
    cell.collapsed = true;
    const pick = random(cell.options); // pick a random tile from the cell's options
    cell.options = [pick]; // assign an array that only contains pick
    if(pick === undefined){
        console.log("ran out of options");
        initializeGrid();
        return;
    }

    // Propagate adjacent cells
    // if there are no allowed adjacency rules at the end, return false, reset the grid, and run WFC again
    reduceEntropy(grid, cell, 0);

    // optimization line
    for(let cell of grid){
        if(cell.options.length == 1){
            cell.collapsed = true;
            reduceEntropy(grid, cell, 0);
        }
    }
}

// every single recursive call of this function, increment depth by 1 to propagate even deeper
// however, limit recursive depth after some number of recursive calls
function reduceEntropy(grid, cell, depth){
    if(depth > MAX_DEPTH || cell.checked) return;
    cell.checked = true;

    let index  = cell.index;

    // converting one-dimensional index to column and row
    let col = floor(index % GRID_SIZE);
    let row = floor(index / GRID_SIZE);

    // [rowOffset, colOffset, direction] -- refactor code to look more clean
    // this is for ALL directions
    let adjacentCells = [
        [0, 1, R],
        [0, -1, L],
        [-1, 0, U],
        [1, 0, D]
    ];
    
    for(let [rowOffset, colOffset, dir] of adjacentCells){
        let adjacentCol = col + colOffset;
        let adjacentRow = row + rowOffset;
        if(adjacentCol < 0 || adjacentCol >= GRID_SIZE || adjacentRow < 0 || adjacentRow >= GRID_SIZE) continue; // loop out if out of bounds
        
        let adjacentCell = grid[adjacentCol + adjacentRow * GRID_SIZE];
        if(!adjacentCell || adjacentCell.collapsed) continue;
        let validOptions = [];
        for(let option of cell.options){
            validOptions = validOptions.concat(tiles[option].adjacencies[dir]);
        }

        // if you add braces to => {}, you need to add a return statement.
        adjacentCell.options = adjacentCell.options.filter(opt => validOptions.includes(opt));

        // recursively reduce entropy for each adjacent cell -- more propagation
        reduceEntropy(grid, adjacentCell, depth + 1);
    }
}