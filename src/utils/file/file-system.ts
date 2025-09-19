import { DircetoryLocalSongsManager } from "../indexedDB/db/local-songs/table";

type DirectoryStatus = "GRANTED" | "PROMPT_REQUIRED" | "SELECTION_NEEDED";

class FileSystemManager {
  private pathId: number = 1;
  private static instance: FileSystemManager;
  private rootHandle: FileSystemDirectoryHandle | null = null;
  private fileSystemStore = new DircetoryLocalSongsManager();

  private constructor() {
    this.init();
  }

  async init() {
    const savedHandle = await this.fileSystemStore.get(this.pathId);
    if (savedHandle) {
      this.rootHandle = savedHandle.handle;
    }
  }

  static getInstance(): FileSystemManager {
    if (!FileSystemManager.instance) {
      FileSystemManager.instance = new FileSystemManager();
    }
    return FileSystemManager.instance;
  }

  async selectDirectory(): Promise<FileSystemDirectoryHandle> {
    if (!("showDirectoryPicker" in window)) {
      throw new Error("File System Access API ไม่รองรับในเบราว์เซอร์นี้");
    }

    const handle = await window.showDirectoryPicker();
    this.rootHandle = handle;
    await this.fileSystemStore.add({ id: this.pathId, handle });
    return handle;
  }

  async getRootHandle(): Promise<FileSystemDirectoryHandle> {
    if (this.rootHandle) {
      return this.rootHandle;
    }

    const savedHandle = await this.queryPermission();
    if (savedHandle) {
      this.rootHandle = savedHandle;
      return savedHandle;
    }

    return await this.selectDirectory();
  }

  async queryPermission(): Promise<FileSystemDirectoryHandle | null> {
    const savedHandle = await this.fileSystemStore.get(this.pathId);
    if (savedHandle) {
      try {
        console.log("Permission ...");
        const permission = await savedHandle.handle.queryPermission();

        // ตรวจสอบ permission status
        if (permission === "granted") {
          this.rootHandle = savedHandle.handle;
          console.log("Permission granted");
          return savedHandle.handle;
        } else if (permission === "prompt") {
          // ถ้า permission เป็น prompt ให้ขอ permission
          const newPermission = await savedHandle.handle.requestPermission();
          if (newPermission === "granted") {
            this.rootHandle = savedHandle.handle;
            console.log("Permission granted after request");
            return savedHandle.handle;
          }
        }

        console.log("Permission denied or not available");
        return null;
      } catch (error) {
        console.log("Error checking permission:", error);
        return null;
      }
    }

    console.log("No saved handle found");
    return null;
  }

  async getFileByPath(path: string): Promise<File | undefined> {
    console.log(path);
    const rootHandle = await this.getRootHandle();
    const pathParts = path.split("/").filter((part) => part.length > 0);

    let currentHandle: FileSystemDirectoryHandle | FileSystemFileHandle =
      rootHandle;

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      console.log(part);

      if (i === pathParts.length - 1) {
        if (currentHandle.kind !== "directory") {
          throw new Error(`${pathParts.slice(0, i).join("/")} ไม่ใช่โฟลเดอร์`);
        }

        const fileHandle = await (
          currentHandle as FileSystemDirectoryHandle
        ).getFileHandle(part);
        return await fileHandle.getFile();
      } else {
        if (currentHandle.kind !== "directory") {
          throw new Error(`${pathParts.slice(0, i).join("/")} ไม่ใช่โฟลเดอร์`);
        }

        currentHandle = await (
          currentHandle as FileSystemDirectoryHandle
        ).getDirectoryHandle(part);
      }
    }

