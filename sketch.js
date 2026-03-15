let img;
let tiles;
let DIM = 40;
let w;
let grid = [];

function preload(){
    img = loadImage('images/flowers.png');
}

function setup(){
    createCanvas(400, 400);
    tiles = extractTiles(img);
    w = width / DIM;
    // calculate adjacency rules of each tile
    for(let tile of tiles){
       tile.calculateAdjacencies(tiles);
    }

    // populate grid with cells
    for(let row = 0; row < DIM; row++){
        for(let col = 0; col < DIM; col++){
            let index = col + row * DIM;
            grid.push(new Cell(tiles, col * w, row * w, w, index));
        }
    }
    console.log(grid);
    wfc();
}

function draw9by9(width){
    let x = 0;
    let y = 0;
    let gap = 5; // pixels between tiles
    let tileSize = width * 3; // pixels have been scaled by w and are now w x w. there are three pixel blocks in each tile, so w x 3.

    for(let i = 0; i < tiles.length; i++){
        renderImage(tiles[i].img, x, y, width);
        x += tileSize + gap; // every time, increment by tileSize and add a bit of a gap
        // x += tileSize;
        if(x > 8 * (tileSize + gap)){ // w counts as one tile. we need 9 before it wraps around to the next row. we have 3 "pixel blocks", so multiply width (which is the scaled version of the pixel) by 3.
        // if(x > 8 * tileSize){
            x = 0;
            y += tileSize + gap;
            // y += tileSize;
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

function wfc(){
    // WAVE FUNCTION COLLAPSE
    
    // Make a copy of the grid
    let gridCopy = grid.slice();

    // Remove any collapsed cells
    gridCopy = gridCopy.filter((a) => !a.collapsed); // a is an element in gridCopy

    // The algorithm has completed if everything is collapsed
    if(gridCopy.length == 0){
        return;
    }

    // Sort by entropy to pick a cell with least entropy
    gridCopy.sort((a, b) => {
        return a.options.length - b.options.length;
    });

    // Keep only the lowest entropy cells
    let len = gridCopy[0].options.length;
    let stopIndex = 0;
    for(let i = 1; i < gridCopy.length; i++){
        if(gridCopy[i].options.length > len){ // gridCopy is already sorted, so we find the next cell with higher entropy
            stopIndex = i;
            break;
        }
    }
    if(stopIndex > 0){
        gridCopy.splice(stopIndex); // removes all elements from stopIndex onwards
    }

    // Collapse a cell
    const cell = random(gridCopy); // random() is a p5.js-specific function
    cell.collapsed = true;
    const pick = random(cell.options); // pick a random tile from the cell's options
    cell.options = [pick]; // assign an array that only contains pick

    // Propagate adjacent cells
    // if there are no allowed adjacency rules at the end, return false, reset the grid, and run WFC again
    if(!reduceEntropy(grid, cell, 0)){
        resetGrid();
        return;
    }
}

// every single recursive call of this function, increment depth by 1 to propagate even deeper
// however, limit recursive depth after some number of recursive calls
function reduceEntropy(grid, cell, depth){
    if(depth > 5 || cell.checked) return true;
    cell.checked = true;

    let index  = cell.index;

    // converting one-dimensional index to column and row
    let col = floor(index % DIM);
    let row = floor(index / DIM);

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
        if(adjacentCol < 0 || adjacentCol >= DIM || adjacentRow < 0 || adjacentRow >= DIM) continue; // loop out if out of bounds
        
        let adjacentCell = grid[adjacentCol + adjacentRow * DIM];
        if(!adjacentCell || adjacentCell.collapsed) continue;
        let validOptions = [];
        for(let option of cell.options){
            validOptions = validOptions.concat(tiles[option].adjacencies[dir]);
        }

        // if you add braces to => {}, you need to add a return statement.
        adjacentCell.options = adjacentCell.options.filter(opt => validOptions.includes(opt));

        // Early exit: if this adjacent cell is now empty, it's already a failure
        if(adjacentCell.options.length === 0) return false;

        // recursively reduce entropy for each adjacent cell -- more propagation
        // if it returns false, bubble it up
        if(!reduceEntropy(grid, adjacentCell, depth + 1)){
            return false;
        }
    }

    return true;
}