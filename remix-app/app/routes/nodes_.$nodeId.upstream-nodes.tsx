import { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useEffect } from "react";

import Table from "~/components/Table";
import type { Node } from "~/types/Node";

export const loader = async ({ request, params }: LoaderArgs) => {
  const nodeId = params.nodeId;
  const url = new URL(request.url);

  const response = await fetch(
    `http://parser:8080/nodes/${nodeId}/upstream-nodes?${url.searchParams.toString()}`
  );
  let nodes: Node[] = await response.json();
  if (nodes === null) return json({ nodes: [], tabs: [] });

  const tabs = new Map(
    nodes
      .filter((node) => typeof node.label !== "undefined")
      .map((node) => [node.id, node.label])
  );

  nodes = nodes.map((node) => {
    if (typeof node.label !== "undefined") {
      node.tab = node.label;
      return node;
    }
    const tab = tabs.get(node.z);
    if (typeof tab === "undefined") {
      return node;
    }
    node.tab = tab;
    return node;
  });
  return json({ nodes, tabs });
};

export default function Nodes() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const data = useLoaderData<typeof loader>();

  useEffect(() => {
    const nodes = data.nodes.map((node) => {
      node.selected = false;
      return node;
    });
    setNodes(nodes);
  }, [data]);

  return (
    <div className="w-full px-10 py-10">
      <div className="flex justify-center">
        <h1 className="text-xl tracking-normal font-semibold">Nodes</h1>
      </div>
      {Table({ nodes })}
    </div>
  );
}
