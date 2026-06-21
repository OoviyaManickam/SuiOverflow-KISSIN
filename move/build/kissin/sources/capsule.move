module kissin::capsule {
    use std::string::String;
    use sui::clock::Clock;

    public struct KISSINCapsule has key, store {
        id: UID,
        topic: String,
        verdict: String,
        confidence: u8,
        walrus_blob_id: String,
        epoch: u64,
        timestamp: u64,
    }

    public entry fun mint_capsule(
        topic: String,
        verdict: String,
        confidence: u8,
        walrus_blob_id: String,
        recipient: address,
        clock: &Clock,
        ctx: &mut TxContext,
    ) {
        let capsule = KISSINCapsule {
            id: object::new(ctx),
            topic,
            verdict,
            confidence,
            walrus_blob_id,
            epoch: tx_context::epoch(ctx),
            timestamp: clock.timestamp_ms(),
        };
        transfer::transfer(capsule, recipient);
    }
}
