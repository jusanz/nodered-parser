import type { V2_MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";

export const meta: V2_MetaFunction = () => {
  return [
    { title: "Node-RED Parser}" },
    { name: "description", content: "Node-RED Parser" },
  ];
};

export default function Index() {
  return (
    <div className="w-full">
      <Link
        to="/show-json"
        className="bg-blue-500 hover:bg-blue-700 text-white fond-bold py-2 px-4 rounded"
      >
        Show flows.json
      </Link>
    </div>
  );
}
