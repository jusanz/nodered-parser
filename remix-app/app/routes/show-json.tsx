import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { get } from "~/utils/parserApi.server";

export const loader = async () => {
  const flows = await get("http://parser:8080/flows-json-text");
  return json({ flows });
};

export default function ShowJson() {
  const data = useLoaderData<typeof loader>();
  return (
    <div className="w-full">
      <div className="flex justify-center">
        <h1 className="text-xl tracking-normal font-semibold">flows.json</h1>
      </div>
      <div className="flex justify-center mt-6">
        <pre>{data?.flows}</pre>
      </div>
    </div>
  );
}
