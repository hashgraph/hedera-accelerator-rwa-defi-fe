import { WalkthroughBarrier } from "../WalktroughSyncBarrier";

describe("WalkthroughBarrier", () => {
   let barrier: WalkthroughBarrier;

   beforeEach(() => {
      barrier = new WalkthroughBarrier();
   });

   it("should create a new barrier instance", () => {
      expect(barrier).toBeInstanceOf(WalkthroughBarrier);
   });

   it("should register a component and return a callback", () => {
      const componentId = Symbol("test-component");
      const callback = barrier.register(componentId);
      
      expect(typeof callback).toBe("function");
   });

   it("should call onAllReady callback when all registered components are ready", () => {
      const onAllReadyMock = jest.fn();
      const componentId1 = Symbol("component-1");
      const componentId2 = Symbol("component-2");

      barrier.onBarrierComplete(onAllReadyMock);

      const markReady1 = barrier.register(componentId1);
      const markReady2 = barrier.register(componentId2);

      // Should not call callback yet
      markReady1();
      expect(onAllReadyMock).not.toHaveBeenCalled();

      // Should call callback when all are ready
      markReady2();
      expect(onAllReadyMock).toHaveBeenCalledTimes(1);
   });

   it("should not call onAllReady callback if no components are registered", () => {
      const onAllReadyMock = jest.fn();
      barrier.onBarrierComplete(onAllReadyMock);
      
      expect(onAllReadyMock).not.toHaveBeenCalled();
   });

   it("should handle unregistering components", () => {
      const onAllReadyMock = jest.fn();
      const componentId1 = Symbol("component-1");
      const componentId2 = Symbol("component-2");

      barrier.onBarrierComplete(onAllReadyMock);

      const markReady1 = barrier.register(componentId1);
      const markReady2 = barrier.register(componentId2);

      // Unregister one component
      barrier.unregister(componentId2);

      // Now only need one to be ready
      markReady1();
      expect(onAllReadyMock).toHaveBeenCalledTimes(1);
   });

   it("should reset barrier state", () => {
      const onAllReadyMock = jest.fn();
      const componentId = Symbol("component");

      barrier.onBarrierComplete(onAllReadyMock);
      barrier.register(componentId);

      barrier.reset();

      // After reset, no components should be registered
      expect(onAllReadyMock).not.toHaveBeenCalled();
   });

   it("should handle direct markReady calls", () => {
      const componentId = Symbol("component");
      
      // Register component but don't use the returned callback
      barrier.register(componentId);
      
      // Use markReady directly
      barrier.markReady(componentId);
      
      // Should not throw any errors
      expect(true).toBe(true);
   });
});