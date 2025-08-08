export class WalkthroughBarrier {
   private participants = new Set();
   private ready = new Set();
   private onAllReady: Function | null = null;

   register(componentId: Symbol) {
      this.participants.add(componentId);
      return () => this.markReady(componentId);
   }

   markReady(componentId: Symbol) {
      this.ready.add(componentId);
      if (this.ready.size === this.participants.size && this.onAllReady) {
         this.onAllReady();
      }
   }

   unregister(componentId: Symbol) {
      this.participants.delete(componentId);
      this.ready.delete(componentId);
   }

   onBarrierComplete(callback: Function) {
      this.onAllReady = callback;
   }

   reset() {
      this.participants.clear();
      this.ready.clear();
   }
}

const walkthroughBarrier = new WalkthroughBarrier();
export { walkthroughBarrier };
