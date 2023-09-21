import { Native } from "./Native";

interface NativeShell {
  /**
   * Executes an command without result
   */
  exec(command: string): void;
  /**
   * Executes an command with result
   */
  result(command: string): string;
  isSuccess(command: string): boolean;
  getCode(command: string): number;
  /**
   * Checks if the app has been granted root privileges
   * @deprecated Use `Shell.isSuAvailable()` instead
   */
  isAppGrantedRoot(): boolean;
  /**
   * Checks if the app has been granted root privileges
   */
  isSuAvailable(): boolean;
  isKernelSU(): boolean;
  isMagiskSU(): boolean;
}

interface IShell {
  exec(): void;
  result(): string;
}

/**
 * Run Shell commands native on Android
 */

class ShellClass extends Native<NativeShell> {
  private _command: string;
  public constructor() {
    super();
    this._command = "";
    this.interfaceName = "__shell__";
  }

  public cmd(cmd: string): this {
    this._command = cmd;
    return this;
  }

  public exec(): void {
    if (this.isAndroid) {
      this.getInterface.exec(this._command);
    }
  }

  public result(): string {
    if (this.isAndroid) {
      return this.getInterface.result(this._command);
    } else {
      return this._command;
    }
  }

  public isSuccess(): boolean {
    if (this.isAndroid) {
      return this.getInterface.isSuccess(this._command);
    } else {
      return false;
    }
  }

  public getCode(): number {
    if (this.isAndroid) {
      return this.getInterface.getCode(this._command);
    } else {
      return 1;
    }
  }
  /**
   * Checks if the app has been granted root privileges
   * @deprecated Use `Shell.isSuAvailable()` instead
   */
  public isAppGrantedRoot(): boolean {
    return this.getInterface.isAppGrantedRoot();
  }

  /**
   * Checks if the app has been granted root privileges
   */
  public isSuAvailable(): boolean {
    return this.getInterface.isSuAvailable();
  }

  /**
   * Get current installed Superuser version code
   */
  public VERSION_CODE(): number {
    if (this.isAndroid) {
      return parseInt(this.getInterface.result("su -V"));
    } else {
      return 0;
    }
  }

  public VERSION_NAME(): string {
    if (this.isAndroid) {
      return this.getInterface.result("su -v");
    } else {
      return "0:SU";
    }
  }

  public getRootManager(): string {
    if (this.isMagiskSU()) {
      return "Mang. by Magisk";
    } else if (this.isKernelSU()) {
      return "Mang. by KernelSU";
    } else {
      return "Mang. by Unknown";
    }
  }

  /**
   * Determine if MMRL runs with KernelSU
   */
  public isKernelSU(): boolean {
    if (this.isAndroid) {
      return this.getInterface.isKernelSU();
    } else {
      return false;
    }
  }

  /**
   * Determine if MMRL runs with Magisk
   */
  public isMagiskSU(): boolean {
    if (this.isAndroid) {
      return this.getInterface.isMagiskSU();
    } else {
      return false;
    }
  }
}

export const Shell: ShellClass = new ShellClass();