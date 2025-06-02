import { DircetoryLocalSongsManager } from "../indexedDB/db/local-songs/table";

class FileSystemManager {
  private pathId: number = 1;
  private static instance: FileSystemManager;
  private rootHandle: FileSystemDirectoryHandle | null = null;
  private fileSystemStore = new DircetoryLocalSongsManager();

  private constructor() {}

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
    await this.fileSystemStore.add({ handle });
    return handle;
  }

  async getRootHandle(): Promise<FileSystemDirectoryHandle> {
    if (this.rootHandle) {
      return this.rootHandle;
    }

    const savedHandle = await this.fileSystemStore.get(this.pathId);
    if (savedHandle) {
      try {
        await savedHandle.handle.queryPermission();
        this.rootHandle = savedHandle.handle;
        return savedHandle.handle;
      } catch {}
    }

    return await this.selectDirectory();
  }

  async getFileByPath(path: string): Promise<File> {
    const rootHandle = await this.getRootHandle();
    const pathParts = path.split("/").filter((part) => part.length > 0);

    let currentHandle: FileSystemDirectoryHandle | FileSystemFileHandle =
      rootHandle;

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];

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
      ? await this.getDirectoryByPath(dirPath)
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
    path: string
  ): Promise<FileSystemDirectoryHandle> {
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
      ? await this.getDirectoryByPath(dirPath)
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
      ? await this.getDirectoryByPath(parentPath)
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
      await this.getDirectoryByPath(path);
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

  async readFileAsText(path: string): Promise<string> {
    const file = await this.getFileByPath(path);
    return await file.text();
  }

  async readFileAsArrayBuffer(path: string): Promise<ArrayBuffer> {
    const file = await this.getFileByPath(path);
    return await file.arrayBuffer();
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
}

export default FileSystemManager;
