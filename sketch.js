let img;
let tiles;
let GRID_SIZE = 100;
let w;
let grid;
let changeLog;
let backtrackCount = 0;

const QUEUE_CAP = GRID_SIZE * GRID_SIZE;
const TILE_SIZE = 3;
const MAX_BACKTRACK = 70;

// Turn on or off rotations and reflections
const ROTATIONS = true;
const REFLECTIONS = true;

function preload(){
    img = loadImage("/images/flowers.png");
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

    for(let cell of grid){
        cell.calculateEntropy();
    }
}

function restoreGrid(changes){
    // changes contain elements in the form of (cellIndex, saved : {options, collapsed, previousTotalOptions})
    for(let [index, saved] of changes){
        grid[index].options = saved.options;
        grid[index].collapsed = saved.collapsed;
        grid[index].previousTotalOptions = saved.previousTotalOptions;
        grid[index].entropy = saved.entropy;
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
    }
    

    wfc();
    // noLoop();
}

// WAVE FUNCTION COLLAPSE
function wfc(){
    // for every WFC step, save a snapshot of the changed cells
    changeLog = new Map();

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
        backtrackCount = 0;
        return;
    }

    // Collapse a cell
    const cell = random(lowestEntropyCells); // random() is a p5.js-specific function
    const pick = weightedRandom(cell.options);
    if(pick === -1){
        console.log("ran out of options -- backtracking");
        restoreGrid(changeLog);
        return;
    }

    // Save the snapshot of the to-be-collapsed cell before collapsing
    saveSnapshot(changeLog, cell.index, cell);

    cell.collapsed = true;
    cell.options = [pick];

    // Propagate adjacent cells
    if(!propagateEntropyReduction(grid, cell, changeLog)){
        console.log("ran out of options -- backtracking");
        restoreGrid(changeLog);
        backtrackCount++;
        if(backtrackCount >= MAX_BACKTRACK){
            backtrackCount = 0;
            initializeGrid();
        }
        return;
    }

    // After the first entropy reduction, we scan the grid for collapse-able cells
    for(let cell of grid){
        if(cell.options.length == 1){
            cell.collapsed = true;
            if(!propagateEntropyReduction(grid, cell, changeLog)){
                console.log("ran out of options -- backtracking");
                restoreGrid(changeLog);
                backtrackCount++;
                if(backtrackCount >= MAX_BACKTRACK){
                    backtrackCount = 0;
                    initializeGrid();
                }
                return;
            }
        }
    }
}

function weightedRandom(tileOptions){
    console.assert(tileOptions.length <= tiles.length);
    let cumFreq = new Array(tileOptions.length).fill(0);

    // Calculate cumulative frequency of all tiles
    // tileOptions[i] is the tile index. i is just a counter variable to loop through tileOptions
    cumFreq[0] = tiles[tileOptions[0]].frequency;
    for(let i = 1; i < tileOptions.length; i++){
        cumFreq[i] = tiles[tileOptions[i]].frequency + cumFreq[i-1];
    }

    let min = 0;
    let max = cumFreq[cumFreq.length - 1];
    let randomNumber = getRandomArbitrary(min, max);

    for(let i = 0; i < cumFreq.length; i++){
        if(cumFreq[i] >= randomNumber){
            return tileOptions[i];
        }
    }
    return -1;
}

function getRandomArbitrary(min, max){
    return Math.random() * (max - min) + min;
}

