import { Fetcher, QueryPost } from "@/utils/api/fetch";

export const testUrl = async (url: string): Promise<any> => {
  const form = QueryPost({
    test: "TEST",
  });
  const res = await Fetcher(url, form, "TEST", { method: "POST" });
  if (res.fun === "TEST") {
    return true;
  } else {
    return false;
  }
};
