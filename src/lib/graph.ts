import * as R from "remeda";

export function topologicallySortedNodes<N>(
  edges: ReadonlyArray<readonly [N, N]>,
): N[] {
  interface Node<K> {
    outgoing: K[];
    inDegree: number;
    order: number;
  }

  const graph = new Map<N, Node<N>>();

  for (const [index, [from, to]] of edges.entries()) {
    if (!graph.has(from))
      graph.set(from, { outgoing: [], inDegree: 0, order: index });
    const fromNode = graph.get(from)!;
    fromNode.outgoing.push(to);
    fromNode.order = index;

    if (!graph.has(to))
      graph.set(to, { outgoing: [], inDegree: 0, order: index });
    const toNode = graph.get(to)!;
    toNode.inDegree++;
    toNode.order = index;
  }

  const pq = new PriorityQueue<N>();
  for (const [key, node] of graph.entries()) {
    if (node.inDegree === 0) {
      pq.enqueue(key, node.order);
    }
  }

  const result: N[] = [];
  while (!pq.isEmpty()) {
    const key = pq.dequeue()!;
    result.push(key);

    const node = graph.get(key)!;
    for (const outgoing of node.outgoing) {
      const neighbor = graph.get(outgoing)!;
      if (--neighbor.inDegree === 0) {
        pq.enqueue(outgoing, neighbor.order);
      }
    }
  }

  if (result.length !== graph.size) {
    throw new GraphCycleError();
  }

  return result;
}

export class GraphCycleError extends Error {
  message = "The graph has at least one cycle";
}

class PriorityQueue<T> {
  private readonly items: { priority: number; value: T }[] = [];

  enqueue(value: T, priority: number) {
    const index = R.sortedIndexWith(this.items, (i) => i.priority <= priority);
    this.items.splice(index, 0, { priority, value });
  }

  dequeue(): T | undefined {
    return this.items.shift()?.value;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}
