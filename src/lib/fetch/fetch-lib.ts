import useProgressStore from "@/features/progress/progress-store";
import { Fetcher, QueryPost } from "@/utils/api/fetch";
import axios from "axios";

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




export const FetchDownloadFile = async (url: string, progress: (value: number) => void, fileName: string) => {
  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          progress?.(percentCompleted)
        }
      },
      timeout: 3600000,
    });
    const file = new File([response.data], fileName, { type: 'application/octet-stream' });
    return file
  } catch (error) {
    console.error("Download error:", error);
    return undefined
  }
}



export const useDownloadWithProgress = async (url: string, fileName: string) => {
  const setProgress = useProgressStore.getState().setProgress
  const setAbortController = useProgressStore.getState().setAbortController

  const controller = new AbortController();

  setAbortController(controller);

  setProgress({
    progress: 0,
    title: `กำลังดาวน์โหลด ${fileName}`,
    show: true,
    loading: true,
    cancel: true
  });

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'blob',
      signal: controller.signal,
      onDownloadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress({
            progress: percentCompleted,
            title: `กำลังดาวน์โหลด ${fileName} (${percentCompleted}%)`,
            show: true,
            loading: true,
            cancel: true
          });
        }
      },
      timeout: 3600000,
    });

    const file = new File([response.data], fileName, { type: 'application/octet-stream' });

    setProgress({
      progress: 100,
      title: "ดาวน์โหลดสำเร็จ",
      show: true,
      loading: false,
    });

    setAbortController(undefined);

    return file
  } catch (error: any) {
    if (error.name === 'CanceledError' || axios.isCancel(error)) {
      console.log('Download canceled');
      setProgress({
        progress: 0,
        title: "ดาวน์โหลดไม่สำเร็จ",
        show: true,
        loading: false,
        error: "ยกเลิกการดาวน์โหลดแล้ว"
      });
    } else {
      console.error("Download error:", error);
      setProgress({
        progress: 0,
        title: "ดาวน์โหลดไม่สำเร็จ",
        show: true,
        loading: false,
        error: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดระหว่างการดาวน์โหลด',
      });
    }
    setAbortController(undefined);
  }
};