    throw new Error("ไม่พบไฟล์");
  }

  /**
   * ฟังก์ชันสำหรับลิสต์ไฟล์ทั้งหมด (เฉพาะ kind: 'file') ในโฟลเดอร์ที่ระบุ
   */
  async listFiles(path: string = ""): Promise<File[]> {
    // 1. ใช้ฟังก์ชันที่มีอยู่แล้วเพื่อหา handle ของโฟลเดอร์เป้าหมาย
    const directoryHandle = await this.getDirectoryByPath(path, "listFiles");

    const files: File[] = [];

    // 2. วนลูปอ่าน entries ทั้งหมดในโฟลเดอร์
    for await (const entry of directoryHandle.values()) {
      // 3. ตรวจสอบว่า entry เป็นไฟล์หรือไม่ (ข้ามโฟลเดอร์ย่อย)
      if (entry.kind === "file") {
        // 4. หากเป็นไฟล์ ให้แปลง FileSystemFileHandle เป็นอ็อบเจกต์ File
        const file = await entry.getFile();
        files.push(file);
      }
    }

    // 5. คืนค่าอาร์เรย์ของไฟล์ทั้งหมดที่พบ
    return files;
  }

  // ฟังก์ชันสำหรับสร้างโฟลเดอร์ตามเส้นทาง
  private async createDirectoryPath(
    dirPath: string
  ): Promise<FileSystemDirectoryHandle> {
    const rootHandle = await this.getRootHandle();
    const pathParts = dirPath.split("/").filter((part) => part.length > 0);

    let currentHandle: FileSystemDirectoryHandle = rootHandle;

    for (const part of pathParts) {
      try {
        currentHandle = await currentHandle.getDirectoryHandle(part);
      } catch {
        // ถ้าโฟลเดอร์ไม่มี ให้สร้างใหม่
        currentHandle = await currentHandle.getDirectoryHandle(part, {
          create: true,
        });
      }
    }

    return currentHandle;
  }

  // ฟังก์ชันสำหรับสร้างไฟล์ใหม่
  async createFile(
    path: string,
    content: string | ArrayBuffer | Blob
  ): Promise<void> {
    const pathParts = path.split("/").filter((part) => part.length > 0);

    if (pathParts.length === 0) {
      throw new Error("ต้องระบุชื่อไฟล์");
    }

    const fileName = pathParts.pop()!;
    const dirPath = pathParts.join("/");

    // สร้างโฟลเดอร์ถ้าไม่มี
    const directoryHandle = await this.createDirectoryPath(dirPath);

    // สร้างไฟล์
    const fileHandle = await directoryHandle.getFileHandle(fileName, {
      create: true,
    });
    const writable = await fileHandle.createWritable();

    try {
      if (typeof content === "string") {
        await writable.write(content);
      } else if (content instanceof ArrayBuffer) {
        await writable.write(content);
      } else if (content instanceof Blob) {
        await writable.write(content);
      } else {
        throw new Error("รูปแบบข้อมูลไม่รองรับ");
      }
    } finally {
      await writable.close();
    }
  }

  // ฟังก์ชันสำหรับอัปเดตไฟล์
  async updateFile(
    path: string,
    content: string | ArrayBuffer | Blob
  ): Promise<void> {
    const pathParts = path.split("/").filter((part) => part.length > 0);

    if (pathParts.length === 0) {
      throw new Error("ต้องระบุชื่อไฟล์");
    }

    const fileName = pathParts.pop()!;
    const dirPath = pathParts.join("/");

    // หาโฟลเดอร์
    const directoryHandle = dirPath
      ? await this.getDirectoryByPath(dirPath, "updateFile")
      : await this.getRootHandle();

    // หาไฟล์
    const fileHandle = await directoryHandle.getFileHandle(fileName);
    const writable = await fileHandle.createWritable();

    try {
      if (typeof content === "string") {
        await writable.write(content);
      } else if (content instanceof ArrayBuffer) {
        await writable.write(content);
      } else if (content instanceof Blob) {
        await writable.write(content);
      } else {
        throw new Error("รูปแบบข้อมูลไม่รองรับ");
      }
    } finally {
      await writable.close();
    }
  }

  // ฟังก์ชันสำหรับหาโฟลเดอร์ตาม path
  private async getDirectoryByPath(
    path: string,
    by: string
  ): Promise<FileSystemDirectoryHandle> {
    console.log("Call form: ", by, path);
    const rootHandle = await this.getRootHandle();
    const pathParts = path.split("/").filter((part) => part.length > 0);

    let currentHandle: FileSystemDirectoryHandle = rootHandle;

    for (const part of pathParts) {
      currentHandle = await currentHandle.getDirectoryHandle(part);
    }

    return currentHandle;
  }

  // ฟังก์ชันสำหรับลบไฟล์
  async deleteFile(path: string): Promise<void> {
    const pathParts = path.split("/").filter((part) => part.length > 0);

    if (pathParts.length === 0) {
      throw new Error("ต้องระบุชื่อไฟล์");
    }

    const fileName = pathParts.pop()!;
    const dirPath = pathParts.join("/");

    const directoryHandle = dirPath
      ? await this.getDirectoryByPath(dirPath, "deleteFile")
      : await this.getRootHandle();

    await directoryHandle.removeEntry(fileName);
  }

  // ฟังก์ชันสำหรับลบโฟลเดอร์
  async deleteDirectory(path: string): Promise<void> {
    const pathParts = path.split("/").filter((part) => part.length > 0);

    if (pathParts.length === 0) {
      throw new Error("ไม่สามารถลบโฟลเดอร์ root ได้");
    }

    const dirName = pathParts.pop()!;
    const parentPath = pathParts.join("/");

    const parentHandle = parentPath
      ? await this.getDirectoryByPath(parentPath, "deleteDirectory")
      : await this.getRootHandle();

    await parentHandle.removeEntry(dirName, { recursive: true });
  }

  // ฟังก์ชันสำหรับตรวจสอบว่าไฟล์มีอยู่หรือไม่
  async fileExists(path: string): Promise<boolean> {
    try {
      await this.getFileByPath(path);
      return true;
    } catch {
      return false;
    }
  }

  // ฟังก์ชันสำหรับตรวจสอบว่าโฟลเดอร์มีอยู่หรือไม่
  async directoryExists(path: string): Promise<boolean> {
    try {
      await this.getDirectoryByPath(path, "directoryExists");
      return true;
    } catch {
      return false;
    }
  }

  async clearDirectory(): Promise<void> {
    try {
      await this.fileSystemStore.delete(this.pathId);
    } catch (error) {
      console.warn("ไม่สามารถลบ handle จาก store:", error);
    }
    this.rootHandle = null;
  }

  async readFileAsText(path: string): Promise<string | undefined> {
    const file = await this.getFileByPath(path);
    return await file?.text();
  }

  async readFileAsArrayBuffer(path: string): Promise<ArrayBuffer | undefined> {
    const file = await this.getFileByPath(path);
    return await file?.arrayBuffer();
  }

  async listDirectory(
    path: string = ""
  ): Promise<{ name: string; kind: "file" | "directory" }[]> {
    const rootHandle = await this.getRootHandle();
    const pathParts = path.split("/").filter((part) => part.length > 0);

    let currentHandle: FileSystemDirectoryHandle = rootHandle;

    for (const part of pathParts) {
      currentHandle = await currentHandle.getDirectoryHandle(part);
    }

    const items: { name: string; kind: "file" | "directory" }[] = [];

    for await (const [name, handle] of currentHandle.entries()) {
      items.push({ name, kind: handle.kind });
    }

    return items;
  }

  hasHandle(): boolean {
    return this.rootHandle !== null;
  }

  getRootHandleSync(): FileSystemDirectoryHandle | null {
    return this.rootHandle;
  }

  async checkDirectoryStatus(): Promise<DirectoryStatus> {
    // 1. ตรวจสอบ handle ที่เคยบันทึกไว้ใน IndexedDB
    const savedHandleInfo = await this.fileSystemStore.get(this.pathId);
    if (!savedHandleInfo) {
      console.log("No saved handle. Needs selection.");
      return "SELECTION_NEEDED";
    }

    // 2. ตรวจสอบ Permission ของ handle ที่มีอยู่ (แบบเงียบ)
    // handle.queryPermission() จะไม่แสดง popup ใดๆ
    const permissionStatus = await savedHandleInfo.handle.queryPermission({
      mode: "readwrite",
    });

    if (permissionStatus === "granted") {
      console.log("Permission is already granted.");
      // ถ้าสิทธิ์ยังอยู่ ให้เก็บ handle ไว้ใน instance เพื่อการใช้งานครั้งต่อไป
      this.rootHandle = savedHandleInfo.handle;
      return "GRANTED";
    }

    if (permissionStatus === "prompt") {
      console.log("Permission needs to be requested again.");
      return "PROMPT_REQUIRED";
    }

    // กรณี permissionStatus === 'denied' หรืออื่นๆ
    console.log("Permission was denied or is in an unknown state.");
    return "SELECTION_NEEDED";
  }

  // เพิ่มฟังก์ชันสำหรับตรวจสอบ permission โดยไม่แสดง popup
  async hasSavedDirectory(): Promise<boolean> {
    const savedHandle = await this.queryPermission();
    return savedHandle !== null;
  }
}

export default FileSystemManager;
