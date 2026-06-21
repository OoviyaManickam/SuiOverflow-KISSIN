module kissin::trigger {
    use sui::clock::Clock;
    use sui::event;

    public struct RunKISSIN has copy, drop {
        epoch: u64,
        timestamp: u64,
    }

    public entry fun emit_trigger(clock: &Clock, ctx: &mut TxContext) {
        event::emit(RunKISSIN {
            epoch: tx_context::epoch(ctx),
            timestamp: clock.timestamp_ms(),
        });
    }
}
