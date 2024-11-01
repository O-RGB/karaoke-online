// const NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL;
export function QueryPost(params: any): FormData {
  const formData = new FormData();
  Object.keys(params).map((key) => {
    if (params[key] !== undefined) {
      if (Array.isArray(params[key])) {
        formData.append(key, JSON.stringify(params[key]));
      } else {
        formData.append(key, params[key]);
      }
    }
  });

  return formData;
}

export async function Fetcher<Input = any, Result = any>(
  url: string,
  data: any,
  action: "TEST" | "LOAD" | "SAVE_MUSIC" | "SAVE" | "CHECK_UPDATE",
  init?: RequestInit
): Promise<any> {
  //POST
  var formParam: FormData | undefined = QueryPost(data);

  if (formParam) {
    formParam.set("fun", action);
  }

  //FETCH
  return await fetch(url, {
    method: init?.method ?? "POST",
    body: formParam,
  })
    .then((response) => {
      return response.json();
    })
    .catch((error) => {
      return {
        success: false,
        message: error,
      };
    });
}
