# Wave-Function-Collapse
Wave Function Collapse is a family of constraint-solving algorithms commonly used in procedural generation. It generates a set combination of patterns from local patterns from a given source image. This repository optimizes the implementation of the **overlapping model** based on [The Coding Train's implementation](https://www.youtube.com/watch?v=5iSAvzU2WYY) (p5.js).


## Overview
Think of a grid of cells where each cell contains a number of possible tiles it can take on. At a high level, wave function collapse mimics the wave function in quantum mechanics, where each cell in a grid is in a superposition of multiple possibilities.

You first would extract all possible local patterns ($3 \times 3$ tiles) from the source image and compute their adjacency rules using a model (overlapping or tiled). Each cell of the grid is in a superposition, and thus we will calculate the entropy of each cell to choose a cell to collapse. Intuitively, lower entropy on a cell means that information on that cell is more predictable than on other cells, so we will collapse a cell with the least entropy.

The collapse of one cell will affect the entropy of its adjacent cells (since there will be less options from the adjacency rules), and reducing the entropy of these adjacent cells can also trigger a chain effect that propagates entropy reduction to even more adjacent cells. So, from the initial collapse, we must also take into account the effects of reducing the entropy propagated to its adjacent cells.


## Algorithm

### Local Patterns
Extracting local patterns from a source image involves a "sliding tile" approach where you read every possible $3\times3$ pattern. These local patterns can also undergo rotation and reflection to produce even more patterns to be used in the procedural generation. Each local pattern will have its own frequency count, and duplicate patterns will be stored as some frequency for that unique pattern. These frequency counts will be used to calculate the entropy for each pattern and when collapsing least entropy patterns.

### Adjacency Rules
From all the extracted local patterns, it tries to find overlapping pixels with every other extracted local pattern. The direction of the overlap (which tile is considered to be the source and which is the adjacent cell) will determine the direction of the adjacency rule, e.g., tile B must appear to the right of tile A.

### Entropy Calculation
In information entropy, given a random variable $X$ which can take on any values  $x \in \mathcal{X}$ with a given probability $p(x)$, the entropy is calculated as
$$-\sum_{x\in\mathcal{X}}{p(x)\log p(x)}$$
In the context of WFC, the random variable $X$ is the event a particular local pattern collapses in a cell. In other words, every value $x \in \mathcal{X}$ represents a pattern and $p(x)$ is the probability that a cell collapses to that pattern. To find the weights $p(x)$, we simply take the frequency count of a pattern and divide it by the total frequency of all patterns in a cell. Hence, every cell will have an entropy that determines the likelihood of a cell to be collapsed.

### Collapsing and Propagation
In the first iteration, we would (uniformly) choose a random cell from the set of cells that have the least entropy to collapse. Then, using the frequency counts of each pattern in a cell, randomly, with weights, pick a pattern from the set of patterns. Once the first cell is collapsed, this will reduce the entropy of the cells adjacent to it. The updated entropy of each adjacent cell will update the entropy of its adjacent cells. This repository implements breadth-first search and backtracking for propagation.

## External Links and Resources
- [Paper: WFC is Constraint Solving in the Wild](https://escholarship.org/content/qt1f29235t/qt1f29235t.pdf)
- [The Coding Train's Implementation of WFC](https://www.youtube.com/watch?v=5iSAvzU2WYY)
- [Gridbugs Implementation of WFC](https://www.gridbugs.org/wave-function-collapse/)
- [Redditor's Tips when Implementing WFC](https://www.fxhash.xyz/article/lessons-learned-from-implementing-%22wave-function-collapse%22)