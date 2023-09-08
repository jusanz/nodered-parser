export const flowsJsonText = async () => {
  const response = await fetch("http://parser:8080/flows-json-text", {
    method: "GET",
  });
  const text = await response.text();
  return text;
};
