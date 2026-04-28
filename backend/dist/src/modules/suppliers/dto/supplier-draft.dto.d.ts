export declare class UpsertSupplierDraftDto {
    supplierId: string;
    stepKey: string;
    completionPercent: number;
    payloadJson: Record<string, unknown>;
    version?: number;
}
