export default class Mutex {
  private locking: any = Promise.resolve();
  private locks = 0;

  public isLocked() {
    return this.locks > 0;
  }

  public lock() {
    this.locks += 1;

    let unlockNext: any;

    let willLock = new Promise(
      resolve =>
        (unlockNext = () => {
          this.locks -= 1;

          resolve();
        })
    );

    let willUnlock = this.locking.then(() => unlockNext);

    this.locking = this.locking.then(() => willLock);

    return willUnlock;
  }
}
