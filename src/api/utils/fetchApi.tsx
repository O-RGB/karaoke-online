async function FetchApi<T>(
  api: string,
  method: string = "POST",
  data?: any,
): Promise<T> {
  return fetch(api, {
    method: method,
    body: JSON.stringify(data),
    headers: new Headers({ "content-type": "application/json" }),
  })
    .then((r) => r.json())
    .then((data) => {
      return data;
    });
}

export default FetchApi;
