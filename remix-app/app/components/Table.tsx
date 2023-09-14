import { useState, useEffect, useRef } from "react";
import { Link } from "@remix-run/react";

import type { Node } from "~/types/Node";
import TableHeading from "~/components/TableHeading";

export default function Table({ nodes }: { nodes: Node[] }) {
  const [_nodes, setNodes] = useState<Node[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterBy, setFilterBy] = useState<"name" | "tab" | "type">("name");
  const [filterQuery, setFilterQuery] = useState("");

  useEffect(() => {
    setNodes(nodes);
  }, [nodes]);

  const onQueryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterQuery(event.target.value);
  };

  useEffect(() => {
    const _nodes = nodes.filter((node) => {
      if (filterBy === "name") {
        if (typeof node.name === "undefined") return false;
        return node.name.includes(filterQuery);
      } else if (filterBy === "tab") {
        if (typeof node.tab === "undefined") return false;
        return node.tab.includes(filterQuery);
      } else {
        if (typeof node.type === "undefined") return false;
        return node.type.includes(filterQuery);
      }
    });
    setNodes(_nodes);
  }, [filterQuery, filterBy]);

  return (
    <div className="w-full flex justify-center mt-6">
      <div className="w-full relative overflow-x-auto">
        <div className="pb-4 bg-white">
          <label htmlFor="table-search" className="sr-only">
            Search
          </label>
          <div className="flex">
            <button
              id="dropdown-button"
              data-dropdown-toggle="dropdown"
              className="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-l-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-300"
              type="button"
              onClick={() => {
                setShowDropdown(!showDropdown);
              }}
            >
              Filter by{" "}
              {filterBy === "name"
                ? "Name"
                : filterBy === "tab"
                ? "Tab"
                : "Type"}
              <svg
                className="ml-2 w-4 h-4 text-gray-500 dark:text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-500 dark:text-gray-400"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 20 20"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                  />
                </svg>
              </div>
              <input
                type="text"
                id="table-search"
                className="block p-2 py-2.5 pl-10 text-sm text-gray-900 border border-gray-300 rounded-r-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                onChange={onQueryChange}
              />
            </div>
          </div>
        </div>

        {showDropdown && (
          <div
            id="dropdown"
            className="z-10 absolute bg-white divide-y divide-gray-100 rounded-lg shadow w-44"
          >
            <ul
              className="py-2 text-sm text-gray-700"
              area-labelledby="dropdown-button"
            >
              <li>
                <span
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setFilterBy("type");
                    setShowDropdown(false);
                  }}
                >
                  Type
                </span>
              </li>
              <li>
                <span
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setFilterBy("tab");
                    setShowDropdown(false);
                  }}
                >
                  Tab
                </span>
              </li>
              <li>
                <span
                  className="block px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setFilterBy("name");
                    setShowDropdown(false);
                  }}
                >
                  Name
                </span>
              </li>
            </ul>
          </div>
        )}

        <table className="w-full text-sm text-left text-gray-500 min-h-screen">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                {TableHeading({
                  title: "ID",
                })}
              </th>
              <th scope="col" className="px-6 py-3">
                {TableHeading({
                  title: "Type",
                })}
              </th>
              <th scope="col" className="px-6 py-3">
                {TableHeading({ title: "Tab" })}
              </th>
              <th scope="col" className="px-6 py-3">
                {TableHeading({ title: "Name" })}
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Downstream Nodes</span>
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Upstream Nodes</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {_nodes.map((node: Node) => (
              <tr className="bg-white border-b" key={node.id}>
                <th
                  scope="row"
                  className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                >
                  {node.id}
                </th>
                <td className="px-6 py-4">{node.type}</td>
                <td className="px-6 py-4">{node.tab}</td>
                <td className="px-6 py-4">{node.name}</td>
                <td className="items-center px-6 py-4 space-x-3">
                  <Link
                    to={`/nodes/${node.id}/downstream-nodes`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Downstream Nodes
                  </Link>
                </td>
                <td className="items-center px-6 py-4 space-x-3">
                  <Link
                    to={`/nodes/${node.id}/upstream-nodes`}
                    className="font-medium text-blue-600 hover:underline"
                  >
                    Upstream Nodes
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