// bfs implementation of propagation
function propagateEntropyReduction(grid, cell, changeLog){
    let visited = new Set([cell.index]); // track visited nodes
    let queue = new Queue(QUEUE_CAP); // stores indices of cells
    queue.enqueue(cell.index);

    while(!queue.isEmpty()){
        // pop one node from the queue 
        let currentIndex = queue.dequeue();
        let currentCell = grid[currentIndex];

        // add neighbors to the queue
        let col = floor(currentIndex % GRID_SIZE);
        let row = floor(currentIndex / GRID_SIZE);

        let adjacentCells = [];

        // right
        if(col + 1 < GRID_SIZE) adjacentCells.push(currentIndex + 1);
        // left
        if(col - 1 >= 0) adjacentCells.push(currentIndex - 1);
        // up
        if(row - 1 >= 0) adjacentCells.push(currentIndex - GRID_SIZE);
        // down
        if(row + 1 < GRID_SIZE) adjacentCells.push(currentIndex + GRID_SIZE);

        for(let adjacentIndex of adjacentCells){
            // For each adjacent cell
            if(!visited.has(adjacentIndex)){
                // Reduce the options by: concatenating all possible tile options from THIS cell (parent node)
                // and intersecting them with the currently available tile options from ADJACENT cell

                let adjacentCell = grid[adjacentIndex];
                let currentAdjacentOptions = adjacentCell.options;
                let validOptions = new Set();

                if(adjacentIndex == currentIndex + 1){
                    // Right

                    // Save a snapshot of the changed cells before entropy reduction
                    if(!changeLog.has(adjacentIndex)){
                        saveSnapshot(changeLog, adjacentIndex, adjacentCell);
                    }

                    reduceAdjacentEntropy(currentCell, adjacentCell, validOptions, R);

                    // catch 0-option cell and bubble up error
                    if(adjacentCell.options.length === 0) return false;

                    visited.add(adjacentIndex); // mark visited immediately
                
                    // Compare old adjacent options and new adjacent options after reducing entropy
                    if(!arrayEquals(currentAdjacentOptions, adjacentCell.options)){
                       // only enqueue if there's new information to propagate
                       queue.enqueue(adjacentIndex); 
                    }
                }else if(adjacentIndex == currentIndex - 1){
                    // Left

                    // Save a snapshot of the changed cells before entropy reduction
                    if(!changeLog.has(adjacentIndex)){
                        saveSnapshot(changeLog, adjacentIndex, adjacentCell);
                    }

                    reduceAdjacentEntropy(currentCell, adjacentCell, validOptions, L);

                    if(adjacentCell.options.length === 0) return false;

                    visited.add(adjacentIndex); // mark visited immediately

                    if(!arrayEquals(currentAdjacentOptions, adjacentCell.options)){
                       // only enqueue if there's new information to propagate
                       queue.enqueue(adjacentIndex); 
                    }
                }else if(adjacentIndex == currentIndex - GRID_SIZE){
                    // Up
                    
                    // Save a snapshot of the changed cells before entropy reduction
                    if(!changeLog.has(adjacentIndex)){
                        saveSnapshot(changeLog, adjacentIndex, adjacentCell);
                    }

                    reduceAdjacentEntropy(currentCell, adjacentCell, validOptions, U);

                    if(adjacentCell.options.length === 0) return false;

                    visited.add(adjacentIndex); // mark visited immediately

                    if(!arrayEquals(currentAdjacentOptions, adjacentCell.options)){
                       // only enqueue if there's new information to propagate
                       queue.enqueue(adjacentIndex); 
                    }
                }else if(adjacentIndex == currentIndex + GRID_SIZE){
                    // Down
                    
                    // Save a snapshot of the changed cells before entropy reduction
                    if(!changeLog.has(adjacentIndex)){
                        saveSnapshot(changeLog, adjacentIndex, adjacentCell);
                    }

                    reduceAdjacentEntropy(currentCell, adjacentCell, validOptions, D);

                    if(adjacentCell.options.length === 0) return false;

                    visited.add(adjacentIndex); // mark visited immediately

                    if(!arrayEquals(currentAdjacentOptions, adjacentCell.options)){
                       // only enqueue if there's new information to propagate
                       queue.enqueue(adjacentIndex); 
                    }
                }
            }
        }
    }
    return true;
}

// Save a snapshot of the changed cells (options, collapsed, previousTotalOptions, entropy)
function saveSnapshot(changeLog, index, cell){
     changeLog.set(index, {
                            options: [...cell.options], // [...x] is the spread operator that creates a shallow copy
                            collapsed: cell.collapsed,
                            previousTotalOptions: cell.previousTotalOptions,
                            entropy: cell.entropy
                        });
}

// Reduce entropy of one adjacent cell
function reduceAdjacentEntropy(currentCell, adjacentCell, validOptions, dir){
    for(let option of currentCell.options){
        for(let adj of tiles[option].adjacencies[dir]){
            validOptions.add(adj);
        }
    }

    adjacentCell.options = adjacentCell.options.filter(opt => validOptions.has(opt));
    adjacentCell.calculateEntropy();
}