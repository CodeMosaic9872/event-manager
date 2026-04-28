export declare class ReferralsService {
    getLink(supplierId: string): {
        supplierId: string;
        code: string;
        url: string;
    };
    regenerateLink(supplierId: string): {
        supplierId: string;
        code: string;
        url: string;
    };
    listAttributions(supplierId: string): {
        supplierId: string;
        attributions: never[];
    };
    listRewards(supplierId: string): {
        supplierId: string;
        rewards: never[];
    };
}
