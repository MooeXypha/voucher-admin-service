export class GenerateVoucher {
  // stable date per day
  static encryptDate(date: Date = new Date()): string {
    const y = date.getFullYear(); // 2026
    const m = (date.getMonth() + 1).toString().padStart(2, '0'); // 03
    const d = date.getDate().toString().padStart(2, '0'); // 26

    const numeric = `${y}${m}${d}`; // "20260326"

    return parseInt(numeric).toString(36); // "mn76lp" -> same for all vouchers today
  }

  static decryptDate(code: string): Date {
    const num = parseInt(code, 36);
    const str = num.toString();
    const y = Number(str.slice(0, 4));
    const m = Number(str.slice(4, 6)) - 1;
    const d = Number(str.slice(6, 8));
    return new Date(y, m, d);
  }

  static generateVoucherNo(
    prefix: string,
    lastNo: number,
    date: Date = new Date(),
  ): string {
    const dateCode = this.encryptDate(date);
    return `${prefix}-${dateCode}-${String(lastNo + 1).padStart(4, '0')}`;
  }

  static getRunningNo(voucherNo?: string | null): number {
    if (!voucherNo) return 0;
    return Number(voucherNo.split('-')[2]) || 0;
  }

  static getDateFromVoucher(voucherNo: string): Date {
    const code = voucherNo.split('-')[1];
    return this.decryptDate(code);
  }
}
