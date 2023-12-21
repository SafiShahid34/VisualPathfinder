import React, {Component} from 'react';
import Node from './Node/Node';
import {dijkstra, getNodesInShortestPathOrder} from '../algorithms/dijkstra';

import './PathfindingVisualizer.css';

const START_NODE_ROW = 10;
const START_NODE_COL = 15;
const FINISH_NODE_ROW = 10;
const FINISH_NODE_COL = 35;

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      mouseIsPressed: false,
      changingStartNode: false,
      changingFinishNode: false,
    };
  }

  setStartNodeMode = () => {
    this.setState({ changingStartNode: true, changingFinishNode: false });
  };

  setFinishNodeMode = () => {
    this.setState({ changingFinishNode: true, changingStartNode: false });
  };

  componentDidMount() {
    const grid = getInitialGrid();
    this.setState({grid});
  }

  updateNodePosition(grid, row, col) {
    const newGrid = grid.slice();
    for (let r = 0; r < newGrid.length; r++) {
      for (let c = 0; c < newGrid[r].length; c++) {
        // Reset the current start or finish node
        if (this.state.changingStartNode && newGrid[r][c].isStart) {
          newGrid[r][c].isStart = false;
        }
        if (this.state.changingFinishNode && newGrid[r][c].isFinish) {
          newGrid[r][c].isFinish = false;
        }
      }
    }
    // Set the new start or finish node
    newGrid[row][col].isStart = this.state.changingStartNode;
    newGrid[row][col].isFinish = this.state.changingFinishNode;
    return newGrid;
  }
  

  handleMouseDown(row, col) {
    // Check if we are in the mode to change the start or finish node
    if (this.state.changingStartNode || this.state.changingFinishNode) {
      // Update the grid with the new start or finish node position
      const newGrid = this.updateNodePosition(this.state.grid, row, col);
  
      // Update the state with the new grid and reset the node-changing modes
      this.setState({ 
        grid: newGrid, 
        changingStartNode: false, 
        changingFinishNode: false 
      });
  
      return; // Exit the function to avoid executing wall toggle logic
    }
  
    // Existing logic to toggle walls, if not in node-changing mode
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({ grid: newGrid, mouseIsPressed: true });
  }
  

  handleMouseEnter(row, col) {
    if (!this.state.mouseIsPressed) return;
    const newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
    this.setState({grid: newGrid});
  }

  handleMouseUp() {
    this.setState({mouseIsPressed: false});
  }

  animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder) {
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, 10 * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
      }, 10 * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path';
      }, 50 * i);
    }
  }

  visualizeDijkstra() {
    const { grid } = this.state;
    const startNode = this.findNode(grid, node => node.isStart);
    const finishNode = this.findNode(grid, node => node.isFinish);
    const visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateDijkstra(visitedNodesInOrder, nodesInShortestPathOrder);
  }

  findNode(grid, conditionFunction) {
    for (const row of grid) {
      for (const node of row) {
        if (conditionFunction(node)) {
          return node;
        }
      }
    }
    return null; // Node not found
  }

  clearGrid = () => {
    const newGrid = this.state.grid.map(row => {
      return row.map(node => {
        // Reset the properties related to pathfinding visualization
        const newNode = {
          ...node,
          isVisited: false,
          distance: Infinity,
          previousNode: null,
        };
        // Reset the class name for each node element to its original state
        const nodeElement = document.getElementById(`node-${node.row}-${node.col}`);
        nodeElement.className = 'node' + 
                                 (node.isStart ? ' node-start' : '') +
                                 (node.isFinish ? ' node-finish' : '') +
                                 (node.isWall ? ' node-wall' : '');
  
        return newNode;
      });
    });
  
    this.setState({ grid: newGrid });
  };

  clearWalls = () => {
    const newGrid = this.state.grid.map(row => {
      return row.map(node => {
        return {
          ...node,
          isWall: false
        };
      });
    });
  
    this.setState({ grid: newGrid });
    // Reset any additional UI elements or states if necessary
  };

  
  
  render() {
    const {grid, mouseIsPressed} = this.state;

    return (
      <>
        <div className='ButtCont'>
            <button className='Butt' onClick={this.setStartNodeMode}>
            Change Start Node
            </button>
            <button className='Butt' onClick={this.setFinishNodeMode}>
            Change End Node
            </button>
            <button className='Butt' onClick={() => this.visualizeDijkstra()}>
            Visualize Dijkstra's Algorithm
            </button>
            <button className='Butt' onClick={this.clearGrid}>
                Clear Grid
            </button>
            <button className='Butt' onClick={this.clearWalls}>
                Clear Walls
            </button>
        </div>
        
        <div className='grindCont'>
            <div className="grid">
            {grid.map((row, rowIdx) => {
                return (
                <div key={rowIdx}>
                    {row.map((node, nodeIdx) => {
                    const {row, col, isFinish, isStart, isWall} = node;
                    return (
                        <Node
                        key={nodeIdx}
                        col={col}
                        isFinish={isFinish}
                        isStart={isStart}
                        isWall={isWall}
                        mouseIsPressed={mouseIsPressed}
                        onMouseDown={(row, col) => this.handleMouseDown(row, col)}
                        onMouseEnter={(row, col) =>
                            this.handleMouseEnter(row, col)
                        }
                        onMouseUp={() => this.handleMouseUp()}
                        row={row}></Node>
                    );
                    })}
                </div>
                );
            })}
            </div>

        </div>
        
      </>
    );
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row < 20; row++) {
    const currentRow = [];
    for (let col = 0; col < 50; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: row === START_NODE_ROW && col === START_NODE_COL,
    isFinish: row === FINISH_NODE_ROW && col === FINISH_NODE_COL,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    previousNode: null,
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};