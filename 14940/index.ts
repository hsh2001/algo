// https://www.acmicpc.net/problem/14940

import { readFileSync } from "fs";

enum Tile {
  WALL = 0,
  ROAD = 1,
  DESTINATION = 2,
}

class World {
  constructor(readonly n: number, readonly m: number, readonly map: Tile[][]) {}
}

class InputHandler {
  readonly n: number;
  readonly m: number;
  readonly world: World;

  private constructor(readonly rawInput: string) {
    const [n, m] = rawInput
      .split("\n")[0]
      .trim()
      .split(" ")
      .map((v) => +v);

    this.n = n;
    this.m = m;

    const tiles = rawInput
      .split("\n")
      .slice(1)
      .map(
        (row) =>
          row
            .trim()
            .split(" ")
            .map((v) => +v) as Tile[]
      );

    const world = new World(n, m, tiles);
    this.world = world;
  }

  static getTestInput() {
    return new InputHandler(`15 15
2 1 1 1 1 1 1 1 1 1 1 1 1 1 1
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
1 1 1 1 1 1 1 1 1 1 0 0 0 0 1
1 1 1 1 1 1 1 1 1 1 0 1 1 1 1
1 1 1 1 1 1 1 1 1 1 0 1 0 0 0
1 1 1 1 1 1 1 1 1 1 0 1 1 1 1`);
  }

  static getBackjunInput() {
    return new InputHandler(readFileSync("/dev/stdin", "utf-8").trim());
  }
}

class ProblemSolver {
  constructor(readonly input: InputHandler) {}

  private isMoveable({ x, y }: { x: number; y: number }) {
    return (
      Tile.WALL != this.input.world.map[x]?.[y] &&
      x >= 0 &&
      y >= 0 &&
      x < this.input.world.n &&
      y < this.input.world.m
    );
  }

  private isGoal({ x, y }: { x: number; y: number }) {
    return Tile.DESTINATION == this.input.world.map[x]?.[y];
  }

  private findGoal() {
    for (let i = 0; i < this.input.world.n; i++) {
      for (let j = 0; j < this.input.world.m; j++) {
        if (this.isGoal({ x: i, y: j })) {
          return { x: i, y: j };
        }
      }
    }

    throw new Error("Goal not found");
  }

  // 각 지점에서 목표지점까지의 거리를 출력한다. 원래 갈 수 없는 땅인 위치는 0을 출력하고, 원래 갈 수 있는 땅인 부분 중에서 도달할 수 없는 위치는 -1을 출력한다.
  solve() {
    // 골 지점에서 사방으로 뻗어나가면서 거리를 측정한다.
    const distanceMap = Array.from({ length: this.input.world.n }, () =>
      Array.from({ length: this.input.world.m }, () => 0)
    );

    const goal = this.findGoal();

    const queue = [goal];
    const visited = new Set<string>();
    visited.add(`${goal.x},${goal.y}`);

    while (queue.length > 0) {
      const { x, y } = queue.shift() as { x: number; y: number };

      const distance = distanceMap[x][y];

      [
        { x: x - 1, y },
        { x: x + 1, y },
        { x, y: y - 1 },
        { x, y: y + 1 },
      ].forEach((next) => {
        const [nx, ny] = [next.x, next.y];

        if (this.isMoveable(next) && !visited.has(`${nx},${ny}`)) {
          distanceMap[nx][ny] = distance + 1;
          visited.add(`${nx},${ny}`);
          queue.push(next);
        }
      });
    }

    for (let i = 0; i < this.input.world.n; i++) {
      for (let j = 0; j < this.input.world.m; j++) {
        if (!visited.has(`${i},${j}`)) {
          distanceMap[i][j] = -1;
        }

        if (Tile.WALL == this.input.world.map[i]?.[j]) {
          distanceMap[i][j] = 0;
        }
      }
    }

    return distanceMap;
  }
}

class OutputHandler {
  constructor(readonly input: InputHandler) {}

  print() {
    const solver = new ProblemSolver(this.input);
    const distanceMap = solver.solve();

    console.log(distanceMap.map((row) => row.join(" ")).join("\n"));
  }
}

const input = InputHandler.getTestInput();
const output = new OutputHandler(input);
output.print();
