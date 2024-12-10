interface TimePoint {
  tick: number;
  value: number[];
}

export class TickMapper {
  private timePoints: TimePoint[];

  constructor(data: Map<number, number[]>) {
    // แปลง Map เป็น array ของ TimePoint และเรียงตามลำดับ
    this.timePoints = Array.from(data.entries())
      .map(([tick, values]) => ({
        tick: Number(tick),
        value: values,
      }))
      .sort((a, b) => a.tick - b.tick);
  }

  reset() {
    this.timePoints = [];
  }
  getValue(tick: number): number[] {
    // ถ้า tick น้อยกว่าจุดแรก ใช้ค่าแรก
    if (tick <= this.timePoints[0].tick) {
      return this.timePoints[0].value;
    }

    // ถ้า tick มากกว่าจุดสุดท้าย ใช้ค่าสุดท้าย
    if (tick >= this.timePoints[this.timePoints.length - 1].tick) {
      return this.timePoints[this.timePoints.length - 1].value;
    }

    // Binary search
    let left = 0;
    let right = this.timePoints.length - 1;

    while (left < right - 1) {
      // หยุดเมื่อเหลือ 2 จุดที่ติดกัน
      const mid = Math.floor((left + right) / 2);
      if (this.timePoints[mid].tick === tick) {
        return this.timePoints[mid].value;
      }

      if (this.timePoints[mid].tick < tick) {
        left = mid;
      } else {
        right = mid;
      }
    }

    return this.timePoints[left].value;
  }
}
