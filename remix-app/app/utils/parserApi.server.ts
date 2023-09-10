export const get = async (url: string) => {
  const response = await fetch(url, {
    method: "GET",
  });
  const text = await response.text();
  return text;
};